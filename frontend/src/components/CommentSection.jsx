import { useState, useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComments, postComment } from "@/api/matches";
import { getSocket } from "@/socket/socket";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CommentSection({ matchId }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["matches", matchId, "comments"],
    queryFn: ({ pageParam = 1 }) => getComments(matchId, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.comments.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });

  const allComments = data?.pages.flatMap((p) => p.comments) ?? [];

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = ({ comment }) => {
      queryClient.setQueryData(["matches", matchId, "comments"], (old) => {
        if (!old) return old;
        const exists = old.pages.some((p) => p.comments.some((c) => c.id === comment.id));
        if (exists) return old;
        return {
          ...old,
          pages: old.pages.map((page, i) =>
            i === 0
              ? { ...page, comments: [comment, ...page.comments], total: page.total + 1 }
              : page
          ),
        };
      });
    };
    socket.on("comment:created", handler);
    return () => socket.off("comment:created", handler);
  }, [matchId, queryClient]);

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => postComment(matchId, text),
    onSuccess: () => setText(""),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    submit();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Comments</h3>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || !text.trim()}>
          Post
        </Button>
      </form>

      <div className="space-y-3">
        {allComments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">
                {comment.user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{comment.user.username}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
              </div>
              <p className="text-sm mt-0.5 break-words">{comment.content}</p>
            </div>
          </div>
        ))}

        {allComments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first!
          </p>
        )}

        {hasNextPage && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more comments"}
          </Button>
        )}
      </div>
    </div>
  );
}
