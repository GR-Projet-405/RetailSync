import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Box,
  CalendarCheck,
  CreditCard,
  Database,
  Inbox,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import Button from "../components/Button";
import { cn } from "../utils/cn";
import {
  NOTIFICATION_QUERY_KEYS,
  getNotifications,
} from "../services/notificationService";

const timelineTabs = [
  { id: "all", label: "All" },
  { id: "orders", label: "Orders" },
  { id: "payments", label: "Payments" },
  { id: "inventory", label: "Inventory" },
  { id: "system", label: "System" },
];

const typeMeta = {
  orders: {
    icon: ShoppingBag,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  payments: {
    icon: CreditCard,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  inventory: {
    icon: Box,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  system: {
    icon: Database,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  default: {
    icon: CalendarCheck,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
};

const getInitials = (name = "System") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const formatTime = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "--:--";

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const getDayLabel = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Earlier";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (left, right) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  if (sameDay(date, today)) return "Today";
  if (sameDay(date, yesterday)) return "Yesterday";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const EmptyState = ({ isError }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
      <Inbox className="h-6 w-6" />
    </div>
    <h3 className="text-sm font-semibold text-slate-900">
      {isError ? "Activity could not be loaded" : "No activity found"}
    </h3>
    <p className="mt-1 max-w-md text-sm text-slate-500">
      {isError
        ? "Check that the backend server is running, then refresh this timeline."
        : "Order, payment, inventory, and system activity records will appear here."}
    </p>
  </div>
);

export default function ActivityTimelinePage() {
  const [activeType, setActiveType] = useState("all");

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list({ category: "activity" }),
    queryFn: () => getNotifications({ category: "activity" }),
    staleTime: 30_000,
  });

  const activities = useMemo(
    () => data?.data?.notifications || [],
    [data?.data?.notifications],
  );

  const visibleActivities = useMemo(
    () =>
      activities.filter((item) => {
        if (activeType === "all") return true;
        return item.metadata?.activityType === activeType;
      }),
    [activeType, activities],
  );

  const groupedActivities = useMemo(() => {
    return visibleActivities.reduce((groups, item) => {
      const label = getDayLabel(item.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
      return groups;
    }, {});
  }, [visibleActivities]);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-700">Activity Timeline</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">
              Activity Timeline
            </h1>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 self-start lg:self-auto"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          Live
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {timelineTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveType(tab.id)}
            className={cn(
              "h-7 rounded-full border border-slate-200 px-3 text-xs font-medium text-slate-500 transition hover:border-blue-300 hover:text-blue-700",
              activeType === tab.id &&
                "border-blue-600 bg-blue-600 text-white hover:border-blue-600 hover:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
            />
          ))
        ) : visibleActivities.length === 0 ? (
          <EmptyState isError={isError} />
        ) : (
          Object.entries(groupedActivities).map(([dayLabel, items]) => (
            <section key={dayLabel}>
              <div className="mb-5 flex items-center gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {dayLabel}
                </p>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="relative space-y-8 pl-16">
                <div className="absolute bottom-0 left-5 top-0 w-px bg-slate-200" />
                {items.map((item) => {
                  const activityType = item.metadata?.activityType || "default";
                  const meta = typeMeta[activityType] || typeMeta.default;
                  const Icon = meta.icon;
                  const actor = item.metadata?.actorName || item.source || "System";
                  const actorRole = item.metadata?.actorRole || item.source || "Auto";
                  const actorTone =
                    item.metadata?.actorTone || "bg-blue-100 text-blue-700";

                  return (
                    <article key={item._id} className="relative">
                      <div
                        className={cn(
                          "absolute -left-[58px] top-9 z-10 flex h-8 w-8 items-center justify-center rounded-full",
                          meta.bg,
                          meta.color,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 gap-4">
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                actorTone,
                              )}
                            >
                              {getInitials(actor)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-sm font-semibold text-slate-950">
                                  {actor}
                                </h2>
                                <span className="text-xs text-slate-400">
                                  {actorRole}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-slate-600">
                                {item.title}
                              </p>
                              <p className="mt-2 text-xs font-medium text-slate-500">
                                {item.message}
                              </p>
                            </div>
                          </div>
                          <time className="shrink-0 text-xs font-medium text-slate-500">
                            {formatTime(item.createdAt)}
                          </time>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
