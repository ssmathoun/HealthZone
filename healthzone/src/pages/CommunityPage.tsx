import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MessageCircle,
  Heart,
  Share2,
  Calendar,
  ArrowLeft,
  Trash2,
  Plus,
  X,
  Image,
  Film,
  Pencil,
  Send,
  Search,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import {
  COMMUNITY_GROUPS,
  getAvailableGroups,
  getJoinedGroups,
  isGroupJoined,
  joinCommunityGroup,
} from "../lib/communityGroups";

const API_BASE =
  "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php";

type ForumPost = {
  id: number;
  user: string;
  username?: string;
  user_id?: number | string;
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
  can_delete?: boolean;
  is_bookmarked?: boolean;
};

function buildAssetUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}/${path.replace(/^\/+/, "")}`;
}

function isVideoAsset(path?: string | null) {
  return !!path && /\.(mp4|webm|ogg|mov|m4v)$/i.test(path);
}

function formatPostedDate(timestamp?: string | null) {
  if (!timestamp) return "";
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeAgo(timestamp?: string | null) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatPostedDate(timestamp);
}

export function CommunityPage() {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState<
    Record<number, boolean>
  >({});
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newMedia, setNewMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<
    Record<string, boolean>
  >({});
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null,
  );
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [searchUser, setSearchUser] = useState("");
  const [searchTopic, setSearchTopic] = useState("");
  const [joinedGroups, setJoinedGroups] = useState(getJoinedGroups());
  const [availableGroups, setAvailableGroups] = useState(getAvailableGroups());

  // Profile bio modal state
  const [viewingProfile, setViewingProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/profile.php`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  const refreshGroupLists = () => {
    setJoinedGroups(getJoinedGroups());
    setAvailableGroups(getAvailableGroups());
  };

  const handleJoinGroup = (groupSlug: string) => {
    const group = COMMUNITY_GROUPS.find((entry) => entry.slug === groupSlug);
    if (!group) return;
    if (!isGroupJoined(group.slug)) {
      joinCommunityGroup(group.slug);
      refreshGroupLists();
    }
    alert(`You joined ${group.name}. You can now chat in the group.`);
  };

  const openGroupForum = (groupSlug: string) => {
    navigate(`/community/group/${groupSlug}`);
  };

  const fetchPosts = () => {
    setLoading(true);
    fetch(`${API_BASE}/posts.php?action=get_posts`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.posts)) {
          setPosts(data.posts);

          setLikedPosts(
            data.posts.reduce(
              (acc: Record<number, boolean>, post: ForumPost) => {
                const rawLiked: any = post.liked_by_user;
                acc[post.id] =
                  rawLiked === true ||
                  rawLiked === 1 ||
                  String(rawLiked) === "1" ||
                  String(rawLiked) === "true";
                return acc;
              },
              {},
            ),
          );

          setBookmarkedPosts(
            data.posts.reduce(
              (acc: Record<number, boolean>, post: ForumPost) => {
                const rawBookmarked: any = post.is_bookmarked;
                acc[post.id] =
                  rawBookmarked === true ||
                  rawBookmarked === 1 ||
                  String(rawBookmarked) === "1" ||
                  String(rawBookmarked) === "true";
                return acc;
              },
              {},
            ),
          );

          setError("");
        } else {
          setError(data.message || "Unable to load posts.");
        }
      })
      .catch(() => setError("Unable to load posts."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: number) => {
    try {
      const res = await fetch(`${API_BASE}/posts.php?action=toggle_like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ post_id: postId }),
      });
      const data = await res.json();
      if (data.status === "success") {
        const isNowLiked =
          data.liked === true || data.liked === "true" || data.liked === 1;
        setLikedPosts((prev) => ({ ...prev, [postId]: isNowLiked }));
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                likes: isNowLiked ? Number(p.likes) + 1 : Number(p.likes) - 1,
                liked_by_user: isNowLiked,
              };
            }
            return p;
          }),
        );
      }
    } catch (err) {
      console.error("Like toggle failed", err);
    }
  };

  const handleBookmark = async (postId: number) => {
    try {
      const res = await fetch(`${API_BASE}/posts.php?action=toggle_bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ post_id: postId }),
      });
      const data = await res.json();

      if (data.status === "success") {
        const isNowBookmarked =
          data.is_bookmarked === true ||
          data.is_bookmarked === "true" ||
          data.is_bookmarked === 1;
        setBookmarkedPosts((prev) => ({ ...prev, [postId]: isNowBookmarked }));
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId ? { ...p, is_bookmarked: isNowBookmarked } : p,
          ),
        );
      }
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type === "video/mp4";
    if (!isImage && !isVideo) {
      alert("Only JPG, JPEG, PNG images and MP4 videos are allowed.");
      return;
    }
    setNewMedia(file);
    setMediaType(isImage ? "image" : "video");
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setNewMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() && !newBody.trim() && !newMedia) {
      alert("Post must contain content.");
      return;
    }
    setPosting(true);
    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("body", newBody);
    if (newMedia) formData.append("media", newMedia);

    try {
      const res = await fetch(`${API_BASE}/posts.php?action=create_post`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") {
        setShowCreateModal(false);
        setNewTitle("");
        setNewBody("");
        clearMedia();
        fetchPosts();
      } else {
        alert(data.message || "Failed to create post");
      }
    } catch {
      alert("Network error creating post");
    }
    setPosting(false);
  };

  const startEdit = (post: ForumPost) => {
    setEditingPost(post);
    setEditTitle(post.title || "");
    setEditBody(post.body || post.content || "");
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() && !editBody.trim()) {
      alert("Post cannot be empty.");
      return;
    }
    if (!editingPost) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/posts.php?action=edit_post`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: editingPost.id,
          title: editTitle,
          body: editBody,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setEditingPost(null);
        fetchPosts();
      } else {
        alert(data.message || "Failed to edit post");
      }
    } catch {
      alert("Network error");
    }
    setSaving(false);
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("Delete this post?")) return;
    setDeletingId(postId);
    try {
      const res = await fetch(`${API_BASE}/forum.php?action=delete_post`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        const res2 = await fetch(`${API_BASE}/posts.php?action=delete_post`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post_id: postId }),
        });
        const data2 = await res2.json();
        if (data2.status === "success") {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        } else {
          alert(data2.message || "Unable to delete post.");
        }
      }
    } catch {
      alert("Unable to delete post.");
    }
    setDeletingId(null);
  };

  const toggleComments = (postId: number) => {
    const key = String(postId);
    const isOpen = openComments[key];
    setOpenComments((prev) => ({ ...prev, [key]: !isOpen }));
    if (!isOpen) fetchComments(postId);
  };

  const fetchComments = async (postId: number) => {
    const key = String(postId);
    try {
      const res = await fetch(
        `${API_BASE}/comments.php?action=get_comments&post_id=${postId}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.comments)) {
        setPostComments((prev) => ({ ...prev, [key]: data.comments }));
      }
    } catch {}
  };

  const handleSubmitComment = async (postId: number) => {
    const key = String(postId);
    const text = (commentText[key] || "").trim();
    if (!text) return;
    setSubmittingComment((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(`${API_BASE}/comments.php?action=add_comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, text }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setCommentText((prev) => ({ ...prev, [key]: "" }));
        fetchComments(postId);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: (p.comments || 0) + 1,
                  comment_count: (p.comment_count || p.comments || 0) + 1,
                }
              : p,
          ),
        );
      }
    } catch {}
    setSubmittingComment((prev) => ({ ...prev, [key]: false }));
  };

  const handleEditComment = async (commentId: number, postId: number) => {
    const text = editingCommentText.trim();
    if (!text) return;
    try {
      const res = await fetch(`${API_BASE}/comments.php?action=edit_comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId, text }),
      });
      const data = await res.json();
      if (data.status === "success") {
        const key = String(postId);
        setPostComments((prev) => ({
          ...prev,
          [key]: (prev[key] || []).map((c: any) =>
            c.id === commentId ? { ...c, text } : c,
          ),
        }));
        setEditingCommentId(null);
        setEditingCommentText("");
      } else {
        alert(data.message || "Failed to edit comment");
      }
    } catch {
      alert("Unable to edit comment.");
    }
  };

  const handleDeleteComment = async (commentId: number, postId: number) => {
    if (!confirm("Delete this comment?")) return;
    setDeletingCommentId(commentId);
    try {
      const res = await fetch(
        `${API_BASE}/comments.php?action=delete_comment`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment_id: commentId }),
        },
      );
      const data = await res.json();
      if (data.status === "success") {
        const key = String(postId);
        setPostComments((prev) => ({
          ...prev,
          [key]: (prev[key] || []).filter((c: any) => c.id !== commentId),
        }));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: Math.max(0, (p.comments || 0) - 1),
                  comment_count: Math.max(
                    0,
                    (p.comment_count || p.comments || 0) - 1,
                  ),
                }
              : p,
          ),
        );
      } else {
        alert(data.message || "Failed to delete comment");
      }
    } catch {
      alert("Unable to delete comment.");
    }
    setDeletingCommentId(null);
  };

  // View a user's profile bio
  const viewUserProfile = async (userId: number | string | undefined, username: string) => {
    const id = userId ? Number(userId) : null;
    if (!id) return;
    setProfileLoading(true);
    setViewingProfile({ username, avatar: null, email: '' });
    try {
      const res = await fetch(`${API_BASE}/profile.php?user_id=${id}`, { credentials: 'include' });
      const data = await res.json();
      if (data.status === 'success' && data.user) {
        setViewingProfile(data.user);
      }
    } catch {}
    setProfileLoading(false);
  };

  const isAuthor = (post: ForumPost) => {
    if (!currentUser) return false;
    return (
      post.can_delete ||
      post.user_id === currentUser.id ||
      post.username === currentUser.username
    );
  };

  const filteredPosts = posts.filter((post) => {
    const userName = (post.user || post.username || "").toLowerCase();
    const title = (post.title || "").toLowerCase();
    const body = (post.body || post.content || "").toLowerCase();
    const userMatch =
      !searchUser.trim() || userName.includes(searchUser.toLowerCase());
    const topicMatch =
      !searchTopic.trim() ||
      title.includes(searchTopic.toLowerCase()) ||
      body.includes(searchTopic.toLowerCase());
    return userMatch && topicMatch;
  });

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-white p-2 hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="font-semibold text-lg"
          >
            <span className="text-[#d97706]">Health</span>
            <span className="text-white">Zone</span>
          </button>
          <div className="w-10"></div>
        </div>
      </nav>

      <main className="px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1e293b] mb-2">
                Community
              </h1>
              <p className="text-[#64748b]">Connect with fitness enthusiasts</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/bookmarks")}
                className="bg-white text-[#d97706] border border-[#d97706] px-4 py-2.5 rounded-lg hover:bg-[#fffbeb] font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Bookmark className="size-4" /> Bookmarks
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-[#d97706] text-white px-4 py-2.5 rounded-lg hover:bg-[#b45309] font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="size-4" /> Create Post
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            <div className="relative">
              <Search className="size-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search by user..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white"
              />
              {searchUser && (
                <button
                  onClick={() => setSearchUser("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1e293b]"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <Search className="size-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTopic}
                onChange={(e) => setSearchTopic(e.target.value)}
                placeholder="Search by topic..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white"
              />
              {searchTopic && (
                <button
                  onClick={() => setSearchTopic("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1e293b]"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {loading && (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-[#64748b]">
                      Loading forum posts...
                    </p>
                  </div>
                )}
                {!loading && error && (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}
                {!loading && !error && filteredPosts.length === 0 && (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <MessageCircle className="size-12 text-[#d97706]/30 mx-auto mb-3" />
                    {posts.length === 0 ? (
                      <>
                        <p className="font-medium text-[#1e293b] mb-1">
                          No forum posts yet
                        </p>
                        <p className="text-sm text-[#64748b] mb-4">
                          Be the first to share something!
                        </p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="px-6 py-2.5 bg-[#d97706] text-white rounded-lg font-medium text-sm"
                        >
                          Create Post
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-[#1e293b] mb-1">
                          No matching posts
                        </p>
                        <p className="text-sm text-[#64748b]">
                          Try a different search term
                        </p>
                      </>
                    )}
                  </div>
                )}

                {!loading &&
                  !error &&
                  filteredPosts.map((post) => {
                    const liked =
                      likedPosts[post.id] === true ||
                      (likedPosts[post.id] === undefined &&
                        !!post.liked_by_user);
                    const likeCount =
                      post.likes +
                      (liked === !!post.liked_by_user ? 0 : liked ? 1 : -1);
                    const bookmarked =
                      bookmarkedPosts[post.id] === true ||
                      (bookmarkedPosts[post.id] === undefined &&
                        !!post.is_bookmarked);
                    const avatarUrl = buildAssetUrl(post.avatar);
                    const mediaUrl = buildAssetUrl(
                      post.image || post.media_url,
                    );
                    const postKey = String(post.id);

                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-lg shadow-md p-4"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-10 bg-[#d97706] rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold text-white shrink-0 relative">
                              <span className="absolute text-sm font-semibold text-white">
                                {(post.user || post.username || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                              {avatarUrl && (
                                <img
                                  src={avatarUrl}
                                  alt=""
                                  className="w-full h-full object-cover relative z-10"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3
                                className="font-semibold text-[#1e293b] truncate cursor-pointer hover:text-[#d97706] transition-colors"
                                onClick={(e) => { e.stopPropagation(); viewUserProfile(post.user_id, post.user || post.username || ''); }}
                              >
                                {post.user || post.username}
                              </h3>
                              <p className="text-sm text-[#64748b]">
                                {post.time || formatTimeAgo(post.created_at)}
                                {post.created_at
                                  ? ` · ${formatPostedDate(post.created_at)}`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          {isAuthor(post) && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => startEdit(post)}
                                className="p-1.5 text-[#64748b] hover:text-[#d97706] hover:bg-[#d97706]/10 rounded-lg transition-colors"
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                disabled={deletingId === post.id}
                                className="p-1.5 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {post.title && (
                          <h2 className="text-lg font-semibold text-[#1e293b] mb-2">
                            {post.title}
                          </h2>
                        )}
                        <p className="text-[#1e293b] mb-3 whitespace-pre-wrap">
                          {post.body || post.content}
                        </p>

                        {mediaUrl && (
                          <div className="mb-3 overflow-hidden rounded-lg border border-gray-200 bg-[#fdfcfb]">
                            {isVideoAsset(mediaUrl) ||
                            post.media_type === "video" ? (
                              <video
                                src={mediaUrl}
                                controls
                                className="w-full max-h-[420px] bg-black"
                              />
                            ) : (
                              <img
                                src={mediaUrl}
                                alt=""
                                className="w-full max-h-[420px] object-cover"
                              />
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 text-sm transition-colors ${liked ? "text-[#d97706]" : "text-[#64748b] hover:text-[#d97706]"}`}
                          >
                            <Heart
                              className={`size-4 ${liked ? "fill-current" : ""}`}
                            />
                            <span>{likeCount}</span>
                          </button>
                          <button
                            onClick={() => toggleComments(post.id)}
                            className={`flex items-center gap-2 text-sm transition-colors ${openComments[postKey] ? "text-[#d97706]" : "text-[#64748b] hover:text-[#d97706]"}`}
                          >
                            <MessageCircle className="size-4" />
                            <span>
                              {post.comment_count || post.comments || 0}
                            </span>
                          </button>
                          <button className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#d97706] transition-colors">
                            <Share2 className="size-4" />
                            <span>Share</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleBookmark(post.id);
                            }}
                            className={`ml-auto flex items-center gap-2 text-sm transition-all active:scale-95 ${bookmarked ? "text-[#d97706]" : "text-[#64748b] hover:text-[#d97706]"}`}
                          >
                            <Bookmark
                              className={`size-4 transition-colors ${bookmarked ? "fill-[#d97706] text-[#d97706]" : ""}`}
                            />
                          </button>
                        </div>

                        {openComments[postKey] && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex gap-2 mb-3">
                              <input
                                type="text"
                                value={commentText[postKey] || ""}
                                onChange={(e) =>
                                  setCommentText((prev) => ({
                                    ...prev,
                                    [postKey]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleSubmitComment(post.id);
                                }}
                                placeholder="Write a comment..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white"
                              />
                              <button
                                onClick={() => handleSubmitComment(post.id)}
                                disabled={
                                  !(commentText[postKey] || "").trim() ||
                                  submittingComment[postKey]
                                }
                                className={`px-3 py-2 rounded-lg text-white transition-colors ${!(commentText[postKey] || "").trim() || submittingComment[postKey] ? "bg-gray-300" : "bg-[#d97706] hover:bg-[#b45309]"}`}
                              >
                                <Send className="size-4" />
                              </button>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {(postComments[postKey] || []).length === 0 ? (
                                <p className="text-xs text-[#64748b] text-center py-2">
                                  No comments yet. Be the first!
                                </p>
                              ) : (
                                (postComments[postKey] || []).map((c: any) => (
                                  <div key={c.id} className="flex gap-2">
                                    <div className="size-7 bg-[#1e293b] rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-[10px] shrink-0 mt-0.5 relative">
                                      <span className="absolute text-[10px] font-bold text-white">
                                        {(c.username || "U")
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                      {c.avatar && (
                                        <img
                                          src={buildAssetUrl(c.avatar)}
                                          alt=""
                                          className="w-full h-full object-cover relative z-10"
                                          onError={(e) => {
                                            (
                                              e.target as HTMLImageElement
                                            ).style.display = "none";
                                          }}
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-semibold text-[#1e293b]">
                                          {c.username}
                                        </span>
                                        <span className="text-[10px] text-[#64748b]">
                                          {formatTimeAgo(c.created_at)}
                                        </span>
                                        {c.can_delete &&
                                          editingCommentId !== c.id && (
                                            <div className="ml-auto flex items-center gap-1">
                                              <button
                                                onClick={() => {
                                                  setEditingCommentId(c.id);
                                                  setEditingCommentText(c.text);
                                                }}
                                                className="p-1 text-[#64748b] hover:text-[#d97706] hover:bg-[#d97706]/10 rounded transition-colors"
                                              >
                                                <Pencil className="size-3" />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleDeleteComment(
                                                    c.id,
                                                    post.id,
                                                  )
                                                }
                                                disabled={
                                                  deletingCommentId === c.id
                                                }
                                                className="p-1 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                              >
                                                <Trash2 className="size-3" />
                                              </button>
                                            </div>
                                          )}
                                      </div>
                                      {editingCommentId === c.id ? (
                                        <div className="flex gap-2 mt-1">
                                          <input
                                            type="text"
                                            value={editingCommentText}
                                            onChange={(e) =>
                                              setEditingCommentText(
                                                e.target.value,
                                              )
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter")
                                                handleEditComment(
                                                  c.id,
                                                  post.id,
                                                );
                                              if (e.key === "Escape") {
                                                setEditingCommentId(null);
                                                setEditingCommentText("");
                                              }
                                            }}
                                            className="flex-1 px-2 py-1 text-sm border border-[#d97706] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d97706] bg-white"
                                            autoFocus
                                          />
                                          <button
                                            onClick={() =>
                                              handleEditComment(c.id, post.id)
                                            }
                                            disabled={
                                              !editingCommentText.trim()
                                            }
                                            className="px-2 py-1 text-xs bg-[#d97706] text-white rounded-lg hover:bg-[#b45309] disabled:opacity-50"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditingCommentId(null);
                                              setEditingCommentText("");
                                            }}
                                            className="px-2 py-1 text-xs border border-gray-300 text-[#64748b] rounded-lg hover:bg-gray-100"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-[#1e293b]">
                                          {c.text}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                  <Users className="size-5 text-[#d97706]" />
                  Groups
                </h2>

                {joinedGroups.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b] mb-2">
                      Your Groups
                    </p>
                    <div className="space-y-2">
                      {joinedGroups.map((group) => (
                        <button
                          key={group.slug}
                          onClick={() => openGroupForum(group.slug)}
                          className="w-full flex items-center justify-between p-3 bg-[#fdfcfb] rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <div>
                            <p className="font-medium text-[#1e293b] text-sm">
                              {group.name}
                            </p>
                            <p className="text-xs text-[#64748b]">
                              Joined group
                            </p>
                          </div>
                          <ExternalLink className="size-4 text-[#d97706]" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                    Discover Groups
                  </p>
                  {availableGroups.length === 0 ? (
                    <div className="p-3 bg-[#fdfcfb] rounded-lg">
                      <p className="text-sm text-[#64748b]">
                        You have joined all available groups.
                      </p>
                    </div>
                  ) : (
                    availableGroups.map((group) => (
                      <div
                        key={group.slug}
                        className="p-3 bg-[#fdfcfb] rounded-lg border border-gray-100"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-[#1e293b] text-sm">
                              {group.name}
                            </p>
                            <p className="text-xs text-[#64748b] mb-1">
                              {group.focus}
                            </p>
                            <p className="text-xs text-[#64748b]">
                              {group.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleJoinGroup(group.slug)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#d97706] text-white hover:bg-[#b45309] transition-colors whitespace-nowrap"
                          >
                            Join
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                  <Calendar className="size-5 text-[#d97706]" />
                  Upcoming Events
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-[#fdfcfb] rounded-lg">
                    <p className="font-medium text-[#1e293b] text-sm">
                      Basketball Game
                    </p>
                    <p className="text-xs text-[#64748b]">Today, 6:00 PM</p>
                  </div>
                  <div className="p-3 bg-[#fdfcfb] rounded-lg">
                    <p className="font-medium text-[#1e293b] text-sm">
                      Morning Run
                    </p>
                    <p className="text-xs text-[#64748b]">Tomorrow, 6:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-1 pb-2 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1e293b]">
                Create Post
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#64748b] hover:text-[#1e293b]"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Post title (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white"
              />
              <textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white resize-none"
                rows={4}
              />
              {mediaPreview && (
                <div className="relative">
                  {mediaType === "image" ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full max-h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <video controls className="w-full max-h-48 rounded-lg">
                      <source src={mediaPreview} type="video/mp4" />
                    </video>
                  )}
                  <button
                    onClick={clearMedia}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept =
                        "image/jpeg,image/jpg,image/png";
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#64748b] hover:border-[#d97706] hover:text-[#d97706] transition-colors"
                >
                  <Image className="size-4" /> Image
                </button>
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "video/mp4";
                      fileInputRef.current.click();
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#64748b] hover:border-[#d97706] hover:text-[#d97706] transition-colors"
                >
                  <Film className="size-4" /> Video
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
            <button
              onClick={handleCreatePost}
              disabled={
                posting || (!newTitle.trim() && !newBody.trim() && !newMedia)
              }
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm text-white ${posting || (!newTitle.trim() && !newBody.trim() && !newMedia) ? "bg-gray-300" : "bg-[#d97706] hover:bg-[#b45309] active:scale-[0.98]"}`}
            >
              {posting ? "Posting..." : "Create Post"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setEditingPost(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-1 pb-2 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1e293b]">
                Edit Post
              </h2>
              <button
                onClick={() => setEditingPost(null)}
                className="text-[#64748b] hover:text-[#1e293b]"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Post title"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white"
              />
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Post content"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEditingPost(null)}
                className="flex-1 py-3 border-2 border-gray-300 text-[#64748b] rounded-xl font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || (!editTitle.trim() && !editBody.trim())}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm text-white ${saving || (!editTitle.trim() && !editBody.trim()) ? "bg-gray-300" : "bg-[#d97706] hover:bg-[#b45309]"}`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Bio Modal */}
      {viewingProfile && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setViewingProfile(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-sm p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-1 pb-2 sm:hidden">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1e293b]">User Profile</h2>
              <button
                onClick={() => setViewingProfile(null)}
                className="text-[#64748b] hover:text-[#1e293b]"
              >
                <X className="size-5" />
              </button>
            </div>

            {profileLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-[#64748b]">Loading profile...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="size-20 bg-[#d97706] rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3 relative">
                  <span className="absolute text-2xl font-bold text-white">
                    {(viewingProfile.username || "U").charAt(0).toUpperCase()}
                  </span>
                  {viewingProfile.avatar && (
                    <img
                      src={buildAssetUrl(viewingProfile.avatar)}
                      alt=""
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                </div>
                <h3 className="text-xl font-bold text-[#1e293b] mb-1">
                  {viewingProfile.username}
                </h3>
                {viewingProfile.email && (
                  <p className="text-sm text-[#64748b] mb-4">{viewingProfile.email}</p>
                )}
                <div className="bg-[#fdfcfb] rounded-lg p-4 border border-gray-200 text-left">
                  <p className="text-sm text-[#64748b]">
                    Member of the HealthZone community
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
