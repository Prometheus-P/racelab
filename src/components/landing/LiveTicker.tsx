'use client';

interface TickerItem {
  track: string;
  race: string;
  change: number;
  odds?: number;
}

const TICKER_DATA: TickerItem[] = [
  { track: '서울', race: '1R', change: 2.3, odds: 4.5 },
  { track: '부산', race: '2R', change: -1.1, odds: 2.8 },
  { track: '제주', race: '3R', change: 4.7, odds: 6.2 },
  { track: '광명', race: '4R', change: -0.5, odds: 3.1 },
  { track: '창원', race: '5R', change: 3.2, odds: 5.8 },
  { track: '미사리', race: '6R', change: 1.8, odds: 4.0 },
  { track: '서울', race: '7R', change: -2.3, odds: 2.5 },
  { track: '부산', race: '8R', change: 5.1, odds: 7.3 },
];

function TickerItemDisplay({ item }: { item: TickerItem }) {
  const isPositive = item.change >= 0;

  return (
    <div className="flex items-center gap-2 px-4">
      <span className="text-label-medium text-white/70">
        {item.track} {item.race}
      </span>
      {item.odds && (
        <span className="font-mono text-label-medium font-semibold text-white">
          {item.odds.toFixed(1)}
        </span>
      )}
      <span
        className={`font-mono text-label-medium font-bold ${
          isPositive ? 'text-bullish' : 'text-bearish'
        }`}
      >
        {isPositive ? '+' : ''}
        {item.change.toFixed(1)}%
      </span>
    </div>
  );
}

export function LiveTicker() {
  // Duplicate the data for seamless loop
  const items = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div className="bg-neutral-text-primary overflow-hidden border-y border-neutral-700">
      <div className="relative flex py-2">
        {/* Live indicator */}
        <div className="absolute left-0 top-0 z-10 flex h-full items-center gap-2 bg-gradient-to-r from-neutral-text-primary via-neutral-text-primary to-transparent pl-4 pr-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bullish opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-bullish" />
          </span>
          <span className="text-label-small font-semibold text-white/80">LIVE</span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex animate-marquee whitespace-nowrap pl-24">
          {items.map((item, index) => (
            <TickerItemDisplay key={`${item.track}-${item.race}-${index}`} item={item} />
          ))}
        </div>

        {/* Fade out on right */}
        <div className="absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-neutral-text-primary to-transparent" />
      </div>
    </div>
  );
}
