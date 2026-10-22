// src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  RotateCcw,
  Wrench,
  Clock,
  ArrowRight,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import { http } from '../services/api';

interface MonitorItem {
  id: number;
  peminjam: string;
  noTelepon: string;
  tanggalPeminjaman: string;
  tanggalPengembalian: string;
  hariTerlambat: number;
  totalBiaya: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  // States for Stats Cards
  const [pendingCount, setPendingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [totalAlat, setTotalAlat] = useState(0);
  const [pendapatan, setPendapatan] = useState(0);

  // State for Table
  const [dueList, setDueList] = useState<MonitorItem[]>([]);

  // Get User Session
  const sessionData = localStorage.getItem('campgear');
  const user = sessionData ? JSON.parse(sessionData)?.user : null;
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch pending approvals (Menunggu Persetujuan)
      const pendingReq = http.get('/peminjaman', { params: { status: 'diajukan', pageSize: 1 } });

      // 2. Fetch monitor data (Untuk tabel & hitung yang terlambat)
      const monitorReq = http.get('/peminjaman/monitor', { params: { pageSize: 5 } });

      // Jalankan request dasar secara paralel
      const [pendingRes, monitorRes] = await Promise.all([pendingReq, monitorReq]);

      setPendingCount(pendingRes.data.total || 0);

      const items: MonitorItem[] = monitorRes.data.items || [];
      setDueList(items);
      setOverdueCount(items.filter((i) => i.hariTerlambat > 0).length);

      // 3. Fetch data khusus ADMIN (Total Alat, Pendapatan Bulan Ini)
      if (isAdmin) {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

        const [alatRes, laporanRes] = await Promise.all([
          http.get('/alat', { params: { pageSize: 1 } }),
          http.get('/laporan/peminjaman', { params: { from: firstDay, to: lastDay, format: 'json' } })
        ]);

        setTotalAlat(alatRes.data.total || 0);
        setPendapatan(laporanRes.data.totalBiaya || 0);
      }
    } catch (error) {
      console.error("Gagal memuat data dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-[#29422c] to-[#32a149] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Selamat Datang, {user?.nama || 'Pengguna'}! 👋</h1>
          <p className="text-sm text-[#a0c2a6] mt-1">
            {isAdmin
              ? 'Ringkasan sistem inventaris, transaksi, dan performa CampGear bulan ini.'
              : 'Pantau pengajuan baru dan jadwal pengembalian unit hari ini.'}
          </p>
        </div>
        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 self-start md:self-auto shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
          Role: {user?.role || 'Guest'}
        </div>
      </div>

      {/* 2. Statistik Cards Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-5`}>

        {/* Card: Pending Approval */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Menunggu Persetujuan</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{isLoading ? '...' : pendingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileCheck size={24} />
          </div>
        </div>

        {/* Card: Overdue */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Peminjaman Telat</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{isLoading ? '...' : overdueCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Admin Only Cards */}
        {isAdmin && (
          <>
            {/* Card: Total Alat */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Peralatan</p>
                <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{isLoading ? '...' : totalAlat}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench size={24} />
              </div>
            </div>

            {/* Card: Pendapatan Bulan Ini */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pendapatan (Bulan Ini)</p>
                <h3 className="text-lg font-extrabold text-[#32a149] mt-2">{isLoading ? '...' : formatRupiah(pendapatan)}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet size={24} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Quick Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link to="/dashboard/peminjaman" className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-[#32a149] transition-all flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#32a149]/10 text-[#32a149] flex items-center justify-center group-hover:bg-[#32a149] group-hover:text-white transition-colors">
              <FileCheck size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 group-hover:text-[#32a149] transition-colors">
                Proses Persetujuan Baru
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Tinjau dan setujui pengajuan peminjam</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-300 group-hover:text-[#32a149] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link to="/dashboard/pengembalian" className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-[#32a149] transition-all flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#32a149]/10 text-[#32a149] flex items-center justify-center group-hover:bg-[#32a149] group-hover:text-white transition-colors">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 group-hover:text-[#32a149] transition-colors">
                Monitoring Pengembalian
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Cek kondisi barang dan hitung denda</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-300 group-hover:text-[#32a149] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* 4. Monitoring Table Preview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#32a149]" />
            <h3 className="font-bold text-gray-800 text-sm">Pantauan Pengembalian Terdekat</h3>
          </div>
          <Link to="/dashboard/pengembalian" className="text-xs font-semibold text-[#32a149] hover:underline bg-[#32a149]/10 px-3 py-1.5 rounded-md">
            Lihat Semua
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Memuat data pantauan...</div>
        ) : dueList.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
            <RotateCcw size={32} className="mb-2 opacity-50" />
            <p className="text-sm">Tidak ada peminjaman aktif yang mendekati jatuh tempo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
                <tr>
                  <th className="px-5 py-4 font-semibold tracking-wide">Peminjam</th>
                  <th className="px-5 py-4 font-semibold tracking-wide">Tgl. Kembali</th>
                  <th className="px-5 py-4 font-semibold tracking-wide text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dueList.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-800">{row.peminjam}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{row.noTelepon}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 font-medium">
                      {row.tanggalPengembalian}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {row.hariTerlambat > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
                          <AlertTriangle size={10} /> TELAT {row.hariTerlambat} HARI
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                          JATUH TEMPO
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
