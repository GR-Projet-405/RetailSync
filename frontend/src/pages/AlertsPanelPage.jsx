import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Flag,
  Inbox,
  Info,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { cn } from "../utils/cn";
import {
  NOTIFICATION_QUERY_KEYS,
  clearNotifications,
  deleteNotification,
  getNotifications,
} from "../services/notificationService";

const severityMeta = {
  high: {
    id: "critical",
    label: "Critical",
    color: "rose",
    icon: Flag,
    border: "border-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-600",
    line: "border-l-rose-500",
    badge: "danger",
  },
  medium: {
    id: "warning",
    label: "Warning",
    color: "amber",
    icon: AlertTriangle,
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-600",
    line: "border-l-amber-500",
    badge: "warning",
  },
  low: {
    id: "info",
    label: "Info",
    color: "blue",
    icon: Info,
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-600",
    line: "border-l-blue-500",
    badge: "info",
  },
};

const severityOrder = ["high", "medium", "low"];

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
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
      <Inbox className="h-6 w-6" />
    </div>
    <h3 className="text-sm font-semibold text-slate-900">
      {isError ? "Alerts could not be loaded" : "No alerts found"}
    </h3>
    <p className="mt-1 max-w-md text-sm text-slate-500">
      {isError
        ? "Check that the backend server is running, then refresh this panel."
        : "Critical, warning, and info alerts from Notification Center will appear here."}
    </p>
  </div>
);

export default function AlertsPanelPage() {
  const queryClient = useQueryClient();
  const [activeSeverity, setActiveSeverity] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list({ category: "alerts" }),
    queryFn: () => getNotifications({ category: "alerts" }),
    staleTime: 30_000,
  });

  const alerts = useMemo(
    () => data?.data?.notifications || [],
    [data?.data?.notifications],
  );

  const counts = useMemo(
    () =>
      alerts.reduce(
        (acc, alert) => {
          const severity = severityMeta[alert.priority] ? alert.priority : "medium";
          acc.all += 1;
          acc[severity] += 1;
          return acc;
        },
        { all: 0, high: 0, medium: 0, low: 0 },
      ),
    [alerts],
  );

  const visibleAlerts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesSeverity =
        activeSeverity === "all" ||
        severityMeta[alert.priority]?.id === activeSeverity;
      const matchesSearch =
        !searchTerm ||
        [alert.title, alert.message, alert.branchName, alert.source]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchTerm));

      return matchesSeverity && matchesSearch;
    });
  }, [activeSeverity, alerts, search]);

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
  };

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: invalidateNotifications,
  });

  const clearMutation = useMutation({
    mutationFn: () => clearNotifications({ category: "alerts" }),
    onSuccess: invalidateNotifications,
  });

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-700">Alerts Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">
              Alerts Panel
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button
            onClick={() => clearMutation.mutate()}
            disabled={alerts.length === 0 || clearMutation.isPending}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {severityOrder.map((priority) => {
          const meta = severityMeta[priority];
          return (
            <button
              key={priority}
              type="button"
              onClick={() => setActiveSeverity(meta.id)}
              className={cn(
                "rounded-lg border px-5 py-4 text-center transition hover:shadow-sm",
                meta.border,
                meta.bg,
                activeSeverity === meta.id && "ring-2 ring-blue-500/20",
              )}
            >
              <p className={cn("text-2xl font-semibold", meta.text)}>
                {counts[priority]}
              </p>
              <p className={cn("mt-1 text-sm font-medium", meta.text)}>
                {meta.label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            placeholder="Search alerts..."
          />
        </div>
        <div className="grid grid-cols-4 rounded-lg bg-blue-50 p-1 lg:w-[560px]">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "critical", label: "Critical" },
            { id: "warning", label: "Warning" },
            { id: "info", label: "Info" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSeverity(tab.id)}
              className={cn(
                "h-8 rounded-md text-xs font-medium text-slate-600 transition hover:text-blue-700",
                activeSeverity === tab.id && "bg-white text-blue-600 shadow-sm",
              )}
            >
              {tab.label}
              {tab.id === "all" && counts.all > 0 && (
                <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {tab.count}
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
              className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
            />
          ))
        ) : visibleAlerts.length === 0 ? (
          <EmptyState isError={isError} />
        ) : (
          visibleAlerts.map((alert) => {
            const meta = severityMeta[alert.priority] || severityMeta.medium;
            const Icon = meta.icon;

            return (
              <article
                key={alert._id}
                className={cn(
                  "flex gap-4 rounded-lg border border-slate-100 border-l-4 bg-white px-5 py-5 shadow-sm transition hover:shadow-md",
                  meta.line,
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    meta.bg,
                    meta.text,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-950">
                      {alert.title}
                    </h2>
                    <Badge variant={meta.badge} className="py-0 text-[10px]">
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {alert.message}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatRelativeTime(alert.createdAt)}
                    </span>
                    {alert.branchName && <span>{alert.branchName}</span>}
                    {alert.source && (
                      <span className="flex items-center gap-1">
                        <Bell className="h-3.5 w-3.5" />
                        {alert.source}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(alert._id)}
                  disabled={deleteMutation.isPending}
                  className="h-8 w-8 shrink-0 rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  aria-label="Dismiss alert"
                  title="Dismiss"
                >
                  <X className="mx-auto h-4 w-4" />
                </button>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
