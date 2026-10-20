// src/pages/Admin/UserManagementPage.tsx
import { useState, useEffect, FormEvent } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck } from 'lucide-react';
import { http } from '../../services/api';
import Table, { type Column } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';

export interface UserResponse {
  id: number;
  nama: string;
  noTelepon: string;
  alamat: string;
  idRole: number;
  role: string;
  idJenisKelamin: number;
  jenisKelamin: string;
  createdAt: string;
}

interface UserManagementPageProps {
  roleId: number; // 2: Petugas, 3: Peminjam
  roleTitle: string; // "Peminjam" or "Petugas"
}

export default function UserManagementPage({ roleId, roleTitle }: UserManagementPageProps) {
  const [data, setData] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal & Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    noTelepon: '',
    password: '',
    idJenisKelamin: '1', // 1: Laki-laki, 2: Perempuan
    alamat: '',
  });

  useEffect(() => {
    fetchData();
  }, [page, roleId]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await http.get('/users', {
        params: {
          page,
          pageSize,
          idRole: roleId,
          search: search || undefined,
        },
      });

      setData(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || `Gagal mengambil data ${roleTitle.toLowerCase()}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setFormData({
      nama: '',
      noTelepon: '',
      password: '',
      idJenisKelamin: '1',
      alamat: '',
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: UserResponse) => {
    setSelectedUser(user);
    setFormData({
      nama: user.nama,
      noTelepon: user.noTelepon,
      password: '', // Blank by default on update
      idJenisKelamin: user.idJenisKelamin.toString(),
      alamat: user.alamat || '',
    });
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (user: UserResponse) => {
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload: Record<string, any> = {
      idRole: roleId,
      idJenisKelamin: Number(formData.idJenisKelamin),
      nama: formData.nama,
      noTelepon: formData.noTelepon,
      alamat: formData.alamat,
    };

    // Password is required on create; send null/omit on update if unchanged
    if (!selectedUser) {
      payload.password = formData.password;
    } else if (formData.password.trim() !== '') {
      payload.password = formData.password;
    }

    try {
      if (selectedUser) {
        await http.put(`/users/${selectedUser.id}`, payload);
      } else {
        await http.post('/users', payload);
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || `Gagal menyimpan data ${roleTitle.toLowerCase()}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await http.delete(`/users/${selectedUser.id}`);
      setIsConfirmOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Pengguna tidak dapat dihapus karena memiliki riwayat peminjaman atau log aktivitas.');
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<UserResponse>[] = [
    {
      header: 'NAMA AKUN',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#32a149]/10 text-[#32a149] font-bold flex items-center justify-center text-sm flex-shrink-0">
            {row.nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{row.nama}</div>
            <div className="text-xs text-gray-400">{row.jenisKelamin}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'NOMOR TELEPON',
      accessor: 'noTelepon',
      className: 'font-mono text-gray-700',
    },
    {
      header: 'ALAMAT',
      accessor: (row) => <span className="text-gray-600 truncate max-w-xs block">{row.alamat || '-'}</span>,
    },
    {
      header: 'ROLE',
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.idRole === 2 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          {row.role}
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
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Data {roleTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola hak akses dan informasi akun {roleTitle.toLowerCase()}</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-[#32a149] hover:bg-[#2a8a3d] text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={18} />
          Tambah {roleTitle}
        </button>
      </div>

      {/* Error Alert */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder={`Cari nama or nomor HP ${roleTitle.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149] transition-all"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </form>
      </div>

      {/* Paginated Table */}
      <Table
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={`Belum ada akun ${roleTitle.toLowerCase()} terdaftar`}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: (newPage) => setPage(newPage),
        }}
      />

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedUser ? `Edit Data ${roleTitle}` : `Tambah ${roleTitle} Baru`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
              placeholder="Contoh: Andi Pratama"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
            <input
              type="text"
              required
              value={formData.noTelepon}
              onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
              placeholder="081200000003"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Password {selectedUser && <span className="text-xs text-gray-400 font-normal">(Kosongkan jika tidak ingin merubah)</span>}
            </label>
            <input
              type="password"
              required={!selectedUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <select
              value={formData.idJenisKelamin}
              onChange={(e) => setFormData({ ...formData, idJenisKelamin: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
            >
              <option value="1">Laki-laki</option>
              <option value="2">Perempuan</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Alamat</label>
            <textarea
              rows={3}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#32a149]/20 focus:border-[#32a149]"
              placeholder="Jl. Merdeka No. 123, Bandung"
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
        title={`Hapus ${roleTitle}`}
        message={`Apakah Anda yakin ingin menghapus akun ${roleTitle.toLowerCase()} "${selectedUser?.nama}"?`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
