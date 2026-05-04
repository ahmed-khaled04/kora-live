import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/api/leaderboard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PERIODS = [
  { value: "all", label: "All Time" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("all");
  const [page, setPage] = useState(1);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["leaderboard", period, page],
    queryFn: () => getLeaderboard(period, page),
  });

  const handlePeriodChange = (val) => {
    setPeriod(val);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-2xl">Leaderboard</h1>

      <Tabs value={period} onValueChange={handlePeriodChange}>
        <TabsList>
          {PERIODS.map((p) => (
            <TabsTrigger key={p.value} value={p.value}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}

      {!isLoading && entries.length === 0 && (
        <p className="text-muted-foreground text-sm">No predictions scored yet.</p>
      )}

      <div className="space-y-2">
        {entries.map(({ rank, user, points }) => (
          <Link
            to={`/users/${user.id}`}
            key={user.id}
            className="flex items-center gap-4 px-4 py-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <span className="text-muted-foreground w-6 text-right font-mono text-sm">
              {rank}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 font-medium">{user.username}</span>
            <span className="font-bold tabular-nums">
              {points ?? 0} <span className="text-muted-foreground font-normal text-sm">pts</span>
            </span>
          </Link>
        ))}
      </div>

      {entries.length === 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
