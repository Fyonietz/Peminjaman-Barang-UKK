// src/pages/Admin/AdminDashboardPage.tsx
import { useState, useEffect } from 'react';
import { Wrench, Users, Wallet } from 'lucide-react';
import { http } from '../../services/api';

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [totalAlat, setTotalAlat] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendapatan, setPendapatan] = useState(0);

  const sessionData = localStorage.getItem('campgear');
  const user = sessionData ? JSON.parse(sessionData)?.user : null;

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

      const [alatRes, userRes, laporanRes] = await Promise.all([
        http.get('/alat', { params: { pageSize: 1 } }),
        http.get('/users', { params: { pageSize: 1 } }),
        http.get('/laporan/peminjaman', { params: { from: firstDay, to: lastDay, format: 'json' } })
      ]);

      setTotalAlat(alatRes.data.total || 0);
      setTotalUsers(userRes.data.total || 0);
      setPendapatan(laporanRes.data.totalBiaya || 0);
    } catch (error) {
      console.error("Gagal memuat data admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="bg-gradient-to-r from-[#29422c] to-[#32a149] text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Selamat Datang, {user?.nama || 'Admin'}! 👋</h1>
          <p className="text-sm text-[#a0c2a6] mt-1">Panel kontrol sistem inventaris dan master data CampGear.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Total Peralatan</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{isLoading ? '...' : totalAlat}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center"><Wrench size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Total Pengguna</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{isLoading ? '...' : totalUsers}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center"><Users size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Pendapatan Bulan Ini</p>
            <h3 className="text-lg font-extrabold text-[#32a149] mt-2">{isLoading ? '...' : formatRupiah(pendapatan)}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Wallet size={24} /></div>
        </div>
      </div>
    </div>
  );
}
