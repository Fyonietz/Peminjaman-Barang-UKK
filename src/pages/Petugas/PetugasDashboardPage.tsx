// src/pages/Petugas/PetugasDashboardPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, RotateCcw, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { http } from '../../services/api';

interface MonitorItem {
  id: number;
  peminjam: string;
  noTelepon: string;
  tanggalPeminjaman: string;
  tanggalPengembalian: string;
  hariTerlambat: number;
  totalBiaya: number;
}

export default function PetugasDashboardPage() {
  const [pendingCount, setPendingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [dueList, setDueList] = useState<MonitorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Read logged-in user details
  const sessionData = localStorage.getItem('campgear');
  const user = sessionData ? JSON.parse(sessionData)?.user : null;

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch pending loan requests count
      const pendingRes = await http.get('/peminjaman', {
        params: { status: 'diajukan', pageSize: 1 }
      });
      setPendingCount(pendingRes.data.total || 0);

      // 2. Fetch monitoring list for overdue / due loans
      const monitorRes = await http.get('/peminjaman/monitor', {
        params: { pageSize: 5 }
      });
      const items: MonitorItem[] = monitorRes.data.items || [];
      setDueList(items);

      const lateItems = items.filter((item) => item.hariTerlambat > 0);
      setOverdueCount(lateItems.length);
    } catch {
      // Non-blocking fallback if stats endpoints fail
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#29422c] to-[#32a149] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Selamat Datang, {user?.nama || 'Petugas'}!</h1>
          <p className="text-sm text-[#a0c2a6] mt-1">
            Panel operasional petugas untuk memproses persetujuan dan pengembalian unit barang.
          </p>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Menunggu Persetujuan
            </p>
            <h3 className="text-3xl font-extrabold text-gray-800 mt-2">
              {isLoading ? '...' : pendingCount}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Pengajuan peminjaman baru</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Peminjaman Terlambat
            </p>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-2">
              {isLoading ? '...' : overdueCount}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Perlu tindak lanjut pengembalian</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      {/* Action Shortcut Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link
          to="/dashboard/peminjaman"
          className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#32a149] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#32a149]/10 text-[#32a149] flex items-center justify-center group-hover:bg-[#32a149] group-hover:text-white transition-colors">
              <FileCheck size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 group-hover:text-[#32a149] transition-colors">
                Proses Persetujuan
              </h4>
              <p className="text-xs text-gray-500">Setujui/Tolak pengajuan peminjaman</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-400 group-hover:text-[#32a149] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/dashboard/pengembalian"
          className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#32a149] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#32a149]/10 text-[#32a149] flex items-center justify-center group-hover:bg-[#32a149] group-hover:text-white transition-colors">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 group-hover:text-[#32a149] transition-colors">
                Monitoring & Pengembalian
              </h4>
              <p className="text-xs text-gray-500">Proses pengembalian unit & hitung denda</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-400 group-hover:text-[#32a149] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Monitoring Preview Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#32a149]" />
            <h3 className="font-bold text-gray-800">Pemantauan Pengembalian Terdekat</h3>
          </div>
          <Link to="/dashboard/pengembalian" className="text-xs font-semibold text-[#32a149] hover:underline">
            Lihat Semua
          </Link>
        </div>

        {isLoading ? (
          <p className="text-xs text-gray-400 py-6 text-center">Memuat pemantauan...</p>
        ) : dueList.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">Tidak ada peminjaman jatuh tempo atau terlambat saat ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Peminjam</th>
                  <th className="px-4 py-3">Telepon</th>
                  <th className="px-4 py-3">Jatuh Tempo</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dueList.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{row.peminjam}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{row.noTelepon}</td>
                    <td className="px-4 py-3 text-gray-600">{row.tanggalPengembalian}</td>
                    <td className="px-4 py-3 text-right">
                      {row.hariTerlambat > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700">
                          Terlambat {row.hariTerlambat} Hari
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700">
                          Jatuh Tempo
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
