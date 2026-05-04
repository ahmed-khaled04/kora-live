import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getSocket } from "@/socket/socket";
import * as notificationsApi from "@/api/notifications";

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.getNotifications,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (notification) => {
      queryClient.setQueryData(["notifications"], (old = []) => [
        notification,
        ...old,
      ]);
    };

    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [queryClient]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const { mutate: markRead } = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: (_, id) => {
      queryClient.setQueryData(["notifications"], (old = []) =>
        old.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.setQueryData(["notifications"], (old = []) =>
        old.map((n) => ({ ...n, read: true }))
      );
    },
  });

  return { notifications, unreadCount, markRead, markAllRead };
}
