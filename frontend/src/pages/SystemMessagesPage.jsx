import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  Inbox,
  MessageSquare,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { cn } from "../utils/cn";
import {
  NOTIFICATION_QUERY_KEYS,
  getNotifications,
} from "../services/notificationService";

const statusOrder = ["error", "warning", "success", "info"];

const statusMeta = {
  error: {
    label: "Error",
    plural: "Errors",
    icon: XCircle,
    border: "border-rose-200",
    bg: "bg-rose-50",
    text: "text-rose-600",
    line: "border-l-rose-500",
    badge: "danger",
  },
  warning: {
    label: "Warning",
    plural: "Warnings",
    icon: AlertTriangle,
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-600",
    line: "border-l-amber-500",
    badge: "warning",
  },
  success: {
    label: "Success",
    plural: "Success",
    icon: CheckCircle2,
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    line: "border-l-emerald-500",
    badge: "success",
  },
  info: {
    label: "Info",
    plural: "Info",
    icon: Info,
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-600",
    line: "border-l-blue-500",
    badge: "info",
  },
};

const formatTime = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "--:--";

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const EmptyState = ({ isError }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
      <Inbox className="h-6 w-6" />
    </div>
    <h3 className="text-sm font-semibold text-slate-900">
      {isError ? "System messages could not be loaded" : "No system messages"}
    </h3>
    <p className="mt-1 max-w-md text-sm text-slate-500">
      {isError
        ? "Check that the backend server is running, then refresh this view."
        : "Infrastructure, backup, and operational system messages will appear here."}
    </p>
  </div>
);

export default function SystemMessagesPage() {
  const [activeStatus, setActiveStatus] = useState("all");

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list({ category: "system" }),
    queryFn: () => getNotifications({ category: "system" }),
    staleTime: 30_000,
  });

  const messages = useMemo(
    () =>
      (data?.data?.notifications || []).filter((message) =>
        statusMeta[message.metadata?.systemStatus],
      ),
    [data?.data?.notifications],
  );

  const counts = useMemo(
    () =>
      messages.reduce(
        (acc, message) => {
          const status = message.metadata.systemStatus;
          acc.all += 1;
          acc[status] += 1;
          return acc;
        },
        { all: 0, error: 0, warning: 0, success: 0, info: 0 },
      ),
    [messages],
  );

  const visibleMessages = useMemo(
    () =>
      messages.filter((message) => {
        if (activeStatus === "all") return true;
        return message.metadata.systemStatus === activeStatus;
      }),
    [activeStatus, messages],
  );

  const hasIssues = counts.error > 0 || counts.warning > 0;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-700">System Messages</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">
              System Messages
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold",
              hasIssues
                ? "bg-slate-200 text-slate-600"
                : "bg-emerald-100 text-emerald-700",
            )}
          >
            Status: {hasIssues ? "Issues Detected" : "All Clear"}
          </span>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statusOrder.map((status) => {
          const meta = statusMeta[status];
          return (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={cn(
                "rounded-lg border px-5 py-4 text-center transition hover:shadow-sm",
                meta.border,
                meta.bg,
                activeStatus === status && "ring-2 ring-blue-500/20",
              )}
            >
              <p className={cn("text-2xl font-semibold", meta.text)}>
                {counts[status]}
              </p>
              <p className={cn("mt-1 text-sm font-medium", meta.text)}>
                {meta.plural}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-5 rounded-lg bg-blue-50 p-1">
        {[
          { id: "all", label: "All", count: counts.all },
          { id: "error", label: "Errors" },
          { id: "warning", label: "Warnings" },
          { id: "success", label: "Success" },
          { id: "info", label: "Info" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveStatus(tab.id)}
            className={cn(
              "h-8 rounded-md text-xs font-medium text-slate-600 transition hover:text-blue-700",
              activeStatus === tab.id && "bg-white text-blue-600 shadow-sm",
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

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
            />
          ))
        ) : visibleMessages.length === 0 ? (
          <EmptyState isError={isError} />
        ) : (
          visibleMessages.map((message) => {
            const meta = statusMeta[message.metadata.systemStatus];
            const Icon = meta.icon;

            return (
              <article
                key={message._id}
                className={cn(
                  "flex items-start gap-4 rounded-lg border border-slate-100 border-l-4 bg-white px-5 py-5 shadow-sm transition hover:shadow-md",
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
                      {message.title}
                    </h2>
                    <Badge variant={meta.badge} className="py-0 text-[10px]">
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {message.message}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 text-xs font-medium text-slate-500">
                  <time>{formatTime(message.createdAt)}</time>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
