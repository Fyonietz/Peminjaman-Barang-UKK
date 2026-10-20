// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import KategoriBarang from './pages/Admin/KategoriBarang';
import DaftarBarang from './pages/Admin/DaftarBarangPage';
import UnitBarang from './pages/Admin/UnitBarangPage';
// A temporary component to test the nested routing
const DashboardHome = () => <h2>Welcome to the Dashboard!</h2>;
const UsersPage = () => <h2>Users Management</h2>;

import PeminjamPage from './pages/Admin/PeminjamPage';
import PetugasPage from './pages/Admin/PetugasPage';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected/Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          {/* Barang */}
          <Route path="barang/kategori" element={<KategoriBarang />} />
          <Route path="barang" element={<DaftarBarang />} />
          <Route path="barang/unit" element={<UnitBarang />} />

          {/* User */}
          <Route path="/dashboard/users/peminjam" element={<PeminjamPage />} />
          <Route path="/dashboard/users/petugas" element={<PetugasPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
