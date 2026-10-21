// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PeminjamPage from './pages/Admin/PeminjamPage';
import PetugasPage from './pages/Admin/PetugasPage';
import KategoriPage from './pages/Admin/KategoriBarang';
import DaftarBarangPage from './pages/Admin/DaftarBarangPage';
import UnitBarangPage from './pages/Admin/UnitBarangPage';
import PeminjamanPage from './pages/Petugas/PeminjamanPage';
import PengembalianPage from './pages/Petugas/PengembalianPage';
import LaporanPage from './pages/Petugas/LaporanPage';
import LogAktivitasPage from './pages/Admin/LogAktivitasPage';
// Simple Auth Guard Helper
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const session = localStorage.getItem('campgear');
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Shell for both Admin & Petugas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Main Dashboard Overview (Renders at /dashboard) */}
          <Route index element={<DashboardPage />} />

          {/* Admin - User Management */}
          <Route path="users/peminjam" element={<PeminjamPage />} />
          <Route path="users/petugas" element={<PetugasPage />} />

          {/* Admin - Inventory Management */}
          <Route path="barang/kategori" element={<KategoriPage />} />
          <Route path="barang" element={<DaftarBarangPage />} />
          <Route path="barang/unit" element={<UnitBarangPage />} />
          <Route path="logs" element={<LogAktivitasPage />} />
          {/* Shared Admin & Petugas Workflows */}
          <Route path="peminjaman" element={<PeminjamanPage />} />
          <Route path="pengembalian" element={<PengembalianPage />} />
          <Route path="laporan" element={<LaporanPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
