import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-3xl flex">

        {/* Panel kiri */}
        <div className="w-2/5 bg-blue-700 p-10 flex flex-col justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-1">
              <img src="/logo-bps.png" alt="Logo BPS" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">BADAN PUSAT STATISTIK</p>
              <p className="text-xs opacity-80">KABUPATEN SOLOK</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">SINGLE SIGN-ON BPS</h2>
            <p className="text-blue-200 text-sm">Enter your ID and Password</p>
          </div>
          <div />
        </div>

        {/* Panel kanan */}
        <div className="w-3/5 bg-blue-100 p-10 flex flex-col items-center justify-center">
          <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow mb-6 p-2">
            <img src="/logo-bps.png" alt="Logo BPS" className="w-full h-full object-contain" />
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
            <input type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none text-sm focus:bg-white focus:ring-2 focus:ring-blue-400 transition" />

            <input type="password" placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none text-sm focus:bg-white focus:ring-2 focus:ring-blue-400 transition" />

            <p className="text-right text-xs text-blue-600 cursor-pointer hover:underline">
              Forget Password?
            </p>

            {error && <p className="text-red-500 text-xs text-center bg-red-50 p-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full transition disabled:opacity-60">
              {loading ? 'Masuk...' : 'SIGN IN'}
            </button>
          </form>

          {/* Info akun demo */}
          <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
            <p className="font-medium text-gray-600">Akun Demo:</p>
            <p>admin@bps.go.id / password</p>
            <p>pegawai@bps.go.id / password</p>
          </div>
        </div>
      </div>
    </div>
  );
}
