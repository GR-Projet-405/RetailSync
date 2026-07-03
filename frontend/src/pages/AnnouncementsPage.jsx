import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  ChevronDown,
  Inbox,
  Megaphone,
  Pin,
  PinOff,
  RefreshCw,
  Tag,
  UserRound,
} from "lucide-react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { cn } from "../utils/cn";
import {
  NOTIFICATION_QUERY_KEYS,
  getAnnouncements,
  updateAnnouncement,
} from "../services/notificationService";

const tabs = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "pinned", label: "Pinned" },
  { id: "saved", label: "Saved" },
];

const typeVariant = {
  Policy: "info",
  Promotion: "warning",
  Training: "danger",
  Update: "success",
  Event: "secondary",
};

const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "No date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const EmptyState = ({ isError }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
      <Inbox className="h-6 w-6" />
    </div>
    <h3 className="text-sm font-semibold text-slate-900">
      {isError ? "Announcements could not be loaded" : "No announcements found"}
    </h3>
    <p className="mt-1 max-w-md text-sm text-slate-500">
      {isError
        ? "Check that the backend server is running, then refresh this view."
        : "Published policy, promotion, training, update, and event announcements will appear here."}
    </p>
  </div>
);

export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const announcementsQueryKey = NOTIFICATION_QUERY_KEYS.list({
    category: "announcements",
  });

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: announcementsQueryKey,
    queryFn: () => getAnnouncements(),
    staleTime: 30_000,
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: updateAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementsQueryKey });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });

  const announcements = useMemo(
    () => data?.data?.notifications || [],
    [data?.data?.notifications],
  );

  const counts = useMemo(
    () =>
      announcements.reduce(
        (acc, announcement) => {
          acc.all += 1;
          if (!announcement.isRead) acc.unread += 1;
          if (announcement.metadata?.isPinned) acc.pinned += 1;
          if (announcement.metadata?.isSaved) acc.saved += 1;
          return acc;
        },
        { all: 0, unread: 0, pinned: 0, saved: 0 },
      ),
    [announcements],
  );

  const visibleAnnouncements = useMemo(
    () =>
      announcements.filter((announcement) => {
        if (activeTab === "unread") return !announcement.isRead;
        if (activeTab === "pinned") return announcement.metadata?.isPinned;
        if (activeTab === "saved") return announcement.metadata?.isSaved;
        return true;
      }),
    [activeTab, announcements],
  );

  const toggleAnnouncementMeta = (announcement, field) => {
    const metadata = announcement.metadata || {};
    updateAnnouncementMutation.mutate({
      id: announcement._id,
      payload: {
        metadata: {
          ...metadata,
          [field]: !metadata[field],
        },
      },
    });
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-700">Announcements</span>
          </div>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">
              Announcements
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
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-4 rounded-lg bg-blue-50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "h-8 rounded-md text-xs font-medium text-slate-600 transition hover:text-blue-700",
              activeTab === tab.id && "bg-white text-blue-600 shadow-sm",
            )}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span
                className={cn(
                  "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600",
                )}
              >
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-lg border border-slate-200 bg-slate-100"
            />
          ))
        ) : visibleAnnouncements.length === 0 ? (
          <EmptyState isError={isError} />
        ) : (
          visibleAnnouncements.map((announcement) => {
            const meta = announcement.metadata || {};
            const announcementType = meta.announcementType || "Update";

            return (
              <article
                key={announcement._id}
                className={cn(
                  "rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:shadow-md",
                  !announcement.isRead && "border-blue-200 bg-blue-50/30",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-950">
                        {announcement.title}
                      </h2>
                      {meta.isPinned && (
                        <Pin className="h-4 w-4 text-blue-600" />
                      )}
                      <Badge
                        variant={typeVariant[announcementType] || "neutral"}
                        className="py-0 text-[10px]"
                      >
                        {announcementType}
                      </Badge>
                      {!announcement.isRead && (
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-blue-600"
                          aria-label="Unread announcement"
                        />
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {announcement.message}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 text-slate-400">
                    <button
                      type="button"
                      onClick={() =>
                        toggleAnnouncementMeta(announcement, "isSaved")
                      }
                      disabled={updateAnnouncementMutation.isPending}
                      className={cn(
                        "rounded-md p-2 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
                        meta.isSaved && "text-blue-600",
                      )}
                      aria-label={
                        meta.isSaved
                          ? "Remove saved announcement"
                          : "Save announcement"
                      }
                      title={meta.isSaved ? "Remove saved" : "Save"}
                    >
                      {meta.isSaved ? (
                        <BookmarkCheck className="h-5 w-5" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toggleAnnouncementMeta(announcement, "isPinned")
                      }
                      disabled={updateAnnouncementMutation.isPending}
                      className={cn(
                        "rounded-md p-2 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
                        meta.isPinned && "text-blue-600",
                      )}
                      aria-label={
                        meta.isPinned
                          ? "Unpin announcement"
                          : "Pin announcement"
                      }
                      title={meta.isPinned ? "Unpin" : "Pin"}
                    >
                      {meta.isPinned ? (
                        <PinOff className="h-5 w-5" />
                      ) : (
                        <Pin className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="flex flex-col gap-3 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <UserRound className="h-4 w-4" />
                        {meta.authorName || announcement.source || "Admin"}
                      </span>
                      <span>{meta.authorRole || announcement.branchName || "Head Office"}</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(announcement.createdAt)}
                      </span>
                      {meta.expiresIn && (
                        <span className="flex items-center gap-1.5 text-amber-600">
                          <Tag className="h-4 w-4" />
                          Expires in {meta.expiresIn}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Read More
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
