import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMatch } from "@/api/matches";
import { getSocket } from "@/socket/socket";
import { Badge } from "@/components/ui/badge";
import ReactionBar from "@/components/ReactionBar";
import CommentSection from "@/components/CommentSection";
import PredictionForm from "@/components/PredictionForm";

const STATUS_STYLES = {
  LIVE: "bg-green-500 text-white",
  SCHEDULED: "bg-muted text-muted-foreground",
  FINISHED: "bg-secondary text-secondary-foreground",
  POSTPONED: "bg-yellow-500 text-white",
  CANCELLED: "bg-destructive text-destructive-foreground",
};

function formatKickoff(kickoff) {
  return new Date(kickoff).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: match, isLoading, error } = useQuery({
    queryKey: ["matches", id],
    queryFn: () => getMatch(id),
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("match:join", { matchId: id });

    const handleUpdate = (updatedMatch) => {
      queryClient.setQueryData(["matches", id], updatedMatch);
    };

    socket.on("match:updated", handleUpdate);
    return () => {
      socket.emit("match:leave", { matchId: id });
      socket.off("match:updated", handleUpdate);
    };
  }, [id, queryClient]);

  if (isLoading) return <p className="text-muted-foreground">Loading match...</p>;
  if (error) return <p className="text-destructive">Match not found.</p>;

  const { homeTeam, awayTeam, homeScore, awayScore, status, kickoff, league, venue } = match;

  return (
    <div className="space-y-6">
      {/* Match header */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{league}</p>
        <div className="flex items-center justify-center gap-6">
          <span className="font-bold text-xl flex-1 text-right">{homeTeam}</span>
          <div className="text-center">
            {status === "SCHEDULED" ? (
              <p className="text-muted-foreground text-sm">{formatKickoff(kickoff)}</p>
            ) : (
              <p className="font-bold text-4xl tabular-nums">
                {homeScore ?? 0} – {awayScore ?? 0}
              </p>
            )}
            <Badge className={`mt-1 ${STATUS_STYLES[status] ?? ""}`}>
              {status === "LIVE" && (
                <span className="inline-block h-2 w-2 rounded-full bg-white mr-1 animate-pulse" />
              )}
              {status}
            </Badge>
          </div>
          <span className="font-bold text-xl flex-1">{awayTeam}</span>
        </div>
        {venue && <p className="text-xs text-muted-foreground">{venue}</p>}
      </div>

      <ReactionBar matchId={id} />

      {status === "SCHEDULED" && (
        <PredictionForm matchId={id} homeTeam={homeTeam} awayTeam={awayTeam} />
      )}

      <CommentSection matchId={id} />
    </div>
  );
}
