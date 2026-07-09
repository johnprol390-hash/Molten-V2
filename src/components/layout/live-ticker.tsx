"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TickerEvent {
  id: string;
  type: string;
  message: string;
  tokenId?: string;
}

export function LiveTicker() {
  const [events, setEvents] = useState<TickerEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/ticker");
        const data = await res.json();
        setEvents(data);
      } catch {
        // ignore
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  if (events.length === 0) return null;

  const doubled = [...events, ...events];

  return (
    <div className="bg-muted/50 border-b border-border overflow-hidden h-8 flex items-center">
      <div className="animate-ticker flex whitespace-nowrap gap-8 px-4">
        {doubled.map((event, i) => (
          <Link
            key={`${event.id}-${i}`}
            href={event.tokenId ? `/token/${event.tokenId}` : "#"}
            className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            {event.message}
          </Link>
        ))}
      </div>
    </div>
  );
}
