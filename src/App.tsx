// src/App.tsx
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layouts/DashboardLayout'; // Sesuaikan path ini jika perlu

// --- Pages Import ---
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Dashboard Pages
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import PetugasDashboardPage from './pages/Petugas/PetugasDashboardPage';

// Admin - Master Data Pages
import PeminjamPage from './pages/Admin/PeminjamPage';
import PetugasPage from './pages/Admin/PetugasPage';
import KategoriPage from './pages/Admin/KategoriBarang'; // Sesuai dengan import Anda sebelumnya
import DaftarBarangPage from './pages/Admin/DaftarBarangPage';
import UnitBarangPage from './pages/Admin/UnitBarangPage';
import LogAktivitasPage from './pages/Admin/LogAktivitasPage';

// Petugas/Shared - Transaksi Pages
// (Sesuaikan nama folder import jika file ini Anda taruh di Admin/ atau Petugas/)
import PeminjamanPage from './pages/Petugas/PeminjamanPage';
import PengembalianPage from './pages/Petugas/PengembalianPage';
import LaporanPage from './pages/Petugas/LaporanPage';

// Peminjam - Self Service Pages
import KatalogPage from './pages/Peminjam/KatalogPage';
import PeminjamanSayaPage from './pages/Peminjam/PeminjamanSayaPage';

// --- Auth Guard Helper ---
function ProtectedRoute({ children }: { children: ReactNode }) {
  const session = localStorage.getItem('campgear');
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

// --- Role Guard Helper ---
function RoleRoute({ roles, children }: { roles: string[]; children: ReactNode }) {
  const sessionData = localStorage.getItem('campgear');
  if (!sessionData) return <Navigate to="/login" replace />;

  const role = JSON.parse(sessionData)?.user?.role;
  if (!roles.includes(role)) return <Navigate to="/dashboard" replace />;

  return children;
}

// --- Dynamic Dashboard Wrapper ---
// Memisahkan halaman utama (index) sesuai role pengguna
function DashboardIndex() {
  const sessionData = localStorage.getItem('campgear');
  const role = sessionData ? JSON.parse(sessionData)?.user?.role : null;

  if (role === 'Admin') return <AdminDashboardPage />;
  if (role === 'Petugas') return <PetugasDashboardPage />;
  if (role === 'Peminjam') return <Navigate to="/dashboard/katalog" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Login Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Shell for Admin, Petugas & Peminjam */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Main Dashboard Overview (Otomatis diarahkan oleh DashboardIndex) */}
          <Route index element={<DashboardIndex />} />

          {/* Admin - User Management */}
          <Route path="users/peminjam" element={<PeminjamPage />} />
          <Route path="users/petugas" element={<PetugasPage />} />

          {/* Admin - Inventory Management */}
          <Route path="barang/kategori" element={<KategoriPage />} />
          <Route path="barang" element={<DaftarBarangPage />} />
          <Route path="barang/unit" element={<UnitBarangPage />} />

          {/* Admin - System Logs */}
          <Route path="logs" element={<LogAktivitasPage />} />

          {/* Shared Admin & Petugas Workflows */}
          <Route path="peminjaman" element={<PeminjamanPage />} />
          <Route path="pengembalian" element={<PengembalianPage />} />
          <Route path="laporan" element={<LaporanPage />} />

          {/* Peminjam - Catalog, Loans & Returns */}
          <Route
            path="katalog"
            element={
              <RoleRoute roles={['Peminjam']}>
                <KatalogPage />
              </RoleRoute>
            }
          />
          <Route
            path="peminjaman-saya"
            element={
              <RoleRoute roles={['Peminjam']}>
                <PeminjamanSayaPage />
              </RoleRoute>
            }
          />
        </Route>

        {/* Fallback - Jika URL tidak ditemukan, kembalikan ke landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
