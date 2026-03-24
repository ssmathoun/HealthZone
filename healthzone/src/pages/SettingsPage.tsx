import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

const API_BASE = "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php";

export function SettingsPage() {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!passwords.oldPassword) {
      setIsError(true);
      setMessage('Current password is required.');
      return;
    }
    if (!passwords.newPassword) {
      setIsError(true);
      setMessage('New password is required.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      setIsError(true);
      setMessage('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      const params = new URLSearchParams();
      params.append('oldPassword', passwords.oldPassword);
      params.append('newPassword', passwords.newPassword);
      params.append('confirmNewPassword', passwords.confirmNewPassword);

      const response = await fetch(`${API_BASE}/settings.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        setIsError(false);
        setMessage(result.message);
        setPasswords({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      } else {
        setIsError(true);
        setMessage(result.message || 'An error occurred.');
      }
    } catch (error) {
      setIsError(true);
      console.error('Password reset error:', error);
      setMessage('Network error. Please check your VPN connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/dashboard')} className="text-white p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="size-5" />
          </button>
          <button onClick={() => navigate('/dashboard')} className="font-semibold text-lg hover:opacity-80 transition-opacity">
            <span className="text-[#d97706]">Health</span><span className="text-white">Zone</span>
          </button>
          <div className="w-10"></div>
        </div>
      </nav>

      <main className="px-4 py-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1e293b] mb-6">Settings</h1>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-base font-semibold text-[#1e293b] mb-4">Reset Password</h2>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Current Password</label>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-[#64748b] shrink-0" />
                <input
                  type="password"
                  value={passwords.oldPassword}
                  onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                  placeholder="••••••••"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">New Password</label>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-[#64748b] shrink-0" />
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Confirm New Password</label>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-[#64748b] shrink-0" />
                <input
                  type="password"
                  value={passwords.confirmNewPassword}
                  onChange={e => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                  placeholder="••••••••"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                />
              </div>
            </div>

            {message && (
              <p className={`text-sm font-medium ${isError ? 'text-red-500' : 'text-green-600'}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-lg font-medium bg-[#d97706] text-white hover:bg-[#b45309] transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}