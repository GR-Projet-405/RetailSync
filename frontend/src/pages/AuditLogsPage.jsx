import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import PageHeader from '../components/PageHeader';

export default function AuditLogsPage() {
  const navigate = useNavigate();

  // Mock data for the Audit Log
  const logs = [
    { id: 1, user: "Alex Rivers", action: "Clock In", time: "08:35 AM", details: "Shift started at Engineering Dept." },
    { id: 2, user: "Sarah Jenkins", action: "Processed Sale #HV-1023", time: "10:15 AM", details: "Amount: Rs. 14,250" },
    { id: 3, user: "Michael Chen", action: "Inventory Update", time: "11:40 AM", details: "Added 50 units of Wireless Earbuds" },
    { id: 4, user: "Jessica Li", action: "Clock Out", time: "05:00 PM", details: "Shift ended. Total Hours: 8h 20m" },
    { id: 5, user: "System Admin", action: "System Backup", time: "02:00 AM", details: "Automated nightly backup completed" },
  ];

  return (
    <div className="space-y-6 w-full pb-10">
      
      {/* Back Button above the header */}
      <button 
        onClick={() => navigate('/dashboard')} 
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition mb-2"
      >
        <FaArrowLeft /> Back to Dashboard
      </button>

      {/* Your original PageHeader */}
      <PageHeader
        title="Audit Logs"
        description="Complete history of all system events and employee actions."
      />

      {/* The Main Table Area */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        
        <div className="flex justify-between items-center mb-6">
          <div className="text-slate-500 text-sm">
            Showing <span className="font-medium text-slate-700">{logs.length}</span> recent records
          </div>
          <button className="bg-slate-100 text-slate-700 text-xs px-4 py-2 rounded-lg hover:bg-slate-200 transition">
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50 border-y border-slate-100">
              <tr>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Action</th>
                <th className="px-6 py-3 font-semibold">Time</th>
                <th className="px-6 py-3 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{log.user}</td>
                  <td className="px-6 py-4">{log.action}</td>
                  <td className="px-6 py-4 text-slate-500">{log.time}</td>
                  <td className="px-6 py-4 text-slate-500">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
          <span>Showing {logs.length} of 1248 records</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-slate-100 rounded hover:bg-slate-200 text-slate-600">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
}