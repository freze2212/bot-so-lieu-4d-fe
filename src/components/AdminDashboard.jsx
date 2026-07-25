import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  TrendingUp,
  CreditCard,
  DollarSign,
  LogOut,
  BarChart3,
  Calendar,
  Lock,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Send,
  Clock,
  Bot,
  Link,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const API_BASE = 'http://localhost:3001/api';

export default function AdminDashboard({ employees, onEmployeeAdded }) {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'employees' | 'reports' | 'telegram'

  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'admin123' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [statsData, setStatsData] = useState({
    summary: {
      totalRegistered: 0,
      totalFirstDeposit: 0,
      grandTotalDeposit: 0,
      grandTotalBet: 0,
      totalReports: 0,
    },
    dailyStats: [],
    employeeStats: [],
  });

  const [reportsList, setReportsList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmp, setNewEmp] = useState({ name: '', code: '' });
  const [empStatus, setEmpStatus] = useState({ type: '', message: '' });
  const [empLoading, setEmpLoading] = useState(false);

  // Telegram Config State
  const [teleConfig, setTeleConfig] = useState({
    botToken: '',
    chatId: '',
    scheduleTime: '13:00',
    feUrl: 'https://baocao4d.online',
    enabled: true,
  });
  const [teleStatus, setTeleStatus] = useState({ type: '', message: '' });
  const [teleLoading, setTeleLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchTeleConfig();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [resStats, resReports] = await Promise.all([
        fetch(`${API_BASE}/reports/stats`),
        fetch(`${API_BASE}/reports`),
      ]);

      if (resStats.ok) {
        const sData = await resStats.json();
        setStatsData(sData);
      }
      if (resReports.ok) {
        const rData = await resReports.json();
        setReportsList(rData);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu dashboard:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchTeleConfig = async () => {
    try {
      const res = await fetch(`${API_BASE}/telegram/config`);
      if (res.ok) {
        const data = await res.json();
        setTeleConfig(data);
      }
    } catch (err) {
      console.error('Lỗi lấy cấu hình Telegram:', err);
    }
  };

  const handleSaveTeleConfig = async (e) => {
    e.preventDefault();
    setTeleLoading(true);
    setTeleStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_BASE}/telegram/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teleConfig),
      });

      if (!res.ok) throw new Error('Lỗi lưu cấu hình Telegram');
      setTeleStatus({ type: 'success', message: 'Đã lưu cấu hình Bot Telegram thành công!' });
    } catch (err) {
      setTeleStatus({ type: 'error', message: err.message });
    } finally {
      setTeleLoading(false);
    }
  };

  const handleTestSendTelegram = async () => {
    setTeleLoading(true);
    setTeleStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_BASE}/telegram/send-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teleConfig),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi gửi tin nhắn Telegram');

      setTeleStatus({ type: 'success', message: '🚀 Đã gửi tin nhắn nhắc báo cáo Telegram thành công vào nhóm!' });
    } catch (err) {
      setTeleStatus({ type: 'error', message: err.message });
    } finally {
      setTeleLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      localStorage.setItem('adminToken', data.accessToken);
      setToken(data.accessToken);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('adminToken');
    setToken('');
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.code) {
      setEmpStatus({ type: 'error', message: 'Vui lòng điền đủ Tên và Mã hậu đài!' });
      return;
    }

    setEmpLoading(true);
    setEmpStatus({ type: '', message: '' });

    try {
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmp),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Lỗi thêm nhân viên');
      }

      setEmpStatus({ type: 'success', message: `Đã thêm nhân viên ${data.name} (${data.code})!` });
      setNewEmp({ name: '', code: '' });
      if (onEmployeeAdded) onEmployeeAdded();
      setTimeout(() => {
        setShowAddEmpModal(false);
        setEmpStatus({ type: '', message: '' });
      }, 1200);
    } catch (err) {
      setEmpStatus({ type: 'error', message: err.message });
    } finally {
      setEmpLoading(false);
    }
  };

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
  };

  const chartData = (statsData.dailyStats || []).map(item => {
    const parts = item.date.split('-');
    const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.date;
    return {
      ...item,
      dateFormatted: formatted,
      totalDepositK: Math.round((item.totalDeposit || 0) / 1000),
      totalBetK: Math.round((item.totalBet || 0) / 1000),
    };
  });

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-8 text-white">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white">Đăng nhập Admin</h2>
            <p className="text-slate-400 text-sm mt-1">Truy cập Bảng điều khiển quản trị số liệu</p>
          </div>

          {loginError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-medium border border-rose-500/20 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Tài khoản</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                placeholder="Tên tài khoản"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-1">Mật khẩu</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                placeholder="Mật khẩu"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all mt-2"
            >
              {loginLoading ? 'Đang xác thực...' : 'Đăng nhập Admin'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Tài khoản mặc định: <span className="font-mono text-slate-300 font-bold">admin</span> / <span className="font-mono text-slate-300 font-bold">admin123</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#070a12] text-slate-100">
      {/* Top Header Bar */}
      <div className="bg-[#0b0f19] rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800/80 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            <span>QUẢN TRỊ & THỐNG KÊ SỐ LIỆU</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Bảng tổng hợp báo cáo doanh số & nhân viên</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddEmpModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tạo Nhân Viên</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'stats'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Biểu Đồ & Thống Kê</span>
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'telegram'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Bot Telegram Tự Động</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'employees'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản Lý Nhân Viên ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'reports'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Lịch Sử Báo Cáo ({reportsList.length})</span>
        </button>
      </div>

      {/* TELEGRAM BOT TAB */}
      {activeTab === 'telegram' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Config */}
          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="w-6 h-6 text-indigo-400" />
                <span>Cấu Hình Telegram Bot Nhắc Báo Cáo</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Tự động gửi tin nhắn kèm nút bấm vào nhóm hằng ngày</p>
            </div>

            {teleStatus.message && (
              <div
                className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  teleStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {teleStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                )}
                <span>{teleStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveTeleConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Telegram Bot Token (Từ @BotFather)
                </label>
                <input
                  type="text"
                  placeholder="VD: 123456789:ABCdefGhIJKlmNoPQrsTUVwxyZ"
                  value={teleConfig.botToken}
                  onChange={(e) => setTeleConfig({ ...teleConfig, botToken: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Chat ID Nhóm Telegram
                </label>
                <input
                  type="text"
                  placeholder="VD: -1001234567890"
                  value={teleConfig.chatId}
                  onChange={(e) => setTeleConfig({ ...teleConfig, chatId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Khung Giờ Tự Động Gửi
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="13:00"
                      value={teleConfig.scheduleTime}
                      onChange={(e) => setTeleConfig({ ...teleConfig, scheduleTime: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Link Web Báo Cáo
                  </label>
                  <div className="relative">
                    <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder="http://localhost:5173/"
                      value={teleConfig.feUrl}
                      onChange={(e) => setTeleConfig({ ...teleConfig, feUrl: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={teleLoading}
                  className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20"
                >
                  Lưu Cấu Hình
                </button>
                <button
                  type="button"
                  onClick={handleTestSendTelegram}
                  disabled={teleLoading}
                  className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Test Gửi Ngay</span>
                </button>
              </div>
            </form>
          </div>

          {/* TELEGRAM MESSAGE LIVE PREVIEW MATCHING USER SCREENSHOT */}
          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl space-y-4">
            <h3 className="text-sm font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Xem Trước Tin Nhắn Telegram</span>
            </h3>

            {/* Telegram Message Box Card */}
            <div className="bg-[#182533] rounded-2xl p-4 text-slate-100 space-y-3 border border-slate-700/50 shadow-inner font-sans">
              <div className="text-xs text-blue-400 font-bold flex items-center gap-1.5 border-b border-slate-700/50 pb-2">
                <span>🤖📊 BOT BÁO CÁO HẰNG NGÀY 📊🤖</span>
              </div>

              <div className="text-xs sm:text-sm leading-relaxed text-slate-200 space-y-2 whitespace-pre-line">
                <p>Tới giờ báo cáo số liệu hôm nay rồi nha anh em ✨</p>
                <p>Mọi người chỉ cần bấm nút bên dưới và nhập CODE cá nhân là có thể báo cáo ngay 🚀</p>
                <p>📝 Nếu nhập sai số liệu vẫn có thể vào chỉnh sửa lại sau đó nha~</p>
                <p className="font-bold text-amber-300">⚠️ Mọi người nhớ báo cáo đầy đủ và đúng giờ quy định.</p>
                <p>Đúng {teleConfig.scheduleTime || '13:00'} ngày mai em sẽ tổng hợp lại danh sách các trường hợp:<br />
                • Chưa báo cáo<br />
                • Báo cáo thiếu<br />
                • Báo sai số liệu</p>
                <p>và gửi anh NICE (@N_I_C_E_838) để xử lý theo quy định của team 😈</p>
              </div>

              {/* Telegram Inline Buttons */}
              <div className="pt-2 space-y-2">
                <a
                  href={teleConfig.feUrl || 'http://localhost:5173/'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-[#2b5278] hover:bg-[#34608c] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-blue-400/20 shadow-sm transition-all"
                >
                  <span>📝 Báo Cáo Ngay</span>
                </a>

                <a
                  href={`${teleConfig.feUrl || 'http://localhost:5173/'}?mode=admin`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-[#2b5278] hover:bg-[#34608c] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-blue-400/20 shadow-sm transition-all"
                >
                  <span>🔗 Dashboard</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS OVERVIEW TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Đăng Ký</p>
                <h3 className="text-2xl font-black text-white">{statsData.summary.totalRegistered}</h3>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Khách Nạp Đầu</p>
                <h3 className="text-2xl font-black text-white">{statsData.summary.totalFirstDeposit}</h3>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Nạp</p>
                <h3 className="text-xl font-black text-amber-400">{formatVND(statsData.summary.grandTotalDeposit)}</h3>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng Cược</p>
                <h3 className="text-xl font-black text-purple-400">{formatVND(statsData.summary.grandTotalBet)}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                  Tổng Nạp & Tổng Cược
                </h3>
                <div className="flex items-center gap-5 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
                    <span className="text-slate-300">Tổng nạp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50"></span>
                    <span className="text-slate-300">Tổng cược</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminGlowDeposit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="adminGlowBet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c084fc" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#c084fc" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="dateFormatted" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}K`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="totalBetK" name="Tổng cược" stroke="#c084fc" strokeWidth={2.5} fillOpacity={1} fill="url(#adminGlowBet)" />
                    <Area type="monotone" dataKey="totalDepositK" name="Tổng nạp" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#adminGlowDeposit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                  Đăng Ký & Nạp Lần Đầu
                </h3>
                <div className="flex items-center gap-5 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50"></span>
                    <span className="text-slate-300">Đăng ký</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
                    <span className="text-slate-300">Nạp lần đầu</span>
                  </div>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="adminGlowReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="adminGlowFirst" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="dateFormatted" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                    <Area type="monotone" dataKey="firstDeposit" name="Nạp lần đầu" stroke="#34d399" strokeWidth={2.5} fillOpacity={1} fill="url(#adminGlowFirst)" />
                    <Area type="monotone" dataKey="registered" name="Đăng ký" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#adminGlowReg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Thống Kê Doanh Số Theo Nhân Viên (Mã Hậu Đài)</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-xs">
                  <tr>
                    <th className="p-3">Mã Hậu Đài</th>
                    <th className="p-3">Tên Nhân Viên</th>
                    <th className="p-3 text-center">Số Lượt Báo Cáo</th>
                    <th className="p-3 text-center">Số Khách ĐK</th>
                    <th className="p-3 text-center">Khách Nạp Đầu</th>
                    <th className="p-3 text-right">Tổng Nạp</th>
                    <th className="p-3 text-right">Tổng Cược</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {statsData.employeeStats.map((emp) => (
                    <tr key={emp.employeeCode} className="hover:bg-slate-900/60 transition-all">
                      <td className="p-3 font-mono font-bold text-indigo-400">{emp.employeeCode}</td>
                      <td className="p-3 font-medium text-white">{emp.employeeName}</td>
                      <td className="p-3 text-center">{emp.reportCount}</td>
                      <td className="p-3 text-center font-semibold text-blue-400">{emp.registered}</td>
                      <td className="p-3 text-center font-semibold text-emerald-400">{emp.firstDeposit}</td>
                      <td className="p-3 text-right font-bold text-amber-400">{formatVND(emp.totalDeposit)}</td>
                      <td className="p-3 text-right font-bold text-purple-400">{formatVND(emp.totalBet)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEES TAB */}
      {activeTab === 'employees' && (
        <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Danh Sách Nhân Viên</h3>
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Nhân Viên Mới</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-xs">
                <tr>
                  <th className="p-3">STT</th>
                  <th className="p-3">Tên Nhân Viên</th>
                  <th className="p-3">Mã Hậu Đài</th>
                  <th className="p-3">Ngày Tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map((emp, idx) => (
                  <tr key={emp.id} className="hover:bg-slate-900/60 transition-all">
                    <td className="p-3 font-semibold text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-bold text-white uppercase">{emp.name}</td>
                    <td className="p-3 font-mono font-bold text-indigo-400">{emp.code}</td>
                    <td className="p-3 text-slate-400">
                      {new Date(emp.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS HISTORY TAB */}
      {activeTab === 'reports' && (
        <div className="bg-[#0b0f19] p-6 rounded-2xl border border-slate-800/90 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Lịch Sử Chi Tiết Các Báo Cáo Đã Gửi</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-bold text-xs">
                <tr>
                  <th className="p-3">Thời Gian Gửi</th>
                  <th className="p-3">Ngày Báo Cáo</th>
                  <th className="p-3">Mã Hậu Đài</th>
                  <th className="p-3">Tên Nhân Viên</th>
                  <th className="p-3 text-center">Khách ĐK</th>
                  <th className="p-3 text-center">Khách Nạp Đầu</th>
                  <th className="p-3 text-right">Tổng Nạp</th>
                  <th className="p-3 text-right">Tổng Cược</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reportsList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/60 transition-all">
                    <td className="p-3 text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-3 font-semibold text-slate-200">{r.date}</td>
                    <td className="p-3 font-mono font-bold text-indigo-400">{r.employeeCode}</td>
                    <td className="p-3 font-medium text-white">{r.employeeName}</td>
                    <td className="p-3 text-center font-bold text-blue-400">{r.registeredCount}</td>
                    <td className="p-3 text-center font-bold text-emerald-400">{r.firstDepositCount}</td>
                    <td className="p-3 text-right font-bold text-amber-400">{formatVND(r.totalDeposit)}</td>
                    <td className="p-3 text-right font-bold text-purple-400">{formatVND(r.totalBet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE EMPLOYEE MODAL */}
      {showAddEmpModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 text-white">
            <h3 className="text-xl font-bold text-white mb-1">Tạo Nhân Viên Mới</h3>
            <p className="text-xs text-slate-400 mb-4">Thêm mã hậu đài để nhân viên báo cáo số liệu</p>

            {empStatus.message && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  empStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {empStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                )}
                <span>{empStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Tên Nhân Viên</label>
                <input
                  type="text"
                  placeholder="Ví dụ: GHE BIFRONS"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Mã Hậu Đài</label>
                <input
                  type="text"
                  placeholder="Ví dụ: GG88F4D04"
                  value={newEmp.code}
                  onChange={(e) => setNewEmp({ ...newEmp, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm uppercase font-mono font-bold"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm transition-all border border-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={empLoading}
                  className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/20 transition-all"
                >
                  {empLoading ? 'Đang tạo...' : 'Xác Nhận Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
