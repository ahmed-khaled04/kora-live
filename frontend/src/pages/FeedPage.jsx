import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLiveMatches, getUpcomingMatches } from "@/api/matches";
import MatchCard from "@/components/MatchCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const LIMIT = 10;

function MatchList({ queryKey, queryFn, emptyText, refetchInterval }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: [...queryKey, page],
    queryFn: () => queryFn(page, LIMIT),
    refetchInterval,
  });

  const matches = data?.matches ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (matches.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const [tab, setTab] = useState("live");

  return (
    <div className="space-y-4">
      <h1 className="font-bold text-2xl">Matches</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "live" && (
        <MatchList
          queryKey={["matches", "live"]}
          queryFn={getLiveMatches}
          emptyText="No matches live right now."
          refetchInterval={30000}
        />
      )}
      {tab === "upcoming" && (
        <MatchList
          queryKey={["matches", "upcoming"]}
          queryFn={getUpcomingMatches}
          emptyText="No upcoming matches."
        />
      )}
    </div>
  );
}
