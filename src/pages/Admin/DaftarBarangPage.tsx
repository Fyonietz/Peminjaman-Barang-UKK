// src/pages/Admin/DaftarBarangPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Plus, Edit2, Trash2, Search, Package, Upload } from 'lucide-react';
import { http } from '../../services/api';
import Table, { type Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface Alat {
  id: number;
  idKategori: number;
  kategori: string;
  nama: string;
  deskripsi: string;
  hargaSewa: number;
  imagePath: string | null;
  stokTersedia: number;
  createdAt: string;
}

interface Kategori {
  id: number;
  nama: string;
}

// Compute the base API host (without /api/v1) for static image resolution
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5162/api/v1';
const API_HOST = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export default function DaftarBarangPage() {
  const [data, setData] = useState<Alat[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal & Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Alat | null>(null);

  // Form Field States
  const [formData, setFormData] = useState({
    idKategori: '',
    nama: '',
    deskripsi: '',
    hargaSewa: '',
  });

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchKategoriList();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, selectedKategoriFilter]);

  const fetchKategoriList = async () => {
    try {
      const response = await http.get('/kategori');
      const items = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setKategoriList(items);
    } catch {
      // Non-blocking error
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get('/alat', {
        params: {
          page,
          pageSize,
          search: search || undefined,
          idKategori: selectedKategoriFilter || undefined,
        },
      });

      setData(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mengambil data peralatan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Ukuran file gambar maksimal 2 MB.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormData({
      idKategori: kategoriList[0]?.id.toString() || '',
      nama: '',
      deskripsi: '',
      hargaSewa: '',
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Alat) => {
    setSelectedItem(item);
    setFormData({
      idKategori: item.idKategori.toString(),
      nama: item.nama,
      deskripsi: item.deskripsi || '',
      hargaSewa: item.hargaSewa.toString(),
    });
    setSelectedFile(null);
    setPreviewUrl(item.imagePath ? getFullImageUrl(item.imagePath) : null);
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (item: Alat) => {
    setSelectedItem(item);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Build multipart/form-data payload according to Section 6.4.1
    const form = new FormData();
    form.append('idKategori', formData.idKategori);
    form.append('nama', formData.nama);
    if (formData.deskripsi) {
      form.append('deskripsi', formData.deskripsi);
    }
    form.append('hargaSewa', formData.hargaSewa);

    // Only append file if a new file was chosen
    if (selectedFile) {
      form.append('gambar', selectedFile);
    }

    try {
      if (selectedItem) {
        await http.put(`/alat/${selectedItem.id}`, form);
      } else {
        await http.post('/alat', form);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal menyimpan data barang.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setIsSubmitting(true);
    try {
      await http.delete(`/alat/${selectedItem.id}`);
      setIsConfirmOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Barang tidak dapat dihapus karena memiliki unit atau riwayat transaksi.');
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullImageUrl = (path: string | null) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API_HOST}${path}`;
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const columns: Column<Alat>[] = [
    {
      header: 'FOTO',
      accessor: (row) => {
        const imgUrl = getFullImageUrl(row.imagePath);
        return (
          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={row.nama}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Package className="w-6 h-6 text-gray-400" />
            )}
          </div>
        );
      },
      className: 'w-16',
    },
    {
      header: 'NAMA BARANG',
      accessor: (row) => (
        <div>
          <div className="font-semibold text-gray-800">{row.nama}</div>
          <div className="text-xs text-gray-400 truncate max-w-xs">{row.deskripsi || 'Tidak ada deskripsi'}</div>
        </div>
      ),
    },
    {
      header: 'KATEGORI',
      accessor: 'kategori',
      className: 'font-medium text-gray-600',
    },
    {
      header: 'HARGA SEWA / HARI',
      accessor: (row) => <span className="font-semibold text-[#32a149]">{formatRupiah(row.hargaSewa)}</span>,
    },
    {
      header: 'STOK TERSEDIA',
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.stokTersedia > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.stokTersedia} Unit
        </span>
      ),
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
      className: 'w-28 text-right',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daftar Peralatan Camping</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola barang, harga sewa, dan upload foto unit</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#32a149] hover:bg-[#2a8a3d] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={18} />
          Tambah Barang
        </button>
      </div>

      {/* Error Alert */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Action Bar (Search & Filter) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149] transition-all"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label htmlFor="kategoriFilter" className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Filter Kategori:
          </label>
          <select
            id="kategoriFilter"
            value={selectedKategoriFilter}
            onChange={(e) => {
              setSelectedKategoriFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map((kat) => (
              <option key={kat.id} value={kat.id}>
                {kat.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Paginated Table */}
      <Table
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Belum ada data barang peralatan"
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: (newPage) => setPage(newPage),
        }}
      />

      {/* Add / Edit Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? 'Edit Barang' : 'Tambah Barang Baru'} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Kategori</label>
            <select
              required
              value={formData.idKategori}
              onChange={(e) => setFormData({ ...formData, idKategori: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
            >
              <option value="" disabled>
                -- Pilih Kategori --
              </option>
              {kategoriList.map((kat) => (
                <option key={kat.id} value={kat.id}>
                  {kat.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nama Barang</label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
              placeholder="Contoh: Tenda Dome 4P"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Harga Sewa per Hari (Rp)</label>
            <input
              type="number"
              required
              min="0"
              step="500"
              value={formData.hargaSewa}
              onChange={(e) => setFormData({ ...formData, hargaSewa: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
              placeholder="50000"
            />
          </div>

          {/* File Input for Image Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Foto Barang (Maks 2 MB)</label>
            <div className="flex items-center gap-4">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                  <Upload size={20} />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#32a149]/10 file:text-[#32a149] hover:file:bg-[#32a149]/20 cursor-pointer"
                />
                <p className="text-[11px] text-gray-400 mt-1">Format: JPG, JPEG, PNG, WEBP (Max 2MB)</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              rows={3}
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
              placeholder="Kapasitas 4 orang, double layer..."
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
        title="Hapus Barang"
        message={`Apakah Anda yakin ingin menghapus barang "${selectedItem?.nama}"?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
