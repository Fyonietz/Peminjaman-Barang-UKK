// src/pages/Admin/LogAktivitasPage.tsx
import { useState, useEffect, FormEvent } from 'react';
import { Clock, Search, Calendar, User } from 'lucide-react';
import { http } from '../../services/api';
import Table, { type Column } from '../../components/ui/Table';

interface LogAktivitas {
  id: number;
  idUser: number;
  namaUser: string;
  aktivitas: string;
  waktu: string;
}

interface UserOption {
  id: number;
  nama: string;
}

export default function LogAktivitasPage() {
  const [data, setData] = useState<LogAktivitas[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [total, setTotal] = useState(0);

  // Filter States
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Set default dates (7 hari terakhir)
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const [fromDate, setFromDate] = useState(lastWeek.toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(today.toISOString().split('T')[0]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedUser]);

  const fetchUsers = async () => {
    try {
      // Ambil daftar petugas dan admin untuk filter dropdown
      const response = await http.get('/users', { params: { pageSize: 100 } });
      const items = response.data.items || [];
      // Filter hanya admin dan petugas jika memungkinkan, atau tampilkan semua
      setUsers(items);
    } catch {
      // Non-blocking
    }
  };

  const fetchData = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (toDate < fromDate) {
      setError('Tanggal akhir tidak boleh lebih awal dari tanggal mulai.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get('/log-aktivitas', {
        params: {
          page,
          pageSize,
          idUser: selectedUser || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
        },
      });

      setData(response.data.items || []);
      setTotal(response.data.total || 0);

      if (e) setPage(1); // Reset ke halaman 1 jika di-trigger oleh tombol cari
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mengambil data log aktivitas.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Utility ---
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date);
  };

  const columns: Column<LogAktivitas>[] = [
    {
      header: 'ID LOG',
      accessor: 'id',
      className: 'w-20 font-mono text-gray-500 text-xs'
    },
    {
      header: 'WAKTU',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm font-medium">{formatDateTime(row.waktu)}</span>
        </div>
      ),
      className: 'w-48'
    },
    {
      header: 'PENGGUNA',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
            {row.namaUser.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-gray-800">{row.namaUser}</span>
        </div>
      ),
      className: 'w-48'
    },
    {
      header: 'KETERANGAN AKTIVITAS',
      accessor: 'aktivitas',
      className: 'text-gray-700'
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Log Aktivitas Sistem</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau jejak rekam tindakan pengguna (audit trail) di dalam sistem</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Filter Bar */}
      <form onSubmit={fetchData} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-end gap-4">

        <div className="flex flex-col gap-1.5 w-full md:w-auto flex-1">
          <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <User size={12} /> Filter Pengguna
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20"
          >
            <option value="">Semua Pengguna</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.nama}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 w-full md:w-auto flex-1">
          <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <Calendar size={12} /> Dari Tanggal
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20"
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full md:w-auto flex-1">
          <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <Calendar size={12} /> Sampai Tanggal
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-5 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Search size={16} /> Filter Log
        </button>
      </form>

      {/* Paginated Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table
          data={data}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Tidak ada aktivitas yang tercatat pada kriteria filter ini."
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: (newPage) => setPage(newPage)
          }}
        />
      </div>
    </div>
  );
}
