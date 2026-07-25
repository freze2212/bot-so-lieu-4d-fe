import React, { useState, useEffect } from 'react';
import UserOverviewDashboard from './components/UserOverviewDashboard';
import AdminDashboard from './components/AdminDashboard';
import { User, ShieldCheck } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

export default function App() {
  const [viewMode, setViewMode] = useState('user'); // 'user' | 'admin'
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error('Không thể lấy danh sách nhân viên:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* View Mode Switcher Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-xs tracking-wider uppercase text-slate-300">HỆ THỐNG BÁO CÁO 4D ONLINE</span>
          </div>

          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
            <button
              onClick={() => setViewMode('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'user'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Giao Diện User (Tổng Quan)</span>
            </button>

            <button
              onClick={() => setViewMode('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'admin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Trang Admin (Quản Trị)</span>
            </button>
          </div>
        </div>
      </header>

      {/* View Content */}
      <main className="flex-1">
        {viewMode === 'user' ? (
          <UserOverviewDashboard employees={employees} />
        ) : (
          <AdminDashboard
            employees={employees}
            onEmployeeAdded={fetchEmployees}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        BÁO CÁO 4D ONLINE • Hệ Thống Thống Kê Số Liệu Cá Nhân & Admin Dashboard
      </footer>
    </div>
  );
}
