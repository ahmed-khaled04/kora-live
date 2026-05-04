import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProfile, getFollowers, getFollowing } from "@/api/users";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/FollowButton";
import { Link } from "react-router-dom";

function UserRow({ user }) {
  return (
    <Link
      to={`/users/${user.id}`}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">
          {user.username[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium">{user.username}</span>
    </Link>
  );
}

function UserList({ fetchFn, queryKey }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: [...queryKey, page], queryFn: () => fetchFn(page) });
  const items = data?.followers ?? data?.followings ?? [];
  const total = data?.total ?? 0;

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">None yet.</p>;

  return (
    <div className="space-y-2">
      {items.map((u) => <UserRow key={u.id} user={u} />)}
      {total > items.length * page && (
        <div className="flex justify-center gap-2 pt-2">
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

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["users", id],
    queryFn: () => getProfile(id),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading profile...</p>;
  if (!profile) return <p className="text-destructive">User not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-2xl">
            {profile.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-bold text-xl">{profile.username}</h1>
          <div className="flex gap-4 mt-1">
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">{profile.followersCount}</strong> followers
            </span>
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">{profile.followingCount}</strong> following
            </span>
          </div>
        </div>
        {!isOwnProfile && <FollowButton userId={id} />}
      </div>

      <Tabs defaultValue="followers">
        <TabsList>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <TabsContent value="followers" className="mt-4">
          <UserList
            fetchFn={(page) => getFollowers(id, page)}
            queryKey={["users", id, "followers"]}
          />
        </TabsContent>
        <TabsContent value="following" className="mt-4">
          <UserList
            fetchFn={(page) => getFollowing(id, page)}
            queryKey={["users", id, "following"]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
