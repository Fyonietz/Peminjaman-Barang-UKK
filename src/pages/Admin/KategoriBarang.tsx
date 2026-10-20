// src/pages/Admin/KategoriPage.tsx
import { useState, useEffect, FormEvent } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { http } from '../../services/api';
import Table, { type Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface Kategori {
  id: number;
  nama: string;
}

export default function KategoriPage() {
  const [rawData, setRawData] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination States
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form & Selection States
  const [selectedItem, setSelectedItem] = useState<Kategori | null>(null);
  const [formData, setFormData] = useState({ nama: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get('/kategori');
      // Handles both array response and object wrapped items response
      const items = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setRawData(items);
      setTotal(response.data.total || items.length);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mengambil data kategori.');
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side paginated slice (handles cases where backend returns unpaged flat array)
  const paginatedData = rawData.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({ nama: '' });
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (kategori: Kategori) => {
    setSelectedItem(kategori);
    setFormData({ nama: kategori.nama });
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (kategori: Kategori) => {
    setSelectedItem(kategori);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (selectedItem) {
        await http.put(`/kategori/${selectedItem.id}`, formData);
      } else {
        await http.post('/kategori', formData);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal menyimpan kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await http.delete(`/kategori/${selectedItem.id}`);
      setIsConfirmOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Kategori tidak dapat dihapus karena masih digunakan.');
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Kategori>[] = [
    {
      header: 'NAMA KATEGORI',
      accessor: 'nama',
      className: 'font-semibold text-gray-800'
    },
    {
      header: 'AKSI',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenDelete(row)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Hapus"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      className: 'w-28 text-right'
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kategori</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola daftar kategori peralatan camping</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#32a149] hover:bg-[#2a8a3d] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Paginated Table */}
      <Table
        data={paginatedData}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Belum ada data kategori"
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: (newPage) => setPage(newPage)
        }}
      />

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedItem ? 'Edit Kategori' : 'Tambah Kategori Baru'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nama Kategori</label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ nama: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149] transition-all text-sm"
              placeholder="Contoh: Tenda"
            />
          </div>

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
        title="Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori "${selectedItem?.nama}"?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
