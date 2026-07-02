import React, { useState, useEffect } from "react";
import api from "../../services/api"; // Relative route location mapping [cite: 713]

export default function UserProfileForm({
  profile,
  onSaveSuccess,
  onSaveError,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  // Sync prop changes to form state safely on component refresh/load
  useEffect(() => {
    setFormData({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      phoneNumber: profile.phoneNumber || "",
    });
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      const response = await api.put("/profile-settings/update", formData); // Triggers our backend logic route [cite: 727]

      if (response.data?.success) {
        setIsEditing(false);
        onSaveSuccess(
          "Your personal profile updates were processed successfully.",
        );
      }
    } catch (err) {
      console.error(err);
      onSaveError(
        err.message || "Failed to modify database profile properties.",
      );
    } finally {
      setSaveLoading(false);
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
                className="w-full text-slate-700 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 px-3 py-2 rounded-lg outline-none font-medium"
              />
            ) : (
              <p className="text-slate-700 font-medium bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                {profile.phoneNumber || "Not Configured"}
              </p>
            )}
          </div>
        </div>

        {/* Repositioned Active Control Area */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 py-2.5 border border-slate-200 hover:border-slate-300 rounded-xl shadow-sm text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-slate-500"
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
                onClick={() => setIsEditing(false)}
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

      {/* Box 2: Organization Allocation Context (Always Read Only) */}
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
