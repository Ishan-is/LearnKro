import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle, XCircle, Ban, Trash2, Loader2, Users, UserPlus, X } from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { useAuthStore } from "../../context/authStore";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modal & Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, roleFilter],
    queryFn: () =>
      api.get(`/admin/users?${new URLSearchParams({ search, role: roleFilter }).toString()}`).then((r) => r.data),
  });

  // Role modification mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => api.put(`/admin/users/${id}/role`, { role }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success(`User role updated to ${vars.role} successfully!`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update user role");
    },
  });

  // Create admin mutation
  const createAdminMutation = useMutation({
    mutationFn: (adminData) => api.post("/admin/users/create-admin", adminData),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("Admin account created successfully!");
      setIsModalOpen(false);
      setNewAdmin({ name: "", email: "", password: "" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create admin");
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }) => api.put(`/admin/users/${id}/approve`, { approved }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success(vars.approved ? "Instructor approved!" : "Instructor rejected");
    },
  });

  const banMutation = useMutation({
    mutationFn: ({ id, banned }) => api.put(`/admin/users/${id}/ban`, { banned }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success(vars.banned ? "User banned" : "User unbanned");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("User deleted");
    },
  });

  const handleDeleteClick = (id, name) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete User?",
      message: `Are you sure you want to delete user "${name}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteMutation.mutate(id);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleRoleChangeClick = (id, name, targetRole) => {
    setConfirmDialog({
      isOpen: true,
      title: "Update User Role?",
      message: `Are you sure you want to change the role of "${name}" to "${targetRole}"?`,
      onConfirm: () => {
        updateRoleMutation.mutate({ id, role: targetRole });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleCreateAdminSubmit = (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      toast.error("Please fill in all fields");
      return;
    }
    createAdminMutation.mutate(newAdmin);
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">User Management</h1>
          <p className="text-gray-500 mt-1">{data?.total || 0} total users</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input sm:w-40"
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : data?.users?.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Joined</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.users.map((user) => (
                  <tr key={user._id} className={`hover:bg-white/5 transition-colors ${user.isBanned ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar?.url ? (
                          <img src={user.avatar.url} alt={user.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                            user.role === "admin" ? "bg-red-600" : user.role === "instructor" ? "bg-accent-500" : "bg-primary-600"
                          }`}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user._id === currentUser?.id || user.email === currentUser?.email ? (
                        <span className="badge text-xs bg-red-500/20 text-red-400 font-semibold border border-red-500/10">
                          {user.role} (You)
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChangeClick(user._id, user.name, e.target.value)}
                          disabled={updateRoleMutation.isPending}
                          className="bg-dark-900 border border-white/10 rounded-lg text-xs text-white px-2.5 py-1 focus:outline-none focus:border-primary-500 cursor-pointer"
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {user.isBanned && (
                          <span className="badge bg-red-500/20 text-red-400 text-xs">Banned</span>
                        )}
                        {user.role === "instructor" && (
                          <span className={`badge text-xs ${user.isApproved ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                            {user.isApproved ? "Approved" : "Pending"}
                          </span>
                        )}
                        {user.role === "student" && !user.isBanned && (
                          <span className="badge bg-green-500/20 text-green-400 text-xs">Active</span>
                        )}
                        {user.role === "admin" && !user.isBanned && (
                          <span className="badge bg-red-500/20 text-red-400 text-xs">Active</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Approve/Reject for pending instructors */}
                        {user.role === "instructor" && !user.isApproved && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate({ id: user._id, approved: true })}
                              className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => approveMutation.mutate({ id: user._id, approved: false })}
                              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Ban/Unban */}
                        {user.role !== "admin" && (
                          <button
                            onClick={() => banMutation.mutate({ id: user._id, banned: !user.isBanned })}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.isBanned
                                ? "text-yellow-400 hover:bg-yellow-500/20"
                                : "text-gray-400 hover:bg-orange-500/20 hover:text-orange-400"
                            }`}
                            title={user.isBanned ? "Unban" : "Ban"}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleDeleteClick(user._id, user.name)}
                            className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-16 text-center">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No users found</p>
        </div>
      )}

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-bold text-2xl text-white mb-2">Create Admin Account</h3>
            <p className="text-sm text-gray-500 mb-6">Create a new administrator with auto-verified credentials.</p>

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  placeholder="Admin Name"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@learnkro.com"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="••••••••"
                  className="input"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary py-2 px-4 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAdminMutation.isPending}
                  className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5"
                >
                  {createAdminMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Admin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-dark-900 border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-display font-bold text-xl text-white mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="btn-secondary py-2 px-4 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2 px-4 text-xs rounded-xl transition-all active:scale-95 shadow-lg shadow-rose-600/25"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
