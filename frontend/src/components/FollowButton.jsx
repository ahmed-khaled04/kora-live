import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { follow, unfollow } from "@/api/users";
import { Button } from "@/components/ui/button";

export default function FollowButton({ userId, initialFollowing = false }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);

  const { mutate, isPending } = useMutation({
    mutationFn: () => (isFollowing ? unfollow(userId) : follow(userId)),
    onSuccess: () => setIsFollowing((prev) => !prev),
  });

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      onClick={() => mutate()}
      disabled={isPending}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
