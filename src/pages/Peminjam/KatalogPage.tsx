// src/pages/Peminjam/KatalogPage.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Package,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
  ImageOff,
} from 'lucide-react';
import { http } from '../../services/api';
import { formatRupiah, getImageUrl, todayISO, daysBetween } from '../../lib/format';
import Modal from '../../components/ui/Modal';

interface Alat {
  id: number;
  idKategori: number;
  kategori: string;
  nama: string;
  deskripsi: string | null;
  hargaSewa: number;
  imagePath: string | null;
  stokTersedia: number;
}

interface Kategori {
  id: number;
  nama: string;
}

interface CartItem {
  alat: Alat;
  jumlah: number;
}

export default function KatalogPage() {
  const [data, setData] = useState<Alat[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  const [total, setTotal] = useState(0);

  // Cart & Form
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tanggalPeminjaman, setTanggalPeminjaman] = useState(todayISO());
  const [tanggalPengembalian, setTanggalPengembalian] = useState(todayISO(3));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchKategoriList();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, searchTerm, selectedKategori]);

  const fetchKategoriList = async () => {
    try {
      const response = await http.get('/kategori');
      setKategoriList(Array.isArray(response.data) ? response.data : response.data.items || []);
    } catch {
      // Kategori is only a filter, keep the catalog usable without it
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
          search: searchTerm || undefined,
          idKategori: selectedKategori || undefined,
        },
      });
      const items: Alat[] = response.data.items || [];
      setData(items);
      setTotal(response.data.total || 0);

      // Refresh stock for cart items visible on this page; keep items from other pages
      setCart((prev) =>
        prev
          .map((item) => {
            const fresh = items.find((alat) => alat.id === item.alat.id);
            return fresh ? { ...item, alat: fresh } : item;
          })
          .filter((item) => item.alat.stokTersedia > 0)
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Gagal mengambil katalog peralatan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(search);
  };

  // --- CART ---
  const cartQuantity = (id: number) => cart.find((item) => item.alat.id === id)?.jumlah ?? 0;

  const addToCart = (alat: Alat) => {
    setFormError(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.alat.id === alat.id);
      if (existing) {
        if (existing.jumlah >= alat.stokTersedia) return prev;
        return prev.map((item) =>
          item.alat.id === alat.id ? { ...item, jumlah: Math.min(item.jumlah + 1, 1000) } : item
        );
      }
      return [...prev, { alat, jumlah: 1 }];
    });
  };

  const changeQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.alat.id !== id) return item;
          const max = Math.min(item.alat.stokTersedia, 1000);
          return { ...item, jumlah: Math.max(0, Math.min(item.jumlah + delta, max)) };
        })
        .filter((item) => item.jumlah > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.alat.id !== id));
  };

  // --- CHECKOUT ---
  const durasiHari = Math.max(1, daysBetween(tanggalPeminjaman, tanggalPengembalian));
  const totalBiaya = cart.reduce(
    (sum, item) => sum + item.alat.hargaSewa * item.jumlah * durasiHari,
    0
  );
  const totalUnit = cart.reduce((sum, item) => sum + item.jumlah, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cart.length === 0) {
      setFormError('Keranjang masih kosong. Pilih alat terlebih dahulu.');
      return;
    }
    if (!tanggalPeminjaman || !tanggalPengembalian) {
      setFormError('Tanggal peminjaman dan pengembalian wajib diisi.');
      return;
    }
    if (daysBetween(tanggalPeminjaman, tanggalPengembalian) < 0) {
      setFormError('Tanggal pengembalian tidak boleh lebih awal dari tanggal peminjaman.');
      return;
    }

    setIsSubmitting(true);
    try {
      await http.post('/peminjaman', {
        tanggalPeminjaman,
        tanggalPengembalian,
        items: cart.map((item) => ({ idAlat: item.alat.id, jumlah: item.jumlah })),
      });

      setCart([]);
      setIsCartOpen(false);
      setSuccess(
        'Pengajuan peminjaman berhasil dikirim. Tunggu persetujuan petugas sebelum mengambil barang.'
      );
      fetchData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Gagal mengirim pengajuan peminjaman.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Katalog Peralatan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pilih perlengkapan yang ingin disewa, lalu ajukan peminjaman.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2BA84A] hover:bg-[#248c3e] text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <ShoppingBag size={18} />
          Keranjang
          {totalUnit > 0 && (
            <span className="ml-1 min-w-6 h-6 px-1.5 rounded-full bg-white text-[#2BA84A] text-xs font-bold flex items-center justify-center">
              {totalUnit}
            </span>
          )}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {success && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm">
          <span className="flex items-start gap-2">
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            {success}
          </span>
          <Link to="/dashboard/peminjaman-saya" className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900">
            Lihat peminjaman saya <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Cari nama barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2BA84A]/20 focus:border-[#2BA84A] transition-all"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label htmlFor="kategoriFilter" className="text-xs font-semibold text-gray-500 whitespace-nowrap">
            Kategori:
          </label>
          <select
            id="kategoriFilter"
            value={selectedKategori}
            onChange={(e) => {
              setSelectedKategori(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2BA84A]/20 focus:border-[#2BA84A]"
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map((kategori) => (
              <option key={kategori.id} value={kategori.id}>
                {kategori.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-sm text-gray-400">
          Memuat katalog...
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-sm text-gray-400">
          Tidak ada peralatan yang cocok dengan pencarian.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {data.map((alat) => {
            const imgUrl = getImageUrl(alat.imagePath);
            const inCart = cartQuantity(alat.id);
            const habis = alat.stokTersedia === 0;
            const maxed = inCart >= Math.min(alat.stokTersedia, 1000);

            return (
              <div
                key={alat.id}
                className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={alat.nama}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageOff size={28} />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/90 text-[11px] font-semibold text-gray-600 border border-gray-200">
                    {alat.kategori}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-4 gap-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-800 leading-snug">{alat.nama}</h3>
                      <span
                        className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          habis
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {habis ? 'Habis' : `Stok ${alat.stokTersedia}`}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {alat.deskripsi || 'Perlengkapan camping siap pakai.'}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-[11px] text-gray-400">Sewa / hari</p>
                      <p className="font-bold text-[#2BA84A]">{formatRupiah(alat.hargaSewa)}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addToCart(alat)}
                      disabled={habis || maxed}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#2BA84A] hover:bg-[#248c3e] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={14} />
                      {maxed ? 'Maks. stok' : 'Tambah'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-600">
          <span>
            Halaman <span className="font-semibold text-gray-900">{page}</span> dari{' '}
            <span className="font-semibold text-gray-900">{totalPages}</span> · {total} barang
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Cart / checkout modal */}
      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Keranjang Sewa" maxWidth="max-w-2xl">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
              <Package size={26} />
            </div>
            <p className="text-sm text-gray-500">Keranjang masih kosong. Tambahkan alat dari katalog.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {cart.map((item) => (
                <div key={item.alat.id} className="flex items-center gap-3 p-3 bg-white">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {getImageUrl(item.alat.imagePath) ? (
                      <img
                        src={getImageUrl(item.alat.imagePath)!}
                        alt={item.alat.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={18} className="text-gray-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-gray-800 truncate">{item.alat.nama}</p>
                    <p className="text-xs text-gray-500">
                      {formatRupiah(item.alat.hargaSewa)} / hari · stok {item.alat.stokTersedia}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.alat.id, -1)}
                      className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.jumlah}</span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.alat.id, 1)}
                      disabled={item.jumlah >= Math.min(item.alat.stokTersedia, 1000)}
                      className="p-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Tambah jumlah"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.alat.id)}
                    className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 flex-shrink-0"
                    aria-label="Hapus dari keranjang"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-[#2BA84A]" /> Tanggal Pinjam
                </label>
                <input
                  type="date"
                  required
                  value={tanggalPeminjaman}
                  min={todayISO()}
                  onChange={(e) => setTanggalPeminjaman(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2BA84A]/20 focus:border-[#2BA84A]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-[#2BA84A]" /> Tanggal Kembali
                </label>
                <input
                  type="date"
                  required
                  value={tanggalPengembalian}
                  min={tanggalPeminjaman || todayISO()}
                  onChange={(e) => setTanggalPengembalian(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2BA84A]/20 focus:border-[#2BA84A]"
                />
              </div>
            </div>

            <div className="rounded-xl bg-[#f4f8f4] border border-[#e3efe4] p-4 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Durasi sewa</span>
                <span className="font-semibold text-gray-800">{durasiHari} hari</span>
              </div>
              <div className="flex items-center justify-between text-gray-600 mt-1.5">
                <span>Jumlah unit</span>
                <span className="font-semibold text-gray-800">{totalUnit} unit</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e3efe4]">
                <span className="font-semibold text-gray-700">Estimasi total biaya</span>
                <span className="font-extrabold text-[#2BA84A] text-base">{formatRupiah(totalBiaya)}</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Biaya akhir mengikuti harga sewa saat transaksi dan jumlah hari yang dipinjam.
              </p>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Lanjut Pilih
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#2BA84A] hover:bg-[#248c3e] rounded-lg disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Mengirim...' : 'Ajukan Peminjaman'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
