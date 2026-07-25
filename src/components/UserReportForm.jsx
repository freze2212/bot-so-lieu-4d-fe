import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

export default function UserReportForm({ employees = [], onReportSubmitted }) {
  const [employeeCode, setEmployeeCode] = useState('GG88F4D04');
  const [employeeName, setEmployeeName] = useState('GHE BIFRONS');
  const [isCustomCode, setIsCustomCode] = useState(false);

  const [date, setDate] = useState(() => {
    const today = new Date();
    return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  });

  const [formData, setFormData] = useState({
    registeredCount: '',
    firstDepositCount: '',
    totalDeposit: '',
    totalBet: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Update employee name when code changes
  useEffect(() => {
    const emp = employees.find(
      (e) => e.code.toLowerCase() === employeeCode.toLowerCase()
    );
    if (emp) {
      setEmployeeName(emp.name);
    } else if (!isCustomCode && employees.length > 0) {
      // default first employee
      setEmployeeCode(employees[0].code);
      setEmployeeName(employees[0].name);
    }
  }, [employeeCode, employees, isCustomCode]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeCode.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng chọn hoặc nhập Mã hậu đài!' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Format date for API (YYYY-MM-DD)
      const now = new Date();
      const isoDate = now.toISOString().split('T')[0];

      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeCode: employeeCode.trim(),
          date: isoDate,
          registeredCount: Number(formData.registeredCount) || 0,
          firstDepositCount: Number(formData.firstDepositCount) || 0,
          totalDeposit: Number(formData.totalDeposit) || 0,
          totalBet: Number(formData.totalBet) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Lỗi gửi báo cáo!');
      }

      setStatus({
        type: 'success',
        message: 'Gửi báo cáo số liệu thành công!',
      });

      // Reset form
      setFormData({
        registeredCount: '',
        firstDepositCount: '',
        totalDeposit: '',
        totalBet: '',
      });

      if (onReportSubmitted) {
        onReportSubmitted();
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Không thể kết nối đến hệ thống server!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[90vh]">
      {/* Outer Container matching image popup design */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-6 sm:p-8 border border-slate-100 relative transition-all">

        {/* Title Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            BÁO CÁO SỐ LIỆU
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">
            Báo cáo CÁ NHÂN
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-[#f0f4fb] rounded-2xl p-4 mb-6 text-sm text-slate-700 space-y-2 border border-slate-200/50">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Ngày/tháng:</span>
            <span className="font-bold text-slate-900">{date}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Tên nhân viên:</span>
            <span className="font-bold text-slate-900 uppercase">{employeeName}</span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
            <span className="text-slate-500">Mã hậu đài:</span>
            <div className="flex items-center gap-2">
              {!isCustomCode && employees.length > 0 ? (
                <select
                  value={employeeCode}
                  onChange={(e) => {
                    if (e.target.value === 'NEW') {
                      setIsCustomCode(true);
                      setEmployeeCode('');
                      setEmployeeName('NHÂN VIÊN MỚI');
                    } else {
                      setEmployeeCode(e.target.value);
                    }
                  }}
                  className="font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.code}>
                      {emp.code} ({emp.name})
                    </option>
                  ))}
                  <option value="NEW">+ Nhập mã khác...</option>
                </select>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Mã hậu đài"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                    className="font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs outline-none w-28 uppercase"
                  />
                  {employees.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCustomCode(false)}
                      className="text-xs text-brand-600 underline font-medium hover:text-brand-800"
                    >
                      Danh sách
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {status.message && (
          <div
            className={`mb-6 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Field 1: Số khách đăng ký */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Số khách đăng kí
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.registeredCount}
              onChange={(e) => handleInputChange('registeredCount', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-base focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all"
            />
          </div>

          {/* Field 2: Số khách nạp đầu */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Số khách nạp đầu
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.firstDepositCount}
              onChange={(e) => handleInputChange('firstDepositCount', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-base focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all"
            />
          </div>

          {/* Field 3: Tổng Nạp / Ngày */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Tổng Nạp / Ngày
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.totalDeposit}
              onChange={(e) => handleInputChange('totalDeposit', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-base focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all"
            />
          </div>

          {/* Field 4: Tổng Cược / Ngày */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5">
              Tổng Cược / Ngày
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={formData.totalBet}
              onChange={(e) => handleInputChange('totalBet', e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-base focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 via-brand-500 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <span>Gửi báo cáo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
