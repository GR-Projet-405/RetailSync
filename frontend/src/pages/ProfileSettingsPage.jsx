import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Custom centralized instance 
import PageHeader from '../components/PageHeader';
import UserProfileCard from '../features/profile-settings/UserProfileCard';
import UserProfileForm from '../features/profile-settings/UserProfileForm';

export default function ProfileSettingsPage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch unified profile data from backend
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile-settings'); // Custom wrapper handler [cite: 721, 723]
      if (response.data?.success) {
        setProfileData(response.data.data.profile);
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError(err.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
          <span className="ml-3 text-slate-600 font-medium">Loading profile context...</span>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-center font-medium">
          {successMsg}
        </div>
      )}

      {!loading && !error && profileData && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Component 1: Presentational Profile Summary Card */}
          <UserProfileCard profile={profileData} />

          {/* Component 2: Interactive Personal Details Form Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            <UserProfileForm 
              profile={profileData} 
              onSaveSuccess={(msg) => {
                setError(null);
                setSuccessMsg(msg);
                fetchProfile(); // Refetches and triggers clean prop re-renders
              }}
              onSaveError={(err) => {
                setSuccessMsg('');
                setError(err?.message ?? err);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}