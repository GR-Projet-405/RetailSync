import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Clock,
  Inbox,
  MessageSquare,
  Package,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { cn } from "../utils/cn";
import {
  NOTIFICATION_QUERY_KEYS,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import ActivityTimelinePage from "./ActivityTimelinePage";
import AlertsPanelPage from "./AlertsPanelPage";
import AnnouncementsPage from "./AnnouncementsPage";
import SystemMessagesPage from "./SystemMessagesPage";

const tabs = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "orders", label: "Orders" },
  { id: "inventory", label: "Inventory" },
  { id: "alerts", label: "Alerts" },
];

const categoryStyles = {
  orders: {
    icon: ShoppingCart,
    bg: "bg-blue-100 text-blue-600",
  },
  inventory: {
    icon: Package,
    bg: "bg-amber-100 text-amber-600",
  },
  alerts: {
    icon: AlertTriangle,
    bg: "bg-rose-100 text-rose-600",
  },
  activity: {
    icon: TrendingUp,
    bg: "bg-sky-100 text-sky-600",
  },
  system: {
    icon: MessageSquare,
    bg: "bg-slate-200 text-slate-600",
  },
};

const priorityVariant = {
  high: "danger",
  medium: "warning",
  low: "info",
};

const getDisplayCategory = (notification) => {
  if (notification.category !== "activity") return notification.category;
  if (["orders", "payments"].includes(notification.metadata?.activityType)) {
    return "orders";
  }
  if (notification.metadata?.activityType === "inventory") return "inventory";
  if (notification.metadata?.activityType === "alerts") return "alerts";
  return "activity";
};

const formatRelativeTime = (dateValue) => {
  if (!dateValue) return "Just now";

  const timestamp = new Date(dateValue).getTime();
  if (Number.isNaN(timestamp)) return "Just now";

  const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

const EmptyState = ({ isError }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
      <Inbox className="h-6 w-6" />
    </div>
    <h3 className="text-sm font-semibold text-slate-900">
      {isError ? "Notifications could not be loaded" : "No notifications found"}
    </h3>
    <p className="mt-1 max-w-md text-sm text-slate-500">
      {isError
        ? "Check that the backend server is running and try refreshing the list."
        : "New order, inventory, alert, and system activity notifications will appear here."}
    </p>
  </div>
);

export default function NotificationsPage() {
  const [searchParams] = useSearchParams();
  const moduleTab = searchParams.get("tab");

  if (moduleTab === "alerts") {
    return <AlertsPanelPage />;
  }

  if (moduleTab === "activity") {
    return <ActivityTimelinePage />;
  }

  if (moduleTab === "system") {
    return <SystemMessagesPage />;
  }

  if (moduleTab === "announcements") {
    return <AnnouncementsPage />;
  }

  return <NotificationCenterPage initialTab="all" />;
}

function NotificationCenterPage({ initialTab = "all" }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [priority, setPriority] = useState("all");

  const filters = useMemo(() => {
    const params = {
      search: search.trim(),
      priority,
    };

    if (activeTab === "unread") params.status = "unread";
    if (!["all", "unread"].includes(activeTab)) params.category = activeTab;

    return params;
  }, [activeTab, priority, search]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(filters),
    queryFn: () => getNotifications(filters),
    staleTime: 30_000,
  });

  const notifications = data?.data?.notifications || [];
  const stats = data?.data?.stats || {
    total: 0,
    unread: 0,
    highPriority: 0,
    tabCounts: { all: 0, unread: 0, orders: 0, inventory: 0, alerts: 0 },
  };

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
  };

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidateNotifications,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidateNotifications,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: invalidateNotifications,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Notification Center
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Monitor live POS alerts, operational updates, and activity records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
          <Button
            onClick={() => markAllReadMutation.mutate()}
            disabled={stats.unread === 0 || markAllReadMutation.isPending}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Total
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Unread
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.unread}
          </p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
            High Priority
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {stats.highPriority}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
              placeholder="Search notifications..."
            />
          </div>

          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          >
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-blue-50 p-1 sm:grid-cols-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-9 rounded-lg text-sm font-medium text-slate-600 transition hover:text-blue-700",
                activeTab === tab.id && "bg-white text-blue-600 shadow-sm",
              )}
            >
              {tab.label}
              {stats.tabCounts?.[tab.id] > 0 && (
                <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {stats.tabCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
            />
          ))
        ) : notifications.length === 0 ? (
          <EmptyState isError={isError} />
        ) : (
          notifications.map((notification) => {
            const category =
              categoryStyles[getDisplayCategory(notification)] || categoryStyles.system;
            const Icon = category.icon;

            return (
              <article
                key={notification._id}
                className={cn(
                  "flex flex-col gap-4 rounded-xl border p-4 transition hover:shadow-sm sm:flex-row sm:items-center",
                  notification.isRead
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    category.bg,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">
                      {notification.title}
                    </h2>
                    {!notification.isRead && (
                      <span
                        className="h-2 w-2 rounded-full bg-blue-600"
                        aria-label="Unread notification"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                    {notification.branchName && (
                      <span>{notification.branchName}</span>
                    )}
                    {notification.source && <span>{notification.source}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <Badge
                    variant={
                      priorityVariant[notification.priority] || "neutral"
                    }
                    className="capitalize"
                  >
                    {notification.priority || "medium"}
                  </Badge>

                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() =>
                          markReadMutation.mutate(notification._id)
                        }
                        disabled={markReadMutation.isPending}
                        className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                        aria-label="Mark notification as read"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(notification._id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
                      aria-label="Delete notification"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
