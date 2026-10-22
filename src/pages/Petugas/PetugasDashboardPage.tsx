// src/pages/Petugas/PetugasDashboardPage.tsx
import { useState, useEffect } from 'react';
import { FileCheck, AlertTriangle, Clock } from 'lucide-react';
import { http } from '../../services/api';

interface MonitorItem {
  id: number;
  peminjam: string;
  noTelepon: string;
  tanggalPengembalian: string;
  hariTerlambat: number;
}

export default function PetugasDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [dueList, setDueList] = useState<MonitorItem[]>([]);

  const sessionData = localStorage.getItem('campgear');
  const user = sessionData ? JSON.parse(sessionData)?.user : null;

  useEffect(() => {
    fetchPetugasStats();
  }, []);

  const fetchPetugasStats = async () => {
    setIsLoading(true);
    try {
      const [pendingRes, monitorRes] = await Promise.all([
        http.get('/peminjaman', { params: { status: 'diajukan', pageSize: 1 } }),
        http.get('/peminjaman/monitor', { params: { pageSize: 5 } })
      ]);

      setPendingCount(pendingRes.data.total || 0);
      const items: MonitorItem[] = monitorRes.data.items || [];
      setDueList(items);
      setOverdueCount(items.filter((i) => i.hariTerlambat > 0).length);
    } catch (error) {
      console.error("Gagal memuat data petugas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div className="bg-gradient-to-r from-[#29422c] to-[#32a149] text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Selamat Datang, {user?.nama || 'Petugas'}! 👋</h1>
          <p className="text-sm text-[#a0c2a6] mt-1">Pantau pengajuan baru dan jadwal pengembalian unit hari ini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Menunggu Persetujuan</p>
            <h3 className="text-2xl font-extrabold text-gray-800 mt-1">{isLoading ? '...' : pendingCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center"><FileCheck size={24} /></div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase">Peminjaman Telat</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{isLoading ? '...' : overdueCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center"><AlertTriangle size={24} /></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#32a149]" />
            <h3 className="font-bold text-gray-800 text-sm">Pantauan Pengembalian Terdekat</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 font-semibold">Peminjam</th>
                <th className="px-5 py-4 font-semibold">Tgl. Kembali</th>
                <th className="px-5 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dueList.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/80">
                  <td className="px-5 py-3.5"><div className="font-semibold text-gray-800">{row.peminjam}</div><div className="text-xs text-gray-400 font-mono">{row.noTelepon}</div></td>
                  <td className="px-5 py-3.5 text-gray-600 font-medium">{row.tanggalPengembalian}</td>
                  <td className="px-5 py-3.5 text-right">
                    {row.hariTerlambat > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600"><AlertTriangle size={10} /> TELAT {row.hariTerlambat} HARI</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600">JATUH TEMPO</span>
                    )}
                  </td>
                </tr>
              ))}
              {dueList.length === 0 && !isLoading && <tr><td colSpan={3} className="text-center py-8 text-gray-400">Tidak ada pengembalian mendekati jatuh tempo.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
