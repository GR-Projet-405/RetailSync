import React, { useState, useEffect } from "react";
import api from "../../services/api"; // Relative route location mapping

export default function UserProfileForm({
  profile,
  onSaveSuccess,
  onSaveError,
}) {
  // Profile Details State
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  // Password Reset State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync prop changes to form state safely on component refresh/load
  useEffect(() => {
    setFormData({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phoneNumber: profile.phoneNumber || "",
    });
  }, [profile]);

  // Combined Input Interception Listener for Personal Data
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Phone Number Input Mask: Allow ONLY digits
    if (name === "phoneNumber") {
      const onlyDigits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    // Name Inputs Mask: Allow ONLY alphabetical characters and spaces
    if (name === "firstName" || name === "lastName") {
      const alphabeticOnly = value.replace(/[^A-Za-z ]/g, "");
      setFormData((prev) => ({ ...prev, [name]: alphabeticOnly }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Password Input Handler (Prevents spaces inside password blocks)
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const cleanSpaceValue = value.replace(/\s/g, ""); 
    setPasswordData((prev) => ({ ...prev, [name]: cleanSpaceValue }));
  };

  // Submit Personal Info Changes
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      const response = await api.put("/profile-settings/update", formData); 

      if (response.data?.success) {
        setIsEditing(false);
        onSaveSuccess(
          "Your personal profile updates were processed successfully."
        );
      }
    } catch (err) {
      console.error(err);
      onSaveError(
        err.message || "Failed to modify database profile properties."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  // Submit Password Alteration
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      onSaveError("The replacement password entry fields do not match.");
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await api.put("/profile-settings/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data?.success) {
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        onSaveSuccess("Your platform authentication credentials were reset successfully.");
      }
    } catch (err) {
      console.error(err);
      onSaveError(err.message || "Could not successfully update password security profiles.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Box 1: Writable Profile Settings Details */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
      >
        <div className="border-b border-slate-100 pb-3 mb-6 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-800">Personal Data</h3>
          {isEditing && (
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 font-semibold px-3 py-1 rounded-full animate-pulse">
              Editing Mode Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                maxLength={50}
                pattern="^[A-Za-z ]+$"
                title="First name can only contain letters and spaces."
                className="w-full text-slate-700 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-lg outline-none font-medium"
              />
            ) : (
              <p className="text-slate-700 font-medium bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                {profile.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                maxLength={50}
                pattern="^[A-Za-z ]+$"
                title="Last name can only contain letters and spaces."
                className="w-full text-slate-700 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-lg outline-none font-medium"
              />
            ) : (
              <p className="text-slate-700 font-medium bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                {profile.lastName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Email (System Unalterable)
            </label>
            <p className="text-slate-400 font-medium bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg select-none cursor-not-allowed">
              {profile.email}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                maxLength={15}
                pattern="^[0-9]{9,15}$"
                title="Please enter a valid phone number containing numbers only (9 to 15 digits)."
                placeholder="e.g. 94771234567"
                className="w-full text-slate-700 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-lg outline-none font-medium"
              />
            ) : (
              <p className="text-slate-700 font-medium bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                {profile.phoneNumber || "Not Configured"}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
              Modify Details
            </button>
          ) : (
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: profile.firstName || "",
                    lastName: profile.lastName || "",
                    phoneNumber: profile.phoneNumber || "",
                  });
                }}
                className="w-full sm:w-auto py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl transition duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full sm:w-auto py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-xl shadow-sm transition duration-150"
              >
                {saveLoading ? "Processing..." : "Save Settings"}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Box 2: Account Security / Password Reset (Positioned precisely in between) */}
      <form 
        onSubmit={handlePasswordSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
      >
        <div className="border-b border-slate-100 pb-3 mb-6 flex justify-between items-center">
          <h3 className="text-base font-bold text-slate-800">Account Security</h3>
          {isChangingPassword && (
            <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 font-semibold px-3 py-1 rounded-full animate-pulse">
              Security Modification Active
            </span>
          )}
        </div>

        {!isChangingPassword ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
            <div>
              <p className="text-slate-700 font-semibold">Change Profile Password</p>
              <p className="text-xs text-slate-400 font-medium">Update your credential passkeys to keep your data protected.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm text-sm transition-all duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
              Reset Password
            </button>
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="••••••••"
                  className="w-full text-slate-700 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-lg outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full text-slate-700 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-lg outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="••••••••"
                  className="w-full text-slate-700 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-lg outline-none font-medium"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="w-full sm:w-auto py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl transition duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full sm:w-auto py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-xl shadow-sm transition duration-150"
              >
                {passwordLoading ? "Updating..." : "Apply New Password"}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Box 3: Organization Allocation Context (Always Read Only) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
          Workspace Allocation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Assigned Branch Name
            </label>
            <p className="text-slate-600 font-medium bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
              {profile.branch?.name || "Global Access / Central"}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Branch Code Reference
            </label>
            <p className="text-slate-600 font-mono font-semibold bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
              {profile.branch?.code || "SYSTEM_ADMIN"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}