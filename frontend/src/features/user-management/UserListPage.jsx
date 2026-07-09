import { useState, useCallback, useMemo, useEffect } from "react";
import {
  UserPlus,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  KeyRound,
  Power,
  Shield,
  Users,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
} from "lucide-react";
// ─── Inline Toast Utility ──────────────────────────────
const _showToast = (msg, type) => {
  const colors = {
    success: "#16A34A",
    error: "#DC2626",
    warning: "#D97706",
    info: "#2563EB",
  };
  const bgColors = {
    success: "#F0FDF4",
    error: "#FEF2F2",
    warning: "#FFFBEB",
    info: "#EFF6FF",
  };
  const borders = {
    success: "#86EFAC",
    error: "#FCA5A5",
    warning: "#FCD34D",
    info: "#93C5FD",
  };
  let c = document.getElementById("_rs_toast");
  if (!c) {
    c = document.createElement("div");
    c.id = "_rs_toast";
    Object.assign(c.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: "9999",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      maxWidth: "360px",
      width: "100%",
      pointerEvents: "none",
    });
    document.body.appendChild(c);
  }
  const el = document.createElement("div");
  Object.assign(el.style, {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    background: bgColors[type],
    border: `1px solid ${borders[type]}`,
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    pointerEvents: "all",
    opacity: "0",
    transform: "translateX(20px)",
    transition: "opacity 200ms ease, transform 200ms ease",
    cursor: "pointer",
  });
  el.innerHTML = `<span style="font-size:13px;font-weight:500;color:${colors[type]};line-height:1.4;flex:1">${msg}</span>`;
  const dismiss = () => {
    el.style.opacity = "0";
    el.style.transform = "translateX(20px)";
    setTimeout(() => el.remove(), 200);
  };
  el.addEventListener("click", dismiss);
  c.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translateX(0)";
  });
  setTimeout(dismiss, 4000);
};
const toast = {
  success: (m) => _showToast(m, "success"),
  error: (m) => _showToast(m, "error"),
  warning: (m) => _showToast(m, "warning"),
  info: (m) => _showToast(m, "info"),
};
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import ConfirmDialog from "../../components/ConfirmDialog";
import SearchInput from "../../components/SearchInput";
import Spinner from "../../components/Spinner";
import UserForm from "./UserForm";
import UserDetailView from "./UserDetailView";
import ResetPasswordForm from "./ResetPasswordForm";
import RoleAssignForm from "./RoleAssignForm";
import { ROLE_LABELS, ROLE_COLORS, ALL_ROLES } from "../../config/roles";
import api from "../../services/api"; // Axios configuration wrapper
import {
  useUsers,
  useUserStats,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateUserStatus,
  useResetUserPassword,
  useUpdateUserRole,
} from "../../hooks/useUsers";

// ─── Constants ────────────────────────────────────────────
const STATUS_CONFIG = {
  ACTIVE: { variant: "success", icon: CheckCircle2, label: "Active" },
  INACTIVE: { variant: "neutral", icon: XCircle, label: "Inactive" },
  SUSPENDED: { variant: "danger", icon: AlertCircle, label: "Suspended" },
};

const MODAL_TYPES = {
  CREATE: "CREATE",
  EDIT: "EDIT",
  VIEW: "VIEW",
  DELETE: "DELETE",
  RESET_PASSWORD: "RESET_PASSWORD",
  TOGGLE_STATUS: "TOGGLE_STATUS",
  ASSIGN_ROLE: "ASSIGN_ROLE",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ─── Stat Card ────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bgColor} transition-all duration-150 hover:shadow-sm`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-800 leading-none mt-0.5">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

// ─── Action Dropdown ──────────────────────────────────────
function ActionMenu({
  user,
  onView,
  onEdit,
  onDelete,
  onResetPw,
  onToggleStatus,
  onAssignRole,
}) {
  const [open, setOpen] = useState(false);

  const isActive = user.status === "ACTIVE";

  return (
    <div className="relative">
      <button
        id={`action-menu-${user._id}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-20 py-1 fade-in overflow-hidden">
            {[
              {
                icon: Eye,
                label: "View Details",
                action: onView,
                style: "text-slate-700 hover:bg-slate-50",
              },
              {
                icon: Pencil,
                label: "Edit User",
                action: onEdit,
                style: "text-slate-700 hover:bg-slate-50",
              },
              {
                icon: Shield,
                label: "Assign Role",
                action: onAssignRole,
                style: "text-blue-600 hover:bg-blue-50",
              },
              {
                icon: KeyRound,
                label: "Reset Password",
                action: onResetPw,
                style: "text-amber-600 hover:bg-amber-50",
              },
              {
                icon: Power,
                label: isActive ? "Deactivate" : "Activate",
                action: onToggleStatus,
                style: isActive
                  ? "text-orange-600 hover:bg-orange-50"
                  : "text-emerald-600 hover:bg-emerald-50",
              },
              {
                icon: Trash2,
                label: "Delete User",
                action: onDelete,
                style: "text-red-600 hover:bg-red-50",
                divider: true,
              },
            ].map(({ icon: Icon, label, action, style, divider }) => (
              <div key={label}>
                {divider && <div className="h-px bg-slate-100 my-1" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    action();
                  }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors duration-100 ${style}`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function UserListPage() {
  // ─ Filters state
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    branch: "",
    page: 1,
    limit: 10,
  });

  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Array state to hold dynamically fetched database branches
  const [liveBranches, setLiveBranches] = useState([]);

  // ─ Modal state
  const [modal, setModal] = useState({ type: null, user: null });

  // Fetch branches from database on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await api.get("/branch-management/branches");
        if (res.data?.success && Array.isArray(res.data.data)) {
          setLiveBranches(res.data.data);
        } else if (Array.isArray(res.data)) {
          setLiveBranches(res.data);
        }
      } catch (err) {
        console.error("Failed to load branches:", err.message);
      }
    };
    loadBranches();
  }, []);

  // ─ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ─ Data fetching
  const { data, isLoading, isFetching, refetch } = useUsers(filters);
  const { data: statsData } = useUserStats();

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};
  const stats = statsData?.data?.summary || {};

  // ─ Mutations
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const updateStatus = useUpdateUserStatus();
  const resetPw = useResetUserPassword();
  const updateRole = useUpdateUserRole();

  // ─ Open/close modal helpers
  const openModal = useCallback(
    (type, user = null) => setModal({ type, user }),
    [],
  );
  const closeModal = useCallback(
    () => setModal({ type: null, user: null }),
    [],
  );

  // ─ Filter helpers
  const setFilter = (key) => (e) => {
    setFilters((prev) => ({ ...prev, [key]: e.target.value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      role: "",
      status: "",
      branch: "",
      page: 1,
      limit: 10,
    });
    setSearchInput("");
  };

  const activeFilterCount = [
    filters.role,
    filters.status,
    filters.branch,
  ].filter(Boolean).length;

  // ─── Handlers ─────────────────────────────────────────

  const handleCreate = async (payload) => {
    try {
      await createUser.mutateAsync(payload);
      toast.success("User created successfully");
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await updateUser.mutateAsync({ id: modal.user._id, data: payload });
      toast.success("User updated successfully");
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(modal.user._id);
      toast.success("User deleted successfully");
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = modal.user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateStatus.mutateAsync({ id: modal.user._id, status: newStatus });
      toast.success(
        `User ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`,
      );
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResetPassword = async (newPassword, confirmPassword) => {
    try {
      await resetPw.mutateAsync({
        id: modal.user._id,
        newPassword,
        confirmPassword,
      });
      toast.success("Password reset successfully");
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAssignRole = async (role) => {
    try {
      await updateRole.mutateAsync({ id: modal.user._id, role });
      toast.success(`Role updated to ${ROLE_LABELS[role]}`);
      closeModal();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ─── Table Columns ─────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        key: "user",
        header: "User",
        render: (row) => (
          <div className="flex items-center gap-3 min-w-0">
            {row.profileImage ? (
              <img
                src={row.profileImage}
                alt={row.firstName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {row.firstName?.[0]}
                {row.lastName?.[0]}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {row.firstName} {row.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">@{row.username}</p>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        render: (row) => (
          <span className="text-sm text-slate-600 truncate max-w-[200px] block">
            {row.email}
          </span>
        ),
      },
      {
        key: "role",
        header: "Role",
        render: (row) => {
          // Safe lookup: supports both roleId (backend database object) and role
          const roleData = row.roleId || row.role;

          // Extract the role name string safely
          const roleName =
            roleData && typeof roleData === "object" ? roleData.name : roleData;

          return (
            <Badge variant={ROLE_COLORS[roleName] || "primary"}>
              {ROLE_LABELS[roleName] || roleName || "—"}
            </Badge>
          );
        },
      },
      {
        key: "branch",
        header: "Branch",
        render: (row) => {
          // Safe lookup: supports both branchId (backend payload) and branch
          const branchData = row.branchId || row.branch;

          return (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              {branchData && branchData.name ? (
                <>
                  <Building2 size={12} className="text-slate-400" />
                  {branchData.name}
                </>
              ) : (
                <span className="text-slate-400 italic text-xs">—</span>
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        render: (row) => {
          const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.ACTIVE;
          const Icon = cfg.icon;
          return (
            <Badge
              variant={cfg.variant}
              className="flex items-center gap-1 w-fit"
            >
              <Icon size={10} /> {cfg.label}
            </Badge>
          );
        },
      },
      {
        key: "lastLogin",
        header: "Last Login",
        render: (row) => (
          <span className="text-xs text-slate-500">
            {row.lastLogin ? (
              new Date(row.lastLogin).toLocaleDateString("en-IN", {
                dateStyle: "medium",
              })
            ) : (
              <span className="italic text-slate-300">Never</span>
            )}
          </span>
        ),
      },
      {
        key: "actions",
        header: "",
        width: "48px",
        render: (row) => (
          <ActionMenu
            user={row}
            onView={() => openModal(MODAL_TYPES.VIEW, row)}
            onEdit={() => openModal(MODAL_TYPES.EDIT, row)}
            onDelete={() => openModal(MODAL_TYPES.DELETE, row)}
            onResetPw={() => openModal(MODAL_TYPES.RESET_PASSWORD, row)}
            onToggleStatus={() => openModal(MODAL_TYPES.TOGGLE_STATUS, row)}
            onAssignRole={() => openModal(MODAL_TYPES.ASSIGN_ROLE, row)}
          />
        ),
      },
    ],
    [openModal],
  );

  // ─── Pagination ────────────────────────────────────────
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="space-y-6 fade-up">
      {/* ─── Header ─── */}
      <PageHeader
        title="User & Role Management"
        description="Manage system users, roles, and access permissions across all branches."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              id="refresh-users-btn"
            >
              <RefreshCw
                size={14}
                className={isFetching ? "animate-spin" : ""}
              />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openModal(MODAL_TYPES.CREATE)}
              id="create-user-btn"
            >
              <UserPlus size={14} />
              Add User
            </Button>
          </>
        }
      />

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.total}
          color="bg-blue-500"
          bgColor="bg-blue-50 border-blue-100"
        />
        <StatCard
          icon={UserCheck}
          label="Active"
          value={stats.active}
          color="bg-emerald-500"
          bgColor="bg-emerald-50 border-emerald-100"
        />
        <StatCard
          icon={UserX}
          label="Inactive"
          value={stats.inactive}
          color="bg-slate-400"
          bgColor="bg-slate-50 border-slate-200"
        />
        <StatCard
          icon={AlertCircle}
          label="Suspended"
          value={stats.suspended}
          color="bg-red-500"
          bgColor="bg-red-50 border-red-100"
        />
      </div>

      {/* ─── Filters & Search Bar ─── */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <SearchInput
              id="user-search"
              placeholder="Search by name, username, email, or employee ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="max-w-full"
            />
          </div>

          {/* Filter toggle & actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="toggle-filters-btn"
              onClick={() => setShowFilters((v) => !v)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all duration-150
                ${
                  showFilters || activeFilterCount > 0
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              <Filter size={13} />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
              >
                Clear
              </button>
            )}

            {/* Page size selector */}
            <select
              value={filters.limit}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  limit: Number(e.target.value),
                  page: 1,
                }))
              }
              className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-2 text-slate-600 outline-none focus:border-blue-400 cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expanded filter row */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 fade-up">
            {/* Role filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                id="filter-role"
                value={filters.role}
                onChange={setFilter("role")}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="">All Roles</option>
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                id="filter-status"
                value={filters.status}
                onChange={setFilter("status")}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Branch Filter dropdown -> Now safely mapped directly to live database records */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Branch
              </label>
              <select
                id="filter-branch"
                value={filters.branch}
                onChange={setFilter("branch")}
                className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="">All Branches</option>
                {liveBranches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} {b.code ? `(${b.code})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ─── Table ─── */}
      <div className="relative">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner />
          </div>
        ) : (
          <>
            {isFetching && (
              <div className="absolute top-2 right-2 z-10">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] text-blue-600 font-semibold">
                  <RefreshCw size={9} className="animate-spin" /> Refreshing...
                </div>
              </div>
            )}
            <DataTable
              columns={columns}
              data={users}
              emptyMessage={
                filters.search ||
                filters.role ||
                filters.status ||
                filters.branch
                  ? "No users match the current filters."
                  : 'No users found. Click "Add User" to create the first user.'
              }
            />
          </>
        )}
      </div>

      {/* ─── Pagination ─── */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-3 py-2">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {pagination.total}
            </span>{" "}
            users
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - pagination.page) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`
                    w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150
                    ${
                      p === pagination.page
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  {p}
                </button>
              ))}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════ MODALS ════════════════════════ */}

      {/* Create User */}
      <Modal
        isOpen={modal.type === MODAL_TYPES.CREATE}
        onClose={closeModal}
        title="Create New User"
        size="lg"
      >
        <UserForm
          onSubmit={handleCreate}
          onCancel={closeModal}
          isLoading={createUser.isPending}
          branches={liveBranches}
        />
      </Modal>

      {/* Edit User */}
      <Modal
        isOpen={modal.type === MODAL_TYPES.EDIT}
        onClose={closeModal}
        title="Edit User"
        size="lg"
      >
        <UserForm
          initialData={modal.user}
          onSubmit={handleUpdate}
          onCancel={closeModal}
          isLoading={updateUser.isPending}
          branches={liveBranches}
        />
      </Modal>

      {/* View User */}
      <Modal
        isOpen={modal.type === MODAL_TYPES.VIEW}
        onClose={closeModal}
        title="User Details"
        size="lg"
      >
        <UserDetailView user={modal.user} />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={modal.type === MODAL_TYPES.DELETE}
        onClose={closeModal}
        onConfirm={handleDelete}
        type="danger"
        title="Delete User"
        message={`Are you sure you want to permanently delete ${modal.user?.firstName} ${modal.user?.lastName}? This action cannot be undone.`}
        confirmText="Delete User"
      />

      {/* Toggle Status Confirm */}
      <ConfirmDialog
        isOpen={modal.type === MODAL_TYPES.TOGGLE_STATUS}
        onClose={closeModal}
        onConfirm={handleToggleStatus}
        type={modal.user?.status === "ACTIVE" ? "warning" : "primary"}
        title={
          modal.user?.status === "ACTIVE" ? "Deactivate User" : "Activate User"
        }
        message={
          modal.user?.status === "ACTIVE"
            ? `Deactivating ${modal.user?.firstName} ${modal.user?.lastName} will prevent them from logging in.`
            : `Activating ${modal.user?.firstName} ${modal.user?.lastName} will restore their access.`
        }
        confirmText={
          modal.user?.status === "ACTIVE" ? "Deactivate" : "Activate"
        }
      />

      {/* Reset Password */}
      <Modal
        isOpen={modal.type === MODAL_TYPES.RESET_PASSWORD}
        onClose={closeModal}
        title="Reset Password"
        size="sm"
      >
        <ResetPasswordForm
          user={modal.user}
          onSubmit={handleResetPassword}
          onCancel={closeModal}
          isLoading={resetPw.isPending}
        />
      </Modal>

      {/* Assign Role */}
      <Modal
        isOpen={modal.type === MODAL_TYPES.ASSIGN_ROLE}
        onClose={closeModal}
        title="Assign Role"
        size="sm"
      >
        <RoleAssignForm
          user={modal.user}
          onSubmit={handleAssignRole}
          onCancel={closeModal}
          isLoading={updateRole.isPending}
        />
      </Modal>
    </div>
  );
}
