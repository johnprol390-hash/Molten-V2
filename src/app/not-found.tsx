import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <p className="text-8xl mb-6 animate-pulse">🌋</p>
      <h1 className="text-4xl font-bold mb-3">404 — Lost in the Lava</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        This page got melted. Maybe it graduated to another dimension?
      </p>
      <Button variant="molten" asChild>
        <Link href="/">Back to the Board</Link>
      </Button>
    </div>
  );
}
