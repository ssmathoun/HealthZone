import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, MessageCircle, Check } from 'lucide-react';

const API_BASE = 'https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php';

type Notification = {
  id: number;
  type: string;
  message: string;
  post_id: number | null;
  from_username: string;
  is_read: boolean;
  created_at: string;
};

function formatTimeAgo(timestamp: string) {
  const d = new Date(timestamp);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    setLoading(true);
    fetch(`${API_BASE}/notifications.php?action=get_notifications`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    // Mark all as read when page opens
    fetch(`${API_BASE}/notifications.php?action=mark_all_read`, { method: 'POST', credentials: 'include' }).catch(() => {});
  }, []);

  const handleNotificationClick = (notif: Notification) => {
    // Mark individual as read
    fetch(`${API_BASE}/notifications.php?action=mark_read`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: notif.id }),
    }).catch(() => {});

    // Navigate to the post if it's a comment notification
    if (notif.post_id) {
      navigate(`/forum`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/dashboard')} className="text-white p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="size-5" /></button>
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-[#d97706]" />
            <span className="text-white font-semibold text-base">Notifications</span>
          </div>
          <div className="w-10"></div>
        </div>
      </nav>

      <main className="px-4 py-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-[#64748b]">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="size-12 text-[#d97706]/30 mx-auto mb-3" />
            <p className="font-medium text-[#1e293b] mb-1">No notifications yet</p>
            <p className="text-sm text-[#64748b]">You'll see alerts here when someone interacts with your posts</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${notif.is_read ? 'bg-white border-gray-200' : 'bg-[#d97706]/5 border-[#d97706]/20'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${notif.is_read ? 'bg-gray-100' : 'bg-[#d97706]/10'}`}>
                    <MessageCircle className={`size-5 ${notif.is_read ? 'text-[#64748b]' : 'text-[#d97706]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.is_read ? 'text-[#64748b]' : 'text-[#1e293b] font-medium'}`}>
                      <span className="font-semibold">{notif.from_username}</span> {notif.message}
                    </p>
                    <p className="text-xs text-[#64748b] mt-1">{formatTimeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0 mt-1.5"></div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
