// src/pages/Admin/PeminjamanPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { XCircle, CheckCircle, PackageCheck, Eye } from 'lucide-react';
import { http } from '../../services/api';
import Table, { type Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface Peminjaman {
  id: number;
  peminjam: string;
  status: string;
  tanggalPeminjaman: string;
  tanggalPengembalian: string;
  totalBiaya: number;
}

interface DetailPeminjaman {
  idAlat: number;
  alat: string;
  jumlah: number;
  kodeInventaris: string[];
}

export default function PeminjamanPage() {
  const [data, setData] = useState<Peminjaman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('diajukan'); // Default ke pengajuan baru
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal States
  const [selectedItem, setSelectedItem] = useState<Peminjaman | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<DetailPeminjaman[]>([]);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);

  // Reject Modal & Form
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectCatatan, setRejectCatatan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get('/peminjaman', {
        params: {
          page,
          pageSize,
          status: statusFilter || undefined,
        },
      });
      setData(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mengambil data peminjaman.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS ---

  const handleViewDetail = async (item: Peminjaman) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
    try {
      const response = await http.get(`/peminjaman/${item.id}`);
      setDetailData(response.data.details || []);
    } catch (err: any) {
      alert('Gagal mengambil detail: ' + (err.response?.data?.detail || ''));
    }
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await http.patch(`/peminjaman/${selectedItem.id}/approve`);
      setIsApproveOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal menyetujui peminjaman.');
      setIsApproveOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await http.patch(`/peminjaman/${selectedItem.id}/reject`, { catatan: rejectCatatan });
      setIsRejectOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal menolak peminjaman.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHandover = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await http.patch(`/peminjaman/${selectedItem.id}/borrow`);
      setIsHandoverOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal memproses penyerahan barang (Mungkin stok unit tidak cukup saat ini).');
      setIsHandoverOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UTILS ---
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'diajukan': return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-semibold border border-amber-200">Diajukan</span>;
      case 'disetujui': return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold border border-blue-200">Disetujui</span>;
      case 'dipinjam': return <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-md text-xs font-semibold border border-purple-200">Dipinjam</span>;
      case 'selesai': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-semibold border border-emerald-200">Selesai</span>;
      case 'ditolak': return <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-md text-xs font-semibold border border-rose-200">Ditolak</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">{status}</span>;
    }
  };

  const columns: Column<Peminjaman>[] = [
    { header: 'PEMINJAM', accessor: (row) => <span className="font-semibold text-gray-800">{row.peminjam}</span> },
    { header: 'TANGGAL PINJAM', accessor: 'tanggalPeminjaman' },
    { header: 'TANGGAL KEMBALI', accessor: 'tanggalPengembalian' },
    { header: 'TOTAL BIAYA', accessor: (row) => <span className="font-semibold text-[#32a149]">{formatRupiah(row.totalBiaya)}</span> },
    { header: 'STATUS', accessor: (row) => getStatusBadge(row.status) },
    {
      header: 'AKSI',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          {/* Tombol Lihat Detail */}
          <button onClick={() => handleViewDetail(row)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Lihat Detail">
            <Eye size={16} />
          </button>

          {/* Tombol Aksi berdasarkan status */}
          {row.status === 'diajukan' && (
            <>
              <button onClick={() => { setSelectedItem(row); setIsApproveOpen(true); }} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Setujui">
                <CheckCircle size={16} />
              </button>
              <button onClick={() => { setSelectedItem(row); setRejectCatatan(''); setIsRejectOpen(true); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Tolak">
                <XCircle size={16} />
              </button>
            </>
          )}

          {row.status === 'disetujui' && (
            <button onClick={() => { setSelectedItem(row); setIsHandoverOpen(true); }} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Serahkan Barang">
              <PackageCheck size={14} /> Serahkan
            </button>
          )}
        </div>
      ),
      className: 'w-36 text-right'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Persetujuan Peminjaman</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola permohonan peminjaman dan serah terima unit barang</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <label htmlFor="statusFilter" className="text-xs font-semibold text-gray-500">Filter Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#32a149]/20"
        >
          <option value="">Semua Status</option>
          <option value="diajukan">Menunggu Persetujuan (Diajukan)</option>
          <option value="disetujui">Siap Diambil (Disetujui)</option>
          <option value="dipinjam">Sedang Dipinjam</option>
          <option value="selesai">Selesai</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      <Table
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Tidak ada data peminjaman dengan status ini"
        pagination={{ page, pageSize, total, onPageChange: (newPage) => setPage(newPage) }}
      />

      {/* MODAL: Lihat Detail */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Detail Peminjaman #${selectedItem?.id}`} maxWidth="max-w-2xl">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
            <div><p className="text-gray-500">Peminjam</p><p className="font-semibold">{selectedItem?.peminjam}</p></div>
            <div><p className="text-gray-500">Status</p><div>{selectedItem?.status ? getStatusBadge(selectedItem.status) : '-'}</div></div>
            <div><p className="text-gray-500">Tgl Pinjam</p><p className="font-semibold">{selectedItem?.tanggalPeminjaman}</p></div>
            <div><p className="text-gray-500">Tgl Kembali</p><p className="font-semibold">{selectedItem?.tanggalPengembalian}</p></div>
          </div>

          <h4 className="font-semibold text-gray-700 border-b pb-2 mt-2">Daftar Barang</h4>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr><th className="px-4 py-2">Barang</th><th className="px-4 py-2 text-center">Jumlah</th><th className="px-4 py-2">Kode Unit (Jika Diserahkan)</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detailData.map((d, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-medium">{d.alat}</td>
                    <td className="px-4 py-3 text-center">{d.jumlah}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {d.kodeInventaris?.length > 0 ? d.kodeInventaris.join(', ') : 'Belum di-assign'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* MODAL: Reject (Dengan Input Catatan) */}
      <Modal isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} title="Tolak Peminjaman" maxWidth="max-w-md">
        <form onSubmit={handleReject} className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">Anda akan menolak pengajuan peminjaman dari <b>{selectedItem?.peminjam}</b>.</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Catatan Penolakan (Opsional)</label>
            <textarea
              rows={3}
              value={rejectCatatan}
              onChange={(e) => setRejectCatatan(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              placeholder="Contoh: Stok sedang tidak memadai..."
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsRejectOpen(false)} className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50">
              {isSubmitting ? 'Memproses...' : 'Tolak Peminjaman'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Confirm Approve */}
      <ConfirmModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApprove}
        isLoading={isSubmitting}
        title="Setujui Peminjaman"
        message={`Apakah Anda yakin ingin menyetujui pengajuan peminjaman dari ${selectedItem?.peminjam}?`}
        confirmText="Ya, Setujui"
        cancelText="Batal"
        variant="primary"
      />

      {/* MODAL: Confirm Handover / Borrow */}
      <ConfirmModal
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        onConfirm={handleHandover}
        isLoading={isSubmitting}
        title="Serahkan Barang"
        message={`Anda akan menyerahkan barang kepada ${selectedItem?.peminjam}. Sistem akan mengalokasikan (assign) unit inventaris secara otomatis. Lanjutkan?`}
        confirmText="Ya, Serahkan Barang"
        cancelText="Batal"
        variant="primary"
      />
    </div>
  );
}
