import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_STYLES = {
  LIVE: "bg-green-500 text-white",
  SCHEDULED: "bg-muted text-muted-foreground",
  FINISHED: "bg-secondary text-secondary-foreground",
  POSTPONED: "bg-yellow-500 text-white",
  CANCELLED: "bg-destructive text-destructive-foreground",
};

function formatKickoff(kickoff) {
  const d = new Date(kickoff);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MatchCard({ match }) {
  const { id, homeTeam, awayTeam, homeScore, awayScore, status, kickoff, league } = match;

  return (
    <Link to={`/matches/${id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate mb-1">{league}</p>
              <div className="flex items-center gap-3">
                <span className="font-medium truncate flex-1 text-right">{homeTeam}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {status === "SCHEDULED" ? (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatKickoff(kickoff)}
                    </span>
                  ) : (
                    <span className="font-bold text-lg tabular-nums">
                      {homeScore ?? 0} – {awayScore ?? 0}
                    </span>
                  )}
                </div>
                <span className="font-medium truncate flex-1">{awayTeam}</span>
              </div>
            </div>
            <Badge className={STATUS_STYLES[status] ?? ""}>
              {status === "LIVE" && (
                <span className="inline-block h-2 w-2 rounded-full bg-white mr-1 animate-pulse" />
              )}
              {status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
