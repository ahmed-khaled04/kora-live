import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { postPrediction } from "@/api/matches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PredictionForm({ matchId, homeTeam, awayTeam }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { mutate, isPending, error } = useMutation({
    mutationFn: () =>
      postPrediction(matchId, parseInt(home, 10), parseInt(away, 10)),
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <Card>
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          Prediction submitted: {home} – {away}
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (home === "" || away === "") return;
    mutate();
  };

  const errMsg = error?.response?.data?.message ?? error?.message;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Your Prediction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-right">
              <p className="text-sm text-muted-foreground mb-1 truncate">{homeTeam}</p>
              <Input
                type="number"
                min="0"
                value={home}
                onChange={(e) => setHome(e.target.value)}
                className="text-center"
                placeholder="0"
                disabled={isPending}
              />
            </div>
            <span className="text-muted-foreground font-bold pt-5">–</span>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1 truncate">{awayTeam}</p>
              <Input
                type="number"
                min="0"
                value={away}
                onChange={(e) => setAway(e.target.value)}
                className="text-center"
                placeholder="0"
                disabled={isPending}
              />
            </div>
          </div>

          {errMsg && <p className="text-destructive text-sm">{errMsg}</p>}

          <Button type="submit" className="w-full" disabled={isPending || home === "" || away === ""}>
            {isPending ? "Submitting..." : "Submit Prediction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
