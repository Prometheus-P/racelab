-- Migration: 003_b2b_clients
-- Date: 2025-12-18
-- Description: Add B2B client management tables for API monetization

-- ====================================================
-- Enum Types
-- ====================================================

CREATE TYPE client_tier AS ENUM ('Bronze', 'Silver', 'Gold');
CREATE TYPE client_status AS ENUM ('active', 'suspended', 'expired');

-- ====================================================
-- Clients Table
-- ====================================================

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(128) NOT NULL,
    api_key_prefix VARCHAR(8) NOT NULL,
    tier client_tier NOT NULL DEFAULT 'Bronze',
    status client_status NOT NULL DEFAULT 'active',
    rate_limit_override INTEGER,
    metadata TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_clients_api_key_prefix ON clients(api_key_prefix);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_tier ON clients(tier);

-- ====================================================
-- API Usage Table (TimescaleDB Hypertable)
-- ====================================================

CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL,
    client_id INTEGER REFERENCES clients(id) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Convert to hypertable for efficient time-series queries
-- Partitioned by day for optimal query performance
SELECT create_hypertable('api_usage', 'created_at',
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE
);

-- Indexes for usage queries
CREATE INDEX idx_api_usage_client_time ON api_usage(client_id, created_at DESC);
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint, created_at DESC);

-- ====================================================
-- Compression Policy (for data older than 7 days)
-- ====================================================

ALTER TABLE api_usage SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'client_id',
    timescaledb.compress_orderby = 'created_at DESC'
);

SELECT add_compression_policy('api_usage', INTERVAL '7 days', if_not_exists => TRUE);

-- ====================================================
-- Continuous Aggregate: Daily Usage Summary
-- ====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS api_usage_daily
WITH (timescaledb.continuous) AS
SELECT
    client_id,
    time_bucket('1 day', created_at) AS day,
    endpoint,
    COUNT(*) AS request_count,
    AVG(response_time_ms) AS avg_response_time_ms,
    SUM(response_size_bytes) AS total_response_bytes,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) AS error_count
FROM api_usage
GROUP BY client_id, time_bucket('1 day', created_at), endpoint
WITH NO DATA;

-- Refresh policy: update every hour, keep last 30 days
SELECT add_continuous_aggregate_policy('api_usage_daily',
    start_offset => INTERVAL '30 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => TRUE
);

-- ====================================================
-- Helper Function: Update timestamp trigger
-- ====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
