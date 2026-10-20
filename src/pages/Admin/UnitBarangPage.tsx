// src/pages/Admin/UnitBarangPage.tsx
import { useState, useEffect, FormEvent } from 'react';
import { Plus, Edit2, Trash2, QrCode } from 'lucide-react';
import { http } from '../../services/api';
import Table, { type Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface UnitAlat {
  id: number;
  idAlat: number;
  namaAlat: string;
  idStatusKetersediaan: number;
  statusKetersediaan: string;
  kodeInventaris: string;
  idStatusBarang: number;
  statusBarang: string;
  createdAt: string;
}

interface AlatOption {
  id: number;
  nama: string;
}

export default function UnitBarangPage() {
  const [data, setData] = useState<UnitAlat[]>([]);
  const [alatList, setAlatList] = useState<AlatOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedAlatFilter, setSelectedAlatFilter] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal & Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UnitAlat | null>(null);

  const [formData, setFormData] = useState({
    idAlat: '',
    kodeInventaris: '',
    idStatusBarang: '1', // 1: baik
    idStatusKetersediaan: '1', // 1: tersedia
  });

  useEffect(() => {
    fetchAlatList();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, selectedAlatFilter, selectedStatusFilter]);

  const fetchAlatList = async () => {
    try {
      const response = await http.get('/alat', { params: { pageSize: 100 } });
      const items = response.data.items || [];
      setAlatList(items);
    } catch {
      // Non-blocking fallback
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get('/unit-alat', {
        params: {
          page,
          pageSize,
          idAlat: selectedAlatFilter || undefined,
          idStatusKetersediaan: selectedStatusFilter || undefined,
        },
      });

      setData(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mengambil data unit barang.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({
      idAlat: alatList[0]?.id.toString() || '',
      kodeInventaris: '',
      idStatusBarang: '1',
      idStatusKetersediaan: '1',
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: UnitAlat) => {
    if (item.statusKetersediaan === 'dipinjam') {
      setError(`Unit "${item.kodeInventaris}" sedang dipinjam dan tidak dapat diubah.`);
      return;
    }

    setSelectedItem(item);
    setFormData({
      idAlat: item.idAlat.toString(),
      kodeInventaris: item.kodeInventaris,
      idStatusBarang: item.idStatusBarang.toString(),
      idStatusKetersediaan: item.idStatusKetersediaan.toString(),
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (item: UnitAlat) => {
    setSelectedItem(item);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (selectedItem) {
        await http.put(`/unit-alat/${selectedItem.id}`, {
          kodeInventaris: formData.kodeInventaris,
          idStatusBarang: Number(formData.idStatusBarang),
          idStatusKetersediaan: Number(formData.idStatusKetersediaan),
        });
      } else {
        await http.post('/unit-alat', {
          idAlat: Number(formData.idAlat),
          kodeInventaris: formData.kodeInventaris,
          idStatusBarang: Number(formData.idStatusBarang),
        });
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal menyimpan unit barang.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await http.delete(`/unit-alat/${selectedItem.id}`);
      setIsConfirmOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unit tidak dapat dihapus.');
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getKetersediaanBadge = (status: string) => {
    switch (status) {
      case 'tersedia':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Tersedia</span>;
      case 'dipinjam':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Dipinjam</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">Tidak Tersedia</span>;
    }
  };

  const getKondisiBadge = (status: string) => {
    switch (status) {
      case 'baik':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">Baik</span>;
      case 'rusak_ringan':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700">Rusak Ringan</span>;
      case 'rusak_berat':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700">Rusak Berat</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  const columns: Column<UnitAlat>[] = [
    {
      header: 'KODE INVENTARIS',
      accessor: (row) => (
        <div className="flex items-center gap-2 font-mono font-semibold text-gray-800">
          <QrCode className="w-4 h-4 text-gray-400" />
          {row.kodeInventaris}
        </div>
      ),
    },
    {
      header: 'NAMA BARANG',
      accessor: 'namaAlat',
      className: 'font-medium text-gray-800',
    },
    {
      header: 'KONDISI FISIK',
      accessor: (row) => getKondisiBadge(row.statusBarang),
    },
    {
      header: 'STATUS KETERSEDIAAN',
      accessor: (row) => getKetersediaanBadge(row.statusKetersediaan),
    },
    {
      header: 'AKSI',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            disabled={row.statusKetersediaan === 'dipinjam'}
            className="p-1.5 text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors"
            title={row.statusKetersediaan === 'dipinjam' ? 'Unit sedang dipinjam' : 'Edit'}
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            disabled={row.statusKetersediaan === 'dipinjam'}
            className="p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors"
            title={row.statusKetersediaan === 'dipinjam' ? 'Unit sedang dipinjam' : 'Hapus'}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      className: 'w-28 text-right',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Unit Inventaris</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola fisik unit, kode inventaris unik, dan kondisi fisik barang</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#32a149] hover:bg-[#2a8a3d] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={18} />
          Tambah Unit
        </button>
      </div>

      {/* Error Alert */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="alatFilter" className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              Barang:
            </label>
            <select
              id="alatFilter"
              value={selectedAlatFilter}
              onChange={(e) => {
                setSelectedAlatFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
            >
              <option value="">Semua Barang</option>
              {alatList.map((alat) => (
                <option key={alat.id} value={alat.id}>
                  {alat.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="statusFilter" className="text-xs font-semibold text-gray-500 whitespace-nowrap">
              Status:
            </label>
            <select
              id="statusFilter"
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
            >
              <option value="">Semua Status</option>
              <option value="1">Tersedia</option>
              <option value="2">Dipinjam</option>
              <option value="3">Tidak Tersedia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Paginated Table */}
      <Table
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Belum ada unit inventaris tercatat"
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: (newPage) => setPage(newPage),
        }}
      />

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? 'Edit Unit Inventaris' : 'Tambah Unit Inventaris'}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!selectedItem && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Pilih Barang</label>
              <select
                required
                value={formData.idAlat}
                onChange={(e) => setFormData({ ...formData, idAlat: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
              >
                <option value="" disabled>
                  -- Pilih Barang --
                </option>
                {alatList.map((alat) => (
                  <option key={alat.id} value={alat.id}>
                    {alat.nama}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Kode Inventaris</label>
            <input
              type="text"
              required
              value={formData.kodeInventaris}
              onChange={(e) => setFormData({ ...formData, kodeInventaris: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
              placeholder="Contoh: TND-DM4-001"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Kondisi Barang</label>
            <select
              value={formData.idStatusBarang}
              onChange={(e) => setFormData({ ...formData, idStatusBarang: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
            >
              <option value="1">Baik</option>
              <option value="2">Rusak Ringan</option>
              <option value="3">Rusak Berat</option>
            </select>
          </div>

          {selectedItem && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Status Ketersediaan</label>
              <select
                value={formData.idStatusKetersediaan}
                onChange={(e) => setFormData({ ...formData, idStatusKetersediaan: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
              >
                <option value="1">Tersedia</option>
                <option value="2">Dipinjam</option>
                <option value="3">Tidak Tersedia</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#32a149] hover:bg-[#2a8a3d] rounded-lg disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={isSubmitting}
        title="Hapus Unit"
        message={`Apakah Anda yakin ingin menghapus unit dengan kode "${selectedItem?.kodeInventaris}"?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
