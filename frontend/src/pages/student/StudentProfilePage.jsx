import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { User, Mail, Lock, Camera, Save, Loader2 } from "lucide-react";
import api from "../../utils/api";
import { useAuthStore } from "../../context/authStore";
import toast from "react-hot-toast";

export default function StudentProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  const updateMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
      return api.put("/auth/update-profile", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: ({ data }) => {
      updateUser(data.user);
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Update failed"),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => api.put("/auth/change-password", data),
    onSuccess: () => {
      toast.success("Password changed!");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  return (
    <div className="page-container max-w-2xl">
      <h1 className="font-display font-bold text-3xl text-white mb-8">My Profile</h1>

      {/* Avatar */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.name} className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary-500 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    updateMutation.mutate({ avatar: e.target.files[0] });
                  }
                }}
              />
            </label>
          </div>
          <div>
            <p className="font-semibold text-white text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="badge bg-primary-600/20 text-primary-400 mt-2">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-400" /> Personal Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" value={user?.email} disabled className="input pl-9 opacity-50 cursor-not-allowed" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="Tell us about yourself..."
              className="input resize-none"
            />
          </div>
          <button
            onClick={() => updateMutation.mutate(form)}
            disabled={updateMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-400" /> Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="input"
              placeholder="Min 6 characters"
            />
          </div>
          <button
            onClick={() => passwordMutation.mutate(passwordForm)}
            disabled={passwordMutation.isPending || !passwordForm.currentPassword || !passwordForm.newPassword}
            className="btn-outline flex items-center gap-2 disabled:opacity-50"
          >
            {passwordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
