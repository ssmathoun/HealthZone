import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Heart, Share2, Bookmark } from 'lucide-react';

const API_BASE = 'https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php';

type ForumPost = {
  id: number;
  user: string;
  username?: string;
  user_id?: number;
  avatar?: string | null;
  time: string;
  created_at?: string | null;
  content: string;
  title?: string | null;
  body?: string | null;
  likes: number;
  comments: number;
  comment_count?: number;
  image?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  liked_by_user?: boolean;
  is_bookmarked?: boolean;
};

function buildAssetUrl(path?: string | null) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}/${path.replace(/^\/+/, '')}`;
}

function isVideoAsset(path?: string | null) {
  return !!path && /\.(mp4|webm|ogg|mov|m4v)$/i.test(path);
}

function formatTimeAgo(timestamp?: string | null) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function BookmarksPage() {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Record<number, boolean>>({});
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    setLoading(true);
    fetch(`${API_BASE}/posts.php?action=get_posts`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.posts)) {
          setPosts(data.posts);
          setLikedPosts(data.posts.reduce((acc: Record<number, boolean>, post: ForumPost) => {
            acc[post.id] = !!post.liked_by_user; return acc;
          }, {}));
          setBookmarkedPosts(data.posts.reduce((acc: Record<number, boolean>, post: ForumPost) => {
            acc[post.id] = !!post.is_bookmarked; return acc;
          }, {}));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleLike = async (postId: number) => {
    try {
      const res = await fetch(`${API_BASE}/posts.php?action=toggle_like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setLikedPosts(prev => ({ ...prev, [postId]: data.liked }));
        setPosts(prevPosts => prevPosts.map(p => {
          if (p.id === postId) {
            return { ...p, likes: data.liked ? (Number(p.likes) + 1) : (Number(p.likes) - 1), liked_by_user: data.liked };
          }
          return p;
        }));
      }
    } catch (err) { console.error("Like toggle failed", err); }
  };

  const handleBookmark = async (postId: number) => {
    try {
      const res = await fetch(`${API_BASE}/posts.php?action=toggle_bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBookmarkedPosts(prev => ({ ...prev, [postId]: data.is_bookmarked }));
        setPosts(prevPosts => prevPosts.map(p => {
          if (p.id === postId) {
            return { ...p, is_bookmarked: data.is_bookmarked };
          }
          return p;
        }));
      }
    } catch (err) { console.error("Bookmark toggle failed", err); }
  };

  // ONLY SHOW POSTS THAT ARE ACTIVELY BOOKMARKED
  const savedPosts = posts.filter(post => bookmarkedPosts[post.id]);

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/dashboard')} className="text-white p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="size-5" /></button>
          <button onClick={() => navigate('/dashboard')} className="font-semibold text-lg"><span className="text-[#d97706]">Health</span><span className="text-white">Zone</span></button>
          <div className="w-10"></div>
        </div>
      </nav>

      <main className="px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Bookmark className="size-6 text-[#d97706] fill-current" />
            <h1 className="text-3xl font-bold text-[#1e293b]">Bookmarks</h1>
          </div>

          <div className="space-y-4">
            {loading && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-[#64748b]">Loading bookmarks...</p>
              </div>
            )}
            
            {!loading && savedPosts.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Bookmark className="size-12 text-[#d97706]/30 mx-auto mb-3" />
                <p className="font-medium text-[#1e293b] mb-1">No bookmarked posts</p>
                <p className="text-sm text-[#64748b]">Go to the community forum to save posts here.</p>
                <button onClick={() => navigate('/community')} className="mt-4 px-6 py-2.5 bg-[#d97706] text-white rounded-lg font-medium text-sm hover:bg-[#b45309]">Go to Community</button>
              </div>
            )}

            {!loading && savedPosts.map((post) => {
              const liked = likedPosts[post.id] ?? !!post.liked_by_user;
              const likeCount = post.likes + (liked === !!post.liked_by_user ? 0 : liked ? 1 : -1);
              const avatarUrl = buildAssetUrl(post.avatar);
              const mediaUrl = buildAssetUrl(post.image || post.media_url);

              return (
                <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 bg-[#d97706] rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold text-white shrink-0 relative">
                        <span className="absolute text-sm font-semibold text-white">{(post.user || post.username || 'U').charAt(0).toUpperCase()}</span>
                        {avatarUrl && <img src={avatarUrl} alt="" className="w-full h-full object-cover relative z-10" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#1e293b] truncate">{post.user || post.username}</h3>
                        <p className="text-sm text-[#64748b]">{post.time || formatTimeAgo(post.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {post.title && <h2 className="text-lg font-semibold text-[#1e293b] mb-2">{post.title}</h2>}
                  <p className="text-[#1e293b] mb-3 whitespace-pre-wrap">{post.body || post.content}</p>

                  {mediaUrl && (
                    <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-[#fdfcfb]">
                      {isVideoAsset(mediaUrl) || post.media_type === 'video' ? (
                        <video src={mediaUrl} controls className="w-full max-h-[420px] bg-black" />
                      ) : (
                        <img src={mediaUrl} alt="" className="w-full max-h-[420px] object-cover" />
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                    <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 text-sm transition-colors ${liked ? 'text-[#d97706]' : 'text-[#64748b] hover:text-[#d97706]'}`}>
                      <Heart className={`size-4 ${liked ? 'fill-current' : ''}`} />
                      <span>{likeCount}</span>
                    </button>
                    <button onClick={() => navigate('/community')} className={`flex items-center gap-2 text-sm transition-colors text-[#64748b] hover:text-[#d97706]`}>
                      <MessageCircle className="size-4" />
                      <span>{post.comment_count || post.comments || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#d97706] transition-colors">
                      <Share2 className="size-4" /><span>Share</span>
                    </button>
                    
                    <button 
                      onClick={() => handleBookmark(post.id)} 
                      className="ml-auto flex items-center gap-2 text-sm transition-colors text-[#d97706]"
                    >
                      <Bookmark className="size-4 fill-current" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}