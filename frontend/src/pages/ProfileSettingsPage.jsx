import React, { useState, useEffect } from "react";
// Import your custom configured axios instance from its relative directory
import api from "../services/api";
import PageHeader from "../components/PageHeader";

export default function ProfileSettingsPage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Hits the backend endpoint via the pre-configured base URL interceptor
        const response = await api.get("/profile-settings");

        if (response.data && response.data.success) {
          setProfileData(response.data.data.profile);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        // Your api.js transforms error objects directly to text instances, so err.message works cleanly
        setError(err.message || "Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Profile & Settings"
        description="View your personal information, role assignments, and branch metrics."
      />

      {loading && (
        <div className="mt-8 flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-slate-600 font-medium">
            Loading profile context...
          </span>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {!loading && !error && profileData && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Main Profile Overview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="relative w-32 h-32 mb-4">
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt={profileData.fullName}
                  className="w-full h-full object-cover rounded-full border-4 border-indigo-50"
                />
              ) : (
                <div className="w-full h-full bg-indigo-100 rounded-full border-4 border-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-4xl">
                  {profileData.firstName?.charAt(0)}
                  {profileData.lastName?.charAt(0)}
                </div>
              )}
              <span
                className={`absolute bottom-1 right-2 block h-4 w-4 rounded-full ring-2 ring-white ${profileData.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"}`}
              />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              {profileData.fullName}
            </h2>
            <p className="text-sm text-slate-500 font-medium mb-2">
              @{profileData.username}
            </p>

            <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-full tracking-wide">
              {profileData.role?.name || "NO ROLE ASSIGNED"}
            </span>

            <div className="w-full border-t border-slate-100 my-6"></div>

            <div className="w-full text-left space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Employee ID:</span>
                <span className="text-slate-700 font-mono font-semibold">
                  {profileData.employeeId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">
                  Account Status:
                </span>
                <span
                  className={`font-bold text-xs px-2 py-0.5 rounded ${profileData.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}
                >
                  {profileData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">
                  Last Sync/Login:
                </span>
                <span className="text-slate-600 font-medium">
                  {profileData.lastLogin
                    ? new Date(profileData.lastLogin).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Context Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Box 1: Personal Information */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <p className="text-slate-700 font-medium bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {profileData.firstName}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <p className="text-slate-700 font-medium bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {profileData.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <p className="text-slate-700 font-medium bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {profileData.email}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <p className="text-slate-700 font-medium bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {profileData.phoneNumber || "Not Configured"}
                  </p>
                </div>
              </div>
            </div>

            {/* Box 2: Organization & Assignment Context */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                Workspace Allocation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Assigned Branch Name
                  </label>
                  <p className="text-slate-700 font-medium bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {profileData.branch?.name || "Global Access / Central"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Branch Code Reference
                  </label>
                  <p className="text-slate-700 font-mono font-semibold bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg">
                    {profileData.branch?.code || "SYSTEM_ADMIN"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
