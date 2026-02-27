import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Bell, Moon, LogOut, ChevronRight, Camera } from 'lucide-react';

export function ProfileSettingsPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex.johnson@email.com');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
        <h1 className="text-2xl font-bold text-[#1e293b] mb-6">Profile Settings</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[#d97706]/20 flex items-center justify-center text-4xl">👤</div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#d97706] text-white rounded-full flex items-center justify-center shadow-md">
              <Camera className="size-4" />
            </button>
          </div>
          <p className="mt-3 font-semibold text-[#1e293b]">{name}</p>
          <p className="text-sm text-[#64748b]">{email}</p>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-base font-semibold text-[#1e293b] mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Full Name</label>
              <div className="flex items-center gap-2">
                <User className="size-4 text-[#64748b]" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-[#64748b]" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Password</label>
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-[#64748b]" />
                <input type="password" value="••••••••" readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                <button className="text-xs text-[#d97706] font-medium whitespace-nowrap">Change</button>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-base font-semibold text-[#1e293b] mb-4">Preferences</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell className="size-5 text-[#64748b]" />
                <div>
                  <p className="text-sm font-medium text-[#1e293b]">Push Notifications</p>
                  <p className="text-xs text-[#64748b]">Workout reminders & updates</p>
                </div>
              </div>
              <button onClick={() => setNotifications(!notifications)} className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? 'bg-[#d97706]' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${notifications ? 'translate-x-5.5 right-0.5' : 'left-0.5'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Moon className="size-5 text-[#64748b]" />
                <div>
                  <p className="text-sm font-medium text-[#1e293b]">Dark Mode</p>
                  <p className="text-xs text-[#64748b]">Coming soon</p>
                </div>
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-[#d97706]' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${darkMode ? 'translate-x-5.5 right-0.5' : 'left-0.5'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button onClick={handleSave} className={`w-full py-3 rounded-lg font-medium transition-colors mb-4 ${saved ? 'bg-green-500 text-white' : 'bg-[#d97706] text-white hover:bg-[#b45309]'}`}>
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>

        {/* Logout */}
        <button onClick={() => window.location.href = 'https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/jaspreet/#/login'} className="w-full py-3 rounded-lg font-medium border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
          <LogOut className="size-4" />
          Sign Out
        </button>
      </main>
    </div>
  );
}
