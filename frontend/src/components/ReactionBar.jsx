import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReactions, postReaction, deleteReaction } from "@/api/matches";
import { useEffect } from "react";
import { getSocket } from "@/socket/socket";

const REACTIONS = [
  { type: "FIRE", emoji: "🔥" },
  { type: "GOAL", emoji: "⚽" },
  { type: "SHOCKED", emoji: "😮" },
  { type: "LAUGH", emoji: "😂" },
  { type: "SAD", emoji: "😢" },
];

export default function ReactionBar({ matchId }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);

  const { data: counts = {} } = useQuery({
    queryKey: ["matches", matchId, "reactions"],
    queryFn: () => getReactions(matchId),
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = ({ counts }) => {
      queryClient.setQueryData(["matches", matchId, "reactions"], counts);
    };
    socket.on("reaction:updated", handler);
    return () => socket.off("reaction:updated", handler);
  }, [matchId, queryClient]);

  const { mutate: react } = useMutation({
    mutationFn: (type) =>
      selected === type ? deleteReaction(matchId) : postReaction(matchId, type),
    onMutate: (type) => {
      setSelected((prev) => (prev === type ? null : type));
    },
  });

  return (
    <div className="flex gap-2 flex-wrap">
      {REACTIONS.map(({ type, emoji }) => (
        <button
          key={type}
          onClick={() => react(type)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-colors
            ${selected === type
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border hover:bg-accent"
            }`}
        >
          <span>{emoji}</span>
          <span className="tabular-nums">{counts[type] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
