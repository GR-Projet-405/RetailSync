import React from 'react';

export default function UserProfileCard({ profile }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center h-fit">
      <div className="relative w-32 h-32 mb-4">
        {profile.profileImage ? (
          <img 
            src={profile.profileImage} 
            alt={profile.fullName} 
            className="w-full h-full object-cover rounded-full border-4 border-indigo-50"
          />
        ) : (
          <div className="w-full h-full bg-indigo-100 rounded-full border-4 border-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-4xl select-none">
            {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
          </div>
        )}
        <span className={`absolute bottom-1 right-2 block h-4 w-4 rounded-full ring-2 ring-white ${profile.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      </div>

      <h2 className="text-xl font-bold text-slate-800">{profile.fullName}</h2>
      <p className="text-sm text-slate-500 font-medium mb-2">@{profile.username}</p>
      
      <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-full tracking-wide uppercase">
        {profile.role?.name || 'NO ROLE ASSIGNED'}
      </span>

      <div className="w-full border-t border-slate-100 my-6"></div>

      <div className="w-full text-left space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">Employee ID:</span>
          <span className="text-slate-700 font-mono font-semibold">{profile.employeeId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">Account Status:</span>
          <span className={`font-bold text-xs px-2 py-0.5 rounded ${profile.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
            {profile.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400 font-medium">Last Login:</span>
          <span className="text-slate-600 font-medium">
            {profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}