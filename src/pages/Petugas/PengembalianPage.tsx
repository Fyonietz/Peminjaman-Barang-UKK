// src/pages/Admin/PengembalianPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { RotateCcw, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { http } from '../../services/api';
import Table, { type Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';

// --- Interfaces ---
interface MonitorItem {
  id: number;
  peminjam: string;
  noTelepon: string;
  tanggalPeminjaman: string;
  tanggalPengembalian: string;
  hariTerlambat: number;
  totalBiaya: number;
}

interface RiwayatItem {
  id: number;
  idPeminjaman: number;
  peminjam: string;
  tanggalKembali: string;
  keterlambatanPengembalian: number;
  denda: number;
  dendaKondisi: number;
}

interface UnitGrade {
  idUnitAlat: number;
  kodeInventaris: string;
  alat: string;
  statusKondisi: string;
  catatan: string;
}

export default function PengembalianPage() {
  const [activeTab, setActiveTab] = useState<'monitor' | 'riwayat'>('monitor');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data States
  const [monitorData, setMonitorData] = useState<MonitorItem[]>([]);
  const [riwayatData, setRiwayatData] = useState<RiwayatItem[]>([]);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState(''); // Untuk tab monitor

  // Modal Return Form State
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPeminjaman, setSelectedPeminjaman] = useState<MonitorItem | null>(null);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [globalCatatan, setGlobalCatatan] = useState('');
  const [unitGrades, setUnitGrades] = useState<UnitGrade[]>([]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'monitor') {
      fetchMonitor();
    } else {
      fetchRiwayat();
    }
  }, [page, statusFilter, activeTab]);

  // --- API Calls ---

  const fetchMonitor = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get('/peminjaman/monitor', {
        params: { page, pageSize, status: statusFilter || undefined }
      });
      setMonitorData(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mengambil data pantauan pengembalian.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRiwayat = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get('/pengembalian', {
        params: { page, pageSize }
      });
      setRiwayatData(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mengambil riwayat pengembalian.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReturn = async (item: MonitorItem) => {
    setSelectedPeminjaman(item);
    setReturnDate(new Date().toISOString().split('T')[0]);
    setGlobalCatatan('');
    setUnitGrades([]);
    setIsLoading(true);

    try {
      // Ambil detail peminjaman untuk mengekstrak idUnitAlat yang diserahkan
      const response = await http.get(`/peminjaman/${item.id}`);
      const details = response.data.details || [];

      const flattenedUnits: UnitGrade[] = [];
      details.forEach((d: any) => {
        if (d.idUnitAlat && d.kodeInventaris) {
          d.idUnitAlat.forEach((unitId: number, index: number) => {
            flattenedUnits.push({
              idUnitAlat: unitId,
              kodeInventaris: d.kodeInventaris[index],
              alat: d.alat,
              statusKondisi: 'baik',
              catatan: ''
            });
          });
        }
      });

      setUnitGrades(flattenedUnits);
      setIsReturnOpen(true);
    } catch (err: any) {
      alert('Gagal memuat detail unit: ' + (err.response?.data?.detail || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReturn = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPeminjaman) return;
    setIsSubmitting(true);
    setError(null);

    const payload = {
      idPeminjaman: selectedPeminjaman.id,
      tanggalKembali: returnDate,
      catatan: globalCatatan,
      units: unitGrades.map(u => ({
        idUnitAlat: u.idUnitAlat,
        statusKondisi: u.statusKondisi,
        ...(u.catatan ? { catatan: u.catatan } : {}) // Hanya kirim jika ada catatan
      }))
    };

    try {
      await http.post('/pengembalian', payload);
      setIsReturnOpen(false);
      fetchMonitor();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal memproses pengembalian.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Utils & Kalkulator Denda Client-side ---
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const updateUnitGrade = (index: number, field: keyof UnitGrade, value: string) => {
    const updated = [...unitGrades];
    updated[index] = { ...updated[index], [field]: value };
    setUnitGrades(updated);
  };

  const calculatePreviewFine = () => {
    let denda = 0;

    // Prediksi Denda Keterlambatan berdasarkan form tanggal
    if (selectedPeminjaman) {
      const targetKembali = new Date(selectedPeminjaman.tanggalPengembalian).getTime();
      const aktualKembali = new Date(returnDate).getTime();
      const selisihHari = Math.ceil((aktualKembali - targetKembali) / (1000 * 3600 * 24));
      if (selisihHari > 0) denda += selisihHari * 10000;
    }

    // Prediksi Denda Kerusakan/Kehilangan
    unitGrades.forEach(u => {
      if (u.statusKondisi === 'rusak_ringan') denda += 25000;
      if (u.statusKondisi === 'rusak_berat') denda += 100000;
      if (u.statusKondisi === 'hilang') denda += 250000;
    });

    return denda;
  };

  // --- Columns Config ---
  const monitorColumns: Column<MonitorItem>[] = [
    { header: 'ID', accessor: 'id', className: 'w-16 font-mono text-gray-500' },
    { header: 'PEMINJAM', accessor: (row) => <div className="font-semibold text-gray-800">{row.peminjam}<div className="text-xs text-gray-400 font-mono">{row.noTelepon}</div></div> },
    { header: 'TGL KEMBALI', accessor: 'tanggalPengembalian' },
    { header: 'STATUS KETERLAMBATAN', accessor: (row) => (
        row.hariTerlambat > 0
          ? <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-semibold border border-rose-200 flex items-center gap-1 w-max"><AlertTriangle size={12}/> Telat {row.hariTerlambat} Hari</span>
          : <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">Jatuh Tempo / Aktif</span>
      )
    },
    { header: 'BIAYA SEWA', accessor: (row) => <span className="font-semibold text-[#32a149]">{formatRupiah(row.totalBiaya)}</span> },
    { header: 'AKSI', className: 'text-right w-36', accessor: (row) => (
        <button onClick={() => handleOpenReturn(row)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#32a149] hover:bg-[#2a8a3d] rounded-lg transition-colors ml-auto">
          <RotateCcw size={14} /> Proses
        </button>
      )
    }
  ];

  const riwayatColumns: Column<RiwayatItem>[] = [
    { header: 'ID KEMBALI', accessor: 'id', className: 'w-24 font-mono text-gray-500' },
    { header: 'ID PINJAM', accessor: 'idPeminjaman', className: 'w-24 font-mono text-gray-500' },
    { header: 'PEMINJAM', accessor: (row) => <span className="font-semibold text-gray-800">{row.peminjam}</span> },
    { header: 'TGL KEMBALI (AKTUAL)', accessor: 'tanggalKembali' },
    { header: 'TELAT', accessor: (row) => `${row.keterlambatanPengembalian} Hari` },
    { header: 'TOTAL DENDA', accessor: (row) => (
        <span className={`font-semibold ${row.denda > 0 ? 'text-rose-600' : 'text-gray-500'}`}>
          {formatRupiah(row.denda)}
        </span>
      )
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengembalian & Monitor</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau peminjaman aktif, proses pengembalian unit, dan rekap denda.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-6 py-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'monitor' ? 'border-[#32a149] text-[#32a149]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock size={16} /> Monitor Aktif & Telat
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-6 py-3 text-sm font-semibold transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'riwayat' ? 'border-[#32a149] text-[#32a149]' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle size={16} /> Riwayat Pengembalian
        </button>
      </div>

      {/* Konten Tab Monitor */}
      {activeTab === 'monitor' && (
        <>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <label className="text-xs font-semibold text-gray-500">Kategori Monitor:</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#32a149]/20"
            >
              <option value="">Semua Peminjaman Aktif</option>
              <option value="jatuh_tempo">Jatuh Tempo Hari Ini</option>
              <option value="terlambat">Terlambat</option>
            </select>
          </div>
          <Table
            data={monitorData}
            columns={monitorColumns}
            isLoading={isLoading}
            emptyMessage="Tidak ada peminjaman aktif dalam kategori ini"
            pagination={{ page, pageSize, total, onPageChange: (newPage) => setPage(newPage) }}
          />
        </>
      )}

      {/* Konten Tab Riwayat */}
      {activeTab === 'riwayat' && (
        <Table
          data={riwayatData}
          columns={riwayatColumns}
          isLoading={isLoading}
          emptyMessage="Belum ada riwayat pengembalian"
          pagination={{ page, pageSize, total, onPageChange: (newPage) => setPage(newPage) }}
        />
      )}

      {/* MODAL: Form Proses Pengembalian */}
      <Modal isOpen={isReturnOpen} onClose={() => setIsReturnOpen(false)} title="Proses Pengembalian" maxWidth="max-w-3xl">
        <form onSubmit={handleSubmitReturn} className="flex flex-col gap-6">

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm border border-gray-200">
            <div><p className="text-gray-500 text-xs">Peminjam</p><p className="font-semibold text-gray-800">{selectedPeminjaman?.peminjam}</p></div>
            <div><p className="text-gray-500 text-xs">Target Kembali</p><p className="font-semibold text-gray-800">{selectedPeminjaman?.tanggalPengembalian}</p></div>
            <div className="col-span-2">
              <label className="text-gray-500 text-xs block mb-1">Tanggal Aktual Kembali (Ubah jika dikembalikan kemarin/lusa)</label>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full sm:w-1/2 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#32a149]"
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">Pengecekan Fisik Unit</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-600 text-xs">
                  <tr>
                    <th className="px-4 py-2">Barang</th>
                    <th className="px-4 py-2">Kode Unit</th>
                    <th className="px-4 py-2">Kondisi (Saat Kembali)</th>
                    <th className="px-4 py-2">Catatan Kondisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {unitGrades.map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{u.alat}</td>
                      <td className="px-4 py-2 font-mono text-gray-500 text-xs">{u.kodeInventaris}</td>
                      <td className="px-4 py-2">
                        <select
                          value={u.statusKondisi}
                          onChange={(e) => updateUnitGrade(i, 'statusKondisi', e.target.value)}
                          className={`w-full px-2 py-1.5 border rounded-md text-xs font-semibold focus:outline-none ${
                            u.statusKondisi === 'baik' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            u.statusKondisi === 'rusak_ringan' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <option value="baik">Baik (Aman)</option>
                          <option value="rusak_ringan">Rusak Ringan (Denda 25k)</option>
                          <option value="rusak_berat">Rusak Berat (Denda 100k)</option>
                          <option value="hilang">Hilang (Denda 250k)</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={u.catatan}
                          onChange={(e) => updateUnitGrade(i, 'catatan', e.target.value)}
                          placeholder="Cth: sobek, patah..."
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:border-[#32a149]"
                          disabled={u.statusKondisi === 'baik'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Catatan Global Pengembalian (Opsional)</label>
            <textarea
              rows={2}
              value={globalCatatan}
              onChange={(e) => setGlobalCatatan(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
              placeholder="Catatan tambahan untuk transaksi ini..."
            />
          </div>

          <div className="bg-gray-800 text-white p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Estimasi Total Denda</p>
              <p className="text-2xl font-bold mt-1 text-rose-400">
                {formatRupiah(calculatePreviewFine())}
              </p>
            </div>
            <div className="text-right text-xs text-gray-400">
              Keterlambatan: 10.000 / Hari<br/>
              Sistem akan menghitung ulang jumlah pasti
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsReturnOpen(false)} className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-[#32a149] hover:bg-[#2a8a3d] rounded-lg disabled:opacity-50">
              {isSubmitting ? 'Memproses...' : 'Selesaikan Pengembalian'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
