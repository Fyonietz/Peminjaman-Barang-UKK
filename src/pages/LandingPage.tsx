// src/pages/LandingPage.tsx
import { Link } from 'react-router-dom';
import {
  Tent,
  ShieldCheck,
  Wallet,
  Clock,
  ClipboardCheck,
  PackageCheck,
  CalendarCheck,
  ArrowRight,
  MapPin,
  Phone,
  Compass,
} from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Barang Terawat',
    desc: 'Setiap unit diperiksa sebelum dan sesudah disewakan, jadi perlengkapanmu selalu siap dipakai.',
  },
  {
    icon: Wallet,
    title: 'Harga Transparan',
    desc: 'Harga sewa per hari tertera jelas di katalog. Total biaya dihitung otomatis saat mengajukan.',
  },
  {
    icon: Clock,
    title: 'Proses Cepat',
    desc: 'Ajukan peminjaman dalam hitungan menit, lalu ambil barang setelah disetujui petugas.',
  },
];

const steps = [
  {
    icon: ClipboardCheck,
    title: 'Pilih & Ajukan',
    desc: 'Telusuri katalog, masukkan alat ke keranjang, lalu tentukan tanggal pinjam dan kembali.',
  },
  {
    icon: PackageCheck,
    title: 'Ambil Barang',
    desc: 'Petugas menyetujui pengajuan dan menyerahkan unit beserta kode inventarisnya.',
  },
  {
    icon: CalendarCheck,
    title: 'Kembalikan',
    desc: 'Kembalikan semua unit sesuai tanggal. Kondisi barang dicatat saat pengembalian.',
  },
];

const kategori = [
  { nama: 'Tenda', desc: 'Dome, flysheet, hingga tenda keluarga.' },
  { nama: 'Carrier & Tas', desc: 'Carrier 45L sampai 80L untuk pendakian.' },
  { nama: 'Sleeping Bag', desc: 'Tetap hangat di suhu dingin pegunungan.' },
  { nama: 'Alat Masak', desc: 'Kompor portable, nesting, dan cookset.' },
  { nama: 'Penerangan', desc: 'Headlamp dan lampu tenda tahan air.' },
  { nama: 'Aksesoris', desc: 'Trekking pole, matras, dan lainnya.' },
];

export default function LandingPage() {
  const sessionData = localStorage.getItem('campgear');
  const session = sessionData ? JSON.parse(sessionData) : null;
  const isLoggedIn = Boolean(session?.token);
  const primaryTarget = isLoggedIn ? '/dashboard/katalog' : '/login';
  const dashboardTarget =
    session?.user?.role === 'Admin' || session?.user?.role === 'Petugas' ? '/dashboard' : '/dashboard/katalog';

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-[#2BA84A] text-white flex items-center justify-center">
              <Tent size={20} />
            </span>
            <span className="font-bold text-lg tracking-tight text-[#264027]">CampGear</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#keunggulan" className="hover:text-[#2BA84A] transition-colors">Keunggulan</a>
            <a href="#cara-sewa" className="hover:text-[#2BA84A] transition-colors">Cara Sewa</a>
            <a href="#katalog" className="hover:text-[#2BA84A] transition-colors">Perlengkapan</a>
          </nav>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link
                to={dashboardTarget}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2BA84A] hover:bg-[#248c3e] text-white text-sm font-semibold transition-colors"
              >
                Dashboard
                <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2BA84A] hover:bg-[#248c3e] text-white text-sm font-semibold transition-colors"
              >
                Masuk
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-[#264027] text-white overflow-hidden">
        <img
          src="/camping.jpeg"
          alt="Perlengkapan camping"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#264027] via-[#264027]/85 to-[#264027]/40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide">
            <Compass size={14} /> Rental perlengkapan outdoor
          </span>

          <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight max-w-2xl">
            Sewa perlengkapan camping tanpa ribet.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#cfe3d3] max-w-xl leading-relaxed">
            Tenda, carrier, sleeping bag, sampai alat masak — cek ketersediaan unit secara langsung,
            ajukan peminjaman, dan ambil barang di basecamp CampGear.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to={primaryTarget}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2BA84A] hover:bg-[#248c3e] text-white text-sm font-semibold shadow-lg shadow-black/20 transition-colors"
            >
              Mulai Sewa Sekarang
              <ArrowRight size={18} />
            </Link>
            <a
              href="#cara-sewa"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-sm font-semibold transition-colors"
            >
              Lihat cara sewa
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-xl">
            <div>
              <p className="text-2xl font-extrabold text-white">Stok Live</p>
              <p className="text-xs text-[#a0c2a6] mt-1">Jumlah unit tersedia selalu diperbarui</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">3 Langkah</p>
              <p className="text-xs text-[#a0c2a6] mt-1">Ajukan, ambil, lalu kembalikan</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-white">Per Hari</p>
              <p className="text-xs text-[#a0c2a6] mt-1">Biaya sewa dihitung sesuai durasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan */}
      <section id="keunggulan" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#2BA84A]">Keunggulan</p>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-[#264027]">
            Perlengkapan siap pakai, prosedur jelas
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div key={feature.title} className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-[#2BA84A]/10 text-[#2BA84A] flex items-center justify-center">
                <feature.icon size={22} />
              </div>
              <h3 className="mt-4 font-bold text-gray-800">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cara sewa */}
      <section id="cara-sewa" className="bg-[#f4f8f4] border-y border-[#e3efe4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2BA84A]">Cara Sewa</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-[#264027]">
              Tiga langkah dari katalog ke basecamp
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((step, index) => (
              <div key={step.title} className="relative p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <span className="absolute top-5 right-5 text-4xl font-extrabold text-[#2BA84A]/10">
                  0{index + 1}
                </span>
                <div className="w-11 h-11 rounded-xl bg-[#264027] text-white flex items-center justify-center">
                  <step.icon size={22} />
                </div>
                <h3 className="mt-4 font-bold text-gray-800">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Katalog kategori */}
      <section id="katalog" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#2BA84A]">Perlengkapan</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-[#264027]">
              Semua kebutuhan camping dalam satu tempat
            </h2>
          </div>
          <Link
            to={primaryTarget}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2BA84A] hover:text-[#248c3e]"
          >
            Buka katalog lengkap <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kategori.map((item) => (
            <div
              key={item.nama}
              className="flex items-start gap-3 p-5 rounded-xl border border-gray-200 bg-white hover:border-[#2BA84A]/40 hover:shadow-sm transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-[#2BA84A]/10 text-[#2BA84A] flex items-center justify-center flex-shrink-0">
                <Tent size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{item.nama}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 md:pb-20">
        <div className="rounded-2xl bg-gradient-to-r from-[#264027] to-[#2BA84A] text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">Siap berangkat?</h2>
            <p className="mt-2 text-sm text-[#cfe3d3] max-w-lg">
              Masuk ke akunmu untuk melihat ketersediaan unit dan mengajukan peminjaman.
              Belum punya akun? Hubungi petugas CampGear di basecamp.
            </p>
          </div>
          <Link
            to={primaryTarget}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#264027] text-sm font-bold hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            {isLoggedIn ? 'Ke Dashboard' : 'Masuk ke Akun'}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#264027] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row gap-8 md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#2BA84A] flex items-center justify-center">
                <Tent size={18} />
              </span>
              <span className="font-bold">CampGear</span>
            </div>
            <p className="mt-3 text-xs text-[#a0c2a6] max-w-sm">
              Rental perlengkapan camping untuk petualangan yang lebih ringan.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-xs text-[#cfe3d3]">
            <span className="inline-flex items-center gap-2">
              <MapPin size={14} className="text-[#2BA84A]" /> Basecamp CampGear, Bandung
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone size={14} className="text-[#2BA84A]" /> 0812-0000-0003
            </span>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-[11px] text-[#a0c2a6]">
          © {new Date().getFullYear()} CampGear. Semua hak dilindungi.
        </div>
      </footer>
    </div>
  );
}
