import { cn } from "@/lib/utils";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function notificationText(type, payload) {
  if (type === "FOLLOWER_PREDICTION") {
    return "Someone you follow made a prediction on a match.";
  }
  if (type === "PREDICTION_SCORED") {
    return `Your prediction was scored — you earned ${payload?.points ?? 0} point${payload?.points === 1 ? "" : "s"}.`;
  }
  return "You have a new notification.";
}

export default function NotificationItem({ notification, onRead }) {
  const { id, type, payload, read, createdAt } = notification;

  return (
    <div
      onClick={() => !read && onRead(id)}
      className={cn(
        "flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors",
        read ? "bg-card" : "bg-primary/5 border-primary/20 hover:bg-primary/10"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !read && "font-medium")}>
          {notificationText(type, payload)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(createdAt)}</p>
      </div>
      {!read && (
        <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
      )}
    </div>
  );
}
