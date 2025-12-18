-- Migration: 004_quantlab_tier
-- Date: 2025-12-18
-- Description: Add QuantLab tier for advanced backtesting features

-- ====================================================
-- Add QuantLab to client_tier enum
-- ====================================================

-- PostgreSQL requires creating a new enum type to add values safely
-- First, add the new value to the enum
ALTER TYPE client_tier ADD VALUE IF NOT EXISTS 'QuantLab' AFTER 'Gold';

-- ====================================================
-- Add backtest quota columns to clients table
-- ====================================================

-- Monthly backtest quota (-1 = unlimited)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS backtest_quota_monthly INTEGER DEFAULT 0;

-- Used backtest count this month
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS backtest_quota_used INTEGER DEFAULT 0;

-- Quota reset timestamp
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS backtest_quota_reset_at TIMESTAMPTZ;

-- Max concurrent backtest jobs
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS backtest_concurrent_limit INTEGER DEFAULT 0;

-- Max backtest period in days
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS backtest_max_period_days INTEGER DEFAULT 0;

-- ====================================================
-- Backtest Jobs Table
-- ====================================================

CREATE TYPE backtest_job_status AS ENUM (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled'
);

CREATE TYPE backtest_job_priority AS ENUM (
    'low',
    'normal',
    'high'
);

CREATE TABLE IF NOT EXISTS backtest_jobs (
    id VARCHAR(50) PRIMARY KEY,  -- UUID
    client_id INTEGER REFERENCES clients(id) NOT NULL,

    -- Status tracking
    status backtest_job_status NOT NULL DEFAULT 'pending',
    priority backtest_job_priority NOT NULL DEFAULT 'normal',
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    progress_message TEXT,

    -- Request data (JSON)
    request_data JSONB NOT NULL,

    -- Execution metrics
    processed_races INTEGER DEFAULT 0,
    total_races INTEGER DEFAULT 0,
    estimated_duration_seconds INTEGER,
    execution_time_ms INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Error handling
    error_code VARCHAR(50),
    error_message TEXT,
    error_details TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- QStash integration
    qstash_message_id VARCHAR(100),

    -- Webhook notification
    webhook_url TEXT
);

-- Indexes for job queries
CREATE INDEX idx_backtest_jobs_client ON backtest_jobs(client_id);
CREATE INDEX idx_backtest_jobs_status ON backtest_jobs(status);
CREATE INDEX idx_backtest_jobs_created ON backtest_jobs(created_at DESC);
CREATE INDEX idx_backtest_jobs_client_status ON backtest_jobs(client_id, status);

-- ====================================================
-- Backtest Results Table
-- ====================================================

CREATE TABLE IF NOT EXISTS backtest_results (
    id SERIAL PRIMARY KEY,
    job_id VARCHAR(50) REFERENCES backtest_jobs(id) ON DELETE CASCADE NOT NULL,

    -- Summary metrics
    total_races INTEGER NOT NULL,
    matched_races INTEGER NOT NULL,
    total_bets INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    refunds INTEGER DEFAULT 0,

    -- Performance metrics
    win_rate DECIMAL(5, 2),        -- %
    roi DECIMAL(8, 2),             -- %
    max_drawdown DECIMAL(8, 2),    -- %
    final_capital BIGINT,          -- KRW
    capital_return DECIMAL(8, 2),  -- %
    avg_odds DECIMAL(6, 2),
    avg_bet_amount BIGINT,
    max_win_streak INTEGER,
    max_lose_streak INTEGER,

    -- Full result data (JSONB for flexibility)
    full_result JSONB,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL  -- For cleanup
);

CREATE INDEX idx_backtest_results_job ON backtest_results(job_id);
CREATE INDEX idx_backtest_results_expires ON backtest_results(expires_at);

-- ====================================================
-- Saved Strategies Table
-- ====================================================

CREATE TABLE IF NOT EXISTS saved_strategies (
    id VARCHAR(100) PRIMARY KEY,  -- strategy id from JSON
    client_id INTEGER REFERENCES clients(id) NOT NULL,

    -- Strategy data
    name VARCHAR(200) NOT NULL,
    version VARCHAR(20) NOT NULL,
    strategy_data JSONB NOT NULL,

    -- Metadata
    description TEXT,
    tags TEXT[],
    is_public BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_saved_strategies_client ON saved_strategies(client_id);
CREATE INDEX idx_saved_strategies_tags ON saved_strategies USING GIN(tags);

-- Trigger for updated_at
CREATE TRIGGER update_saved_strategies_updated_at
    BEFORE UPDATE ON saved_strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================
-- Backtest Usage Summary (for billing/analytics)
-- ====================================================

CREATE TABLE IF NOT EXISTS backtest_usage (
    id SERIAL,
    client_id INTEGER REFERENCES clients(id) NOT NULL,
    job_id VARCHAR(50) REFERENCES backtest_jobs(id),

    -- Usage metrics
    period_days INTEGER NOT NULL,
    races_processed INTEGER NOT NULL,
    execution_time_ms INTEGER NOT NULL,

    -- Billing period
    billing_month DATE NOT NULL,  -- First day of the month

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Convert to hypertable for time-series queries
SELECT create_hypertable('backtest_usage', 'created_at',
    chunk_time_interval => INTERVAL '1 month',
    if_not_exists => TRUE
);

CREATE INDEX idx_backtest_usage_client_month ON backtest_usage(client_id, billing_month);

-- ====================================================
-- Update existing clients with default backtest quotas
-- ====================================================

-- Bronze/Silver: No backtest access (default 0)
-- Gold: 10 backtests/month, 2 concurrent, 90 days max
-- QuantLab: Unlimited (-1), 10 concurrent, 365 days max

UPDATE clients SET
    backtest_quota_monthly =
        CASE tier
            WHEN 'Gold' THEN 10
            WHEN 'QuantLab' THEN -1
            ELSE 0
        END,
    backtest_concurrent_limit =
        CASE tier
            WHEN 'Gold' THEN 2
            WHEN 'QuantLab' THEN 10
            ELSE 0
        END,
    backtest_max_period_days =
        CASE tier
            WHEN 'Gold' THEN 90
            WHEN 'QuantLab' THEN 365
            ELSE 0
        END,
    backtest_quota_reset_at = date_trunc('month', NOW()) + INTERVAL '1 month'
WHERE backtest_quota_reset_at IS NULL;

-- ====================================================
-- Function: Reset monthly backtest quotas
-- ====================================================

CREATE OR REPLACE FUNCTION reset_backtest_quotas()
RETURNS void AS $$
BEGIN
    UPDATE clients
    SET
        backtest_quota_used = 0,
        backtest_quota_reset_at = date_trunc('month', NOW()) + INTERVAL '1 month'
    WHERE backtest_quota_reset_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- Cleanup Policy: Delete old results after expiry
-- ====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_backtest_results()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM backtest_results
        WHERE expires_at < NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ====================================================
-- Comments for documentation
-- ====================================================

COMMENT ON COLUMN clients.backtest_quota_monthly IS 'Monthly backtest quota. -1 = unlimited';
COMMENT ON COLUMN clients.backtest_quota_used IS 'Number of backtests used this month';
COMMENT ON COLUMN clients.backtest_concurrent_limit IS 'Max concurrent running backtest jobs';
COMMENT ON COLUMN clients.backtest_max_period_days IS 'Max date range for single backtest (days)';

COMMENT ON TABLE backtest_jobs IS 'Tracks backtest job status and progress';
COMMENT ON TABLE backtest_results IS 'Stores backtest results with TTL';
COMMENT ON TABLE saved_strategies IS 'User-saved betting strategies';
COMMENT ON TABLE backtest_usage IS 'Tracks backtest usage for billing';
