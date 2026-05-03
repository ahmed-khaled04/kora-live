import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "@/components/NotificationItem";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead()}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 && (
        <p className="text-muted-foreground text-sm">No notifications yet.</p>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={markRead} />
        ))}
      </div>
    </div>
  );
}
