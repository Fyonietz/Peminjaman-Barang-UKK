// src/pages/Admin/LaporanPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { FileSpreadsheet, Download, Calendar, Search, FileText } from 'lucide-react';
import { http } from '../../services/api';
import Table, { type Column } from '../../components/ui/Table';

interface PeminjamanReportItem {
  id: number;
  peminjam: string;
  petugas: string;
  status: string;
  tanggalPeminjaman: string;
  tanggalPengembalian: string;
  jumlahAlat: number;
  totalBiaya: number;
}

interface PengembalianReportItem {
  id: number;
  idPeminjaman: number;
  peminjam: string;
  tanggalKembali: string;
  keterlambatanPengembalian: number;
  dendaKondisi: number;
  denda: number;
}

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<'peminjaman' | 'pengembalian'>('peminjaman');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set default date range to current month
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);

  // Data States
  const [dataPeminjaman, setDataPeminjaman] = useState<PeminjamanReportItem[]>([]);
  const [dataPengembalian, setDataPengembalian] = useState<PengembalianReportItem[]>([]);
  const [summaryTotal, setSummaryTotal] = useState<number>(0);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchReport = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (toDate < fromDate) {
      setError('Tanggal akhir tidak boleh lebih awal dari tanggal mulai.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get(`/laporan/${activeTab}`, {
        params: { from: fromDate, to: toDate, format: 'json' }
      });

      if (activeTab === 'peminjaman') {
        setDataPeminjaman(response.data.items || []);
        setSummaryTotal(response.data.totalBiaya || 0);
      } else {
        setDataPengembalian(response.data.items || []);
        setSummaryTotal(response.data.totalDenda || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal memuat data laporan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
    if (toDate < fromDate) {
      setError('Tanggal akhir tidak boleh lebih awal dari tanggal mulai.');
      return;
    }

    setIsExporting(true);
    setError(null);
    try {
      // Menggunakan axios dengan responseType blob untuk menangani file CSV
      const response = await http.get(`/laporan/${activeTab}`, {
        params: { from: fromDate, to: toDate, format: 'csv' },
        responseType: 'blob'
      });

      // Membuat blob URL dan men-trigger download
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-${activeTab}-${fromDate}-to-${toDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Gagal mengunduh file CSV laporan.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disetujui': return <span className="text-blue-600 font-semibold">{status}</span>;
      case 'dipinjam': return <span className="text-purple-600 font-semibold">{status}</span>;
      case 'selesai': return <span className="text-emerald-600 font-semibold">{status}</span>;
      case 'ditolak': return <span className="text-rose-600 font-semibold">{status}</span>;
      default: return <span className="text-gray-600 font-semibold">{status}</span>;
    }
  };

  // --- Columns Config ---
  const peminjamanColumns: Column<PeminjamanReportItem>[] = [
    { header: 'ID', accessor: 'id', className: 'font-mono text-gray-500 w-16' },
    { header: 'TANGGAL PINJAM', accessor: 'tanggalPeminjaman' },
    { header: 'PEMINJAM', accessor: (row) => <span className="font-semibold text-gray-800">{row.peminjam}</span> },
    { header: 'STATUS', accessor: (row) => getStatusBadge(row.status) },
    { header: 'JML ALAT', accessor: (row) => <span className="text-center block">{row.jumlahAlat}</span> },
    { header: 'TOTAL BIAYA', accessor: (row) => <span className="font-semibold text-[#32a149]">{formatRupiah(row.totalBiaya)}</span> },
    { header: 'PETUGAS', accessor: 'petugas', className: 'text-gray-500 text-xs' }
  ];

  const pengembalianColumns: Column<PengembalianReportItem>[] = [
    { header: 'ID KEMBALI', accessor: 'id', className: 'font-mono text-gray-500 w-16' },
    { header: 'ID PINJAM', accessor: 'idPeminjaman', className: 'font-mono text-gray-500 w-16' },
    { header: 'TANGGAL KEMBALI', accessor: 'tanggalKembali' },
    { header: 'PEMINJAM', accessor: (row) => <span className="font-semibold text-gray-800">{row.peminjam}</span> },
    { header: 'TELAT', accessor: (row) => `${row.keterlambatanPengembalian} Hari` },
    { header: 'DENDA KONDISI', accessor: (row) => <span className="text-amber-600">{formatRupiah(row.dendaKondisi || 0)}</span> },
    { header: 'TOTAL DENDA', accessor: (row) => <span className="font-semibold text-rose-600">{formatRupiah(row.denda)}</span> },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cetak Laporan</h1>
          <p className="text-sm text-gray-500 mt-1">Buat dan unduh laporan transaksi peminjaman serta pengembalian</p>
        </div>
        <button
          onClick={handleDownloadCsv}
          disabled={isExporting || (activeTab === 'peminjaman' ? dataPeminjaman.length === 0 : dataPengembalian.length === 0)}
          className="flex items-center justify-center gap-2 bg-[#32a149] hover:bg-[#2a8a3d] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          {isExporting ? <span className="animate-pulse">Menyiapkan...</span> : <Download size={18} />}
          Unduh CSV
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('peminjaman')}
          className={`px-6 py-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'peminjaman' ? 'border-[#32a149] text-[#32a149]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} /> Laporan Peminjaman
        </button>
        <button
          onClick={() => setActiveTab('pengembalian')}
          className={`px-6 py-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'pengembalian' ? 'border-[#32a149] text-[#32a149]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileSpreadsheet size={16} /> Laporan Pengembalian
        </button>
      </div>

      {/* Filter Bar & Summary */}
      <div className="flex flex-col lg:flex-row gap-5">
        <form onSubmit={fetchReport} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-end gap-4 flex-1">
          <div className="flex flex-col gap-1.5 w-full sm:w-auto flex-1">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Calendar size={12} /> Tanggal Mulai</label>
            <input
              type="date"
              required
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-auto flex-1">
            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Calendar size={12} /> Tanggal Akhir</label>
            <input
              type="date"
              required
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20"
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            <Search size={16} /> Tampilkan
          </button>
        </form>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl shadow-sm text-white flex flex-col justify-center min-w-[250px]">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Total {activeTab === 'peminjaman' ? 'Biaya Sewa' : 'Denda'}
          </p>
          <h3 className={`text-3xl font-bold mt-1 ${activeTab === 'peminjaman' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatRupiah(summaryTotal)}
          </h3>
          <p className="text-xs text-gray-400 mt-1">Pada rentang tanggal terpilih</p>
        </div>
      </div>

      {/* Table Preview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700 text-sm">Pratinjau Data Laporan</h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full font-medium">
            {activeTab === 'peminjaman' ? dataPeminjaman.length : dataPengembalian.length} Data Ditemukan
          </span>
        </div>

        {activeTab === 'peminjaman' ? (
          <Table
            data={dataPeminjaman}
            columns={peminjamanColumns}
            isLoading={isLoading}
            emptyMessage="Tidak ada data peminjaman pada rentang tanggal ini"
          />
        ) : (
          <Table
            data={dataPengembalian}
            columns={pengembalianColumns}
            isLoading={isLoading}
            emptyMessage="Tidak ada data pengembalian pada rentang tanggal ini"
          />
        )}
      </div>

    </div>
  );
}
