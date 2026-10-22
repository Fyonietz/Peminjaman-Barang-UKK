// src/pages/LoginPage.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { http } from '../services/api';

export default function LoginPage() {
  const [noTelepon, setNoTelepon] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Send credentials to the API
      const response = await http.post('/auth/login', {
        noTelepon,
        password
      });

      // Store the session data (token, expiresAt, user object)
      localStorage.setItem('campgear', JSON.stringify(response.data));

      // Redirect based on role
      const userRole = response.data.user.role;
      if (userRole === 'Peminjam') {
        navigate('/dashboard/katalog');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      // Show the 401 Unauthorized or 400 Bad Request error detail from the API
      setError(err.response?.data?.detail || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-left-panel"></div>

        <div className="login-right-panel">
          <h1 className="login-title">Login</h1>

          <form onSubmit={handleLogin} className="login-form">

            {/* Error Message Banner */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm font-medium p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="input-group">
              <label htmlFor="noTelepon">Nomor Telepon</label>
              <input
                type="text"
                id="noTelepon"
                value={noTelepon}
                onChange={(e) => setNoTelepon(e.target.value)}
                placeholder="081200000001"
                required
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="login-submit-btn flex justify-center items-center min-h-[44px]"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Belum punya akun? Hubungi petugas CampGear di basecamp.
          </p>
          <p className="text-center text-xs">
            <Link to="/" className="font-semibold text-[#29422c] hover:underline">
              Kembali ke halaman utama
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
