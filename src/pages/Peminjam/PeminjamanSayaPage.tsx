// src/pages/Peminjam/PeminjamanSayaPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  RotateCcw,
  Package,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import { http } from '../../services/api';
import { formatRupiah, todayISO, daysBetween } from '../../lib/format';
import Table, { type Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';

interface DetailPeminjaman {
  id: number;
  idAlat: number;
  alat: string;
  jumlah: number;
  hargaSewaSaatTransaksi: number;
  idUnitAlat: number[];
  kodeInventaris: string[];
}

interface Peminjaman {
  id: number;
  peminjam: string;
  status: string;
  tanggalPeminjaman: string;
  tanggalPengembalian: string;
  totalBiaya: number;
  createdAt: string;
  details: DetailPeminjaman[];
}

type StatusKondisi = 'baik' | 'rusak_ringan' | 'rusak_berat' | 'hilang';

interface ReturnUnit {
  idUnitAlat: number;
  kodeInventaris: string;
  alat: string;
  statusKondisi: StatusKondisi;
  catatan: string;
}

// Fine table from the API guide (section 6.7)
const DENDA_KONDISI: Record<StatusKondisi, number> = {
  baik: 0,
  rusak_ringan: 25000,
  rusak_berat: 100000,
  hilang: 250000,
};

const DENDA_TELAT_PER_HARI = 10000;

const KONDISI_LABEL: Record<StatusKondisi, string> = {
  baik: 'Baik',
  rusak_ringan: 'Rusak Ringan',
  rusak_berat: 'Rusak Berat',
  hilang: 'Hilang',
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'diajukan':
      return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md text-xs font-semibold border border-amber-200">Diajukan</span>;
    case 'disetujui':
      return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold border border-blue-200">Disetujui</span>;
    case 'dipinjam':
      return <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-md text-xs font-semibold border border-purple-200">Dipinjam</span>;
    case 'selesai':
      return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-semibold border border-emerald-200">Selesai</span>;
    case 'ditolak':
      return <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-md text-xs font-semibold border border-rose-200">Ditolak</span>;
    default:
      return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">{status}</span>;
  }
};

export default function PeminjamanSayaPage() {
  const [data, setData] = useState<Peminjaman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & pagination
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Detail modal
  const [detailItem, setDetailItem] = useState<Peminjaman | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Return modal
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnItem, setReturnItem] = useState<Peminjaman | null>(null);
  const [returnUnits, setReturnUnits] = useState<ReturnUnit[]>([]);
  const [tanggalKembali, setTanggalKembali] = useState(todayISO());
  const [catatan, setCatatan] = useState('');
  const [returnError, setReturnError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get('/peminjaman/mine', {
        params: { page, pageSize, status: statusFilter || undefined },
      });
      setData(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mengambil data peminjaman Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (item: Peminjaman) => {
    setDetailItem(item);
    setDetailLoading(true);
    try {
      const response = await http.get(`/peminjaman/${item.id}`);
      setDetailItem(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mengambil detail peminjaman.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenReturn = async (item: Peminjaman) => {
    setDetailItem(null);
    setReturnItem(item);
    setIsReturnOpen(true);
    setReturnError(null);
    setSuccess(null);
    setTanggalKembali(todayISO());
    setCatatan('');
    setReturnUnits([]);
    setIsSubmitting(true);

    try {
      const response = await http.get(`/peminjaman/${item.id}`);
      const loan: Peminjaman = response.data;
      setReturnItem(loan);

      // Only units actually handed over have ids; indexes match kodeInventaris
      const units: ReturnUnit[] = (loan.details || []).flatMap((detail) =>
        (detail.idUnitAlat || []).map((idUnitAlat, index) => ({
          idUnitAlat,
          kodeInventaris: detail.kodeInventaris?.[index] || '-',
          alat: detail.alat,
          statusKondisi: 'baik' as StatusKondisi,
          catatan: '',
        }))
      );
      setReturnUnits(units);
    } catch (err: any) {
      setReturnError(err.response?.data?.detail || 'Gagal mengambil detail unit peminjaman.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUnit = (idUnitAlat: number, patch: Partial<ReturnUnit>) => {
    setReturnUnits((prev) =>
      prev.map((unit) => (unit.idUnitAlat === idUnitAlat ? { ...unit, ...patch } : unit))
    );
  };

  // --- FINE PREVIEW ---
  const hariTerlambat = returnItem
    ? Math.max(0, daysBetween(returnItem.tanggalPengembalian, tanggalKembali))
    : 0;
  const dendaTelat = hariTerlambat * DENDA_TELAT_PER_HARI;
  const dendaKondisi = returnUnits.reduce((sum, unit) => sum + DENDA_KONDISI[unit.statusKondisi], 0);

  const handleSubmitReturn = async (e: FormEvent) => {
    e.preventDefault();
    setReturnError(null);

    if (!returnItem) return;
    if (returnUnits.length === 0) {
      setReturnError('Tidak ada unit yang bisa dikembalikan pada peminjaman ini.');
      return;
    }

    setIsSubmitting(true);
    try {
      await http.post('/pengembalian', {
        idPeminjaman: returnItem.id,
        tanggalKembali,
        catatan: catatan || undefined,
        units: returnUnits.map((unit) => ({
          idUnitAlat: unit.idUnitAlat,
          statusKondisi: unit.statusKondisi,
          catatan: unit.catatan || undefined,
        })),
      });

      setIsReturnOpen(false);
      setSuccess(`Pengembalian peminjaman #${returnItem.id} berhasil diproses.`);
      setPage(1);
      fetchData();
    } catch (err: any) {
      setReturnError(err.response?.data?.detail || 'Gagal memproses pengembalian barang.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Peminjaman>[] = [
    {
      header: 'ID',
      accessor: (row) => <span className="font-mono text-xs text-gray-500">#{row.id}</span>,
      className: 'w-16',
    },
    {
      header: 'TANGGAL PINJAM',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-gray-700">
          <CalendarDays size={14} className="text-gray-400" />
          {row.tanggalPeminjaman}
        </div>
      ),
    },
    { header: 'TANGGAL KEMBALI', accessor: 'tanggalPengembalian' },
    {
      header: 'TOTAL BIAYA',
      accessor: (row) => <span className="font-semibold text-[#2BA84A]">{formatRupiah(row.totalBiaya)}</span>,
    },
    { header: 'STATUS', accessor: (row) => getStatusBadge(row.status) },
    {
      header: 'AKSI',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleViewDetail(row)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Lihat Detail"
          >
            <Eye size={16} />
          </button>
          {row.status === 'dipinjam' && (
            <button
              type="button"
              onClick={() => handleOpenReturn(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              title="Kembalikan Barang"
            >
              <RotateCcw size={13} /> Kembalikan
            </button>
          )}
        </div>
      ),
      className: 'w-36 text-right',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Peminjaman Saya</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau status pengajuan dan proses pengembalian perlengkapan yang Anda sewa.
          </p>
        </div>
        <Link
          to="/dashboard/katalog"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2BA84A] hover:bg-[#248c3e] text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <ShoppingBag size={18} /> Sewa Alat Lagi
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {success && (
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm">
          <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
          {success}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <label htmlFor="statusFilter" className="text-xs font-semibold text-gray-500">Filter Status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2BA84A]/20"
        >
          <option value="">Semua Status</option>
          <option value="diajukan">Menunggu Persetujuan</option>
          <option value="disetujui">Disetujui</option>
          <option value="dipinjam">Sedang Dipinjam</option>
          <option value="selesai">Selesai</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>

      <Table
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Belum ada peminjaman. Mulai dari katalog peralatan."
        pagination={{ page, pageSize, total, onPageChange: (newPage) => setPage(newPage) }}
      />

      {/* DETAIL MODAL */}
      <Modal
        isOpen={Boolean(detailItem) && !isReturnOpen}
        onClose={() => setDetailItem(null)}
        title={`Detail Peminjaman #${detailItem?.id ?? ''}`}
        maxWidth="max-w-2xl"
      >
        {detailLoading ? (
          <p className="text-sm text-gray-400 py-6 text-center">Memuat detail...</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
              <div>
                <p className="text-gray-500">Status</p>
                <div className="mt-1">{detailItem?.status ? getStatusBadge(detailItem.status) : '-'}</div>
              </div>
              <div>
                <p className="text-gray-500">Total Biaya</p>
                <p className="font-semibold text-[#2BA84A]">
                  {detailItem ? formatRupiah(detailItem.totalBiaya) : '-'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Tanggal Pinjam</p>
                <p className="font-semibold">{detailItem?.tanggalPeminjaman || '-'}</p>
              </div>
              <div>
                <p className="text-gray-500">Tanggal Kembali</p>
                <p className="font-semibold">{detailItem?.tanggalPengembalian || '-'}</p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-700 border-b pb-2">Daftar Barang</h4>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2">Barang</th>
                    <th className="px-4 py-2 text-center">Jumlah</th>
                    <th className="px-4 py-2">Kode Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(detailItem?.details || []).map((detail) => (
                    <tr key={detail.id}>
                      <td className="px-4 py-3 font-medium">{detail.alat}</td>
                      <td className="px-4 py-3 text-center">{detail.jumlah}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {detail.kodeInventaris?.length > 0
                          ? detail.kodeInventaris.join(', ')
                          : 'Belum diserahkan'}
                      </td>
                    </tr>
                  ))}
                  {(detailItem?.details || []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                        Tidak ada barang pada peminjaman ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {detailItem?.status === 'dipinjam' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (detailItem) handleOpenReturn(detailItem);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <RotateCcw size={15} /> Proses Pengembalian
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* RETURN MODAL */}
      <Modal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        title={`Pengembalian Peminjaman #${returnItem?.id ?? ''}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitReturn} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Tanggal Kembali</label>
              <input
                type="date"
                required
                value={tanggalKembali}
                onChange={(e) => setTanggalKembali(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2BA84A]/20 focus:border-[#2BA84A]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Jatuh Tempo</label>
              <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700">
                {returnItem?.tanggalPengembalian || '-'}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Catatan (Opsional)</label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: tenda dikembalikan dalam keadaan kering"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2BA84A]/20 focus:border-[#2BA84A]"
            />
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 border-b pb-2">Kondisi Tiap Unit</h4>
            <div className="mt-3 flex flex-col gap-3">
              {returnUnits.map((unit) => (
                <div key={unit.idUnitAlat} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{unit.alat}</p>
                      <p className="text-xs font-mono text-gray-400">{unit.kodeInventaris}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      Denda kondisi: <span className="font-semibold text-gray-600">{formatRupiah(DENDA_KONDISI[unit.statusKondisi])}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={unit.statusKondisi}
                      onChange={(e) => updateUnit(unit.idUnitAlat, { statusKondisi: e.target.value as StatusKondisi })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2BA84A]/20 focus:border-[#2BA84A]"
                    >
                      {(Object.keys(KONDISI_LABEL) as StatusKondisi[]).map((kondisi) => (
                        <option key={kondisi} value={kondisi}>
                          {KONDISI_LABEL[kondisi]}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={unit.catatan}
                      onChange={(e) => updateUnit(unit.idUnitAlat, { catatan: e.target.value })}
                      placeholder={unit.statusKondisi === 'baik' ? 'Catatan unit (opsional)' : 'Jelaskan kerusakannya'}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2BA84A]/20 focus:border-[#2BA84A]"
                    />
                  </div>
                </div>
              ))}

              {returnUnits.length === 0 && !isSubmitting && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2.5 rounded-lg text-xs">
                  <Package size={15} className="mt-0.5 flex-shrink-0" />
                  Unit belum diserahkan oleh petugas, jadi pengembalian belum bisa diproses.
                </div>
              )}
              {isSubmitting && returnUnits.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Memuat unit...</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>Keterlambatan</span>
              <span className="font-semibold text-gray-800">{hariTerlambat} hari</span>
            </div>
            <div className="flex items-center justify-between text-gray-600 mt-1.5">
              <span>Denda keterlambatan</span>
              <span className="font-semibold text-gray-800">{formatRupiah(dendaTelat)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600 mt-1.5">
              <span>Denda kondisi barang</span>
              <span className="font-semibold text-gray-800">{formatRupiah(dendaKondisi)}</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <span className="font-semibold text-gray-700">Estimasi total denda</span>
              <span className="font-extrabold text-rose-600 text-base">{formatRupiah(dendaTelat + dendaKondisi)}</span>
            </div>
            {hariTerlambat > 0 && (
              <p className="flex items-center gap-1.5 text-[11px] text-rose-500 mt-2">
                <AlertTriangle size={12} /> Pengembalian melewati jatuh tempo, denda telat Rp10.000/hari.
              </p>
            )}
          </div>

          {returnError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
              {returnError}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsReturnOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || returnUnits.length === 0}
              className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Memproses...' : 'Konfirmasi Pengembalian'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
