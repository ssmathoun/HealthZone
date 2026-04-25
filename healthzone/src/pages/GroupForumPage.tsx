import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Film,
  Image,
  MessageCircle,
  Pencil,
  Plus,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  COMMUNITY_GROUPS,
  createGroupPost,
  deleteGroupPost,
  getGroupBySlug,
  getGroupPosts,
  isGroupJoined,
  joinCommunityGroup,
  leaveCommunityGroup,
  type GroupForumPost,
  updateGroupPost,
} from "../lib/communityGroups";

const API_BASE =
  "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php";
const MAX_PERSISTED_MEDIA_BYTES = 2 * 1024 * 1024;

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
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isVideoFile(file: File) {
  return file.type.startsWith("video/");
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read file."));
    };
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

export function GroupForumPage() {
  const navigate = useNavigate();
  const { groupSlug = "" } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const group = useMemo(() => getGroupBySlug(groupSlug), [groupSlug]);
  const [joined, setJoined] = useState(() => isGroupJoined(groupSlug));
  const [posts, setPosts] = useState<GroupForumPost[]>(() =>
    getGroupPosts(groupSlug),
  );
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newMedia, setNewMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [readingMedia, setReadingMedia] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/profile.php`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setJoined(isGroupJoined(groupSlug));
    setPosts(getGroupPosts(groupSlug));
  }, [groupSlug]);

  const resetComposer = () => {
    setNewTitle("");
    setNewBody("");
    setNewMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    setReadingMedia(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleJoin = () => {
    if (!group) return;
    joinCommunityGroup(group.slug);
    setJoined(true);
    alert(`You joined ${group.name}. You can now chat in this group.`);
  };

  const handleLeave = () => {
    if (!group || !joined) return;
    if (!confirm(`Leave ${group.name}? You can join again later.`)) return;

    leaveCommunityGroup(group.slug);
    setJoined(false);
    setShowCreateModal(false);
    setEditingPostId(null);
    setEditTitle("");
    setEditBody("");
    resetComposer();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PERSISTED_MEDIA_BYTES) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      alert("Please choose an image or video under 2 MB so it stays available after refresh.");
      return;
    }

    const nextMediaType = isVideoFile(file) ? "video" : "image";
    setReadingMedia(true);
    setNewMedia(file);
    setMediaType(nextMediaType);
    setMediaPreview(null);

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setMediaPreview(dataUrl);
    } catch {
      setNewMedia(null);
      setMediaType(null);
      setMediaPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      alert("We couldn't prepare that file. Please try another image or video.");
    } finally {
      setReadingMedia(false);
    }
  };

  const handleCreatePost = () => {
    if (!group || !currentUser) return;
    if (readingMedia) return;
    if (!newTitle.trim() && !newBody.trim() && !mediaPreview) return;

    setPosting(true);
    const nextPost: GroupForumPost = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      groupSlug: group.slug,
      user: currentUser.username || "You",
      userId: currentUser.id,
      title: newTitle.trim(),
      body: newBody.trim(),
      createdAt: new Date().toISOString(),
      mediaUrl: mediaPreview,
      mediaType,
    };

    const nextPosts = createGroupPost(nextPost);
    setPosts(nextPosts);
    setPosting(false);
    setShowCreateModal(false);
    resetComposer();
  };

  const beginEdit = (post: GroupForumPost) => {
    setEditingPostId(post.id);
    setEditTitle(post.title || "");
    setEditBody(post.body || "");
  };

  const saveEdit = () => {
    if (!group || !editingPostId) return;
    const nextPosts = updateGroupPost(group.slug, editingPostId, {
      title: editTitle.trim(),
      body: editBody.trim(),
    });
    setPosts(nextPosts);
    setEditingPostId(null);
    setEditTitle("");
    setEditBody("");
  };

  const handleDelete = (postId: string) => {
    if (!group) return;
    if (!confirm("Delete this group post?")) return;
    setPosts(deleteGroupPost(group.slug, postId));
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-[#fdfcfb]">
        <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => navigate("/community")}
              className="text-white p-2 hover:bg-white/10 rounded-full"
            >
              <ArrowLeft className="size-5" />
            </button>
            <span className="text-white font-semibold">Group Forum</span>
            <div className="w-9" />
          </div>
        </nav>
        <main className="px-4 py-8 max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-[#1e293b] font-semibold mb-2">Group not found</p>
            <button
              onClick={() => navigate("/community")}
              className="px-4 py-2 bg-[#d97706] text-white rounded-lg text-sm font-medium hover:bg-[#b45309]"
            >
              Back to Community
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate("/community")}
            className="text-white p-2 hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button
            onClick={() => navigate("/community")}
            className="font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <span className="text-[#d97706]">Health</span>
            <span className="text-white">Zone</span>
          </button>
          <div className="w-10" />
        </div>
      </nav>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-5 mb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="size-5 text-[#d97706]" />
                <h1 className="text-2xl font-bold text-[#1e293b]">
                  {group.name}
                </h1>
              </div>
              <p className="text-sm text-[#64748b] mb-2">{group.description}</p>
              <p className="text-xs text-[#64748b]">
                {group.focus}
              </p>
            </div>
            {joined ? (
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-[#d97706] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#b45309] flex items-center justify-center gap-2"
                >
                  <Plus className="size-4" />
                  Create Group Post
                </button>
                <button
                  onClick={handleLeave}
                  className="border border-[#d97706]/30 text-[#d97706] px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#d97706]/10"
                >
                  Leave Group
                </button>
              </div>
            ) : (
              <button
                onClick={handleJoin}
                className="bg-[#d97706] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#b45309]"
              >
                Join Group
              </button>
            )}
          </div>
        </div>

        {!joined ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="size-10 text-[#d97706] mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-[#1e293b] mb-2">
              Join {group.name} to enter this forum
            </h2>
            <p className="text-sm text-[#64748b] mb-4">
              Once you join, you can create posts and talk with other members
              who share this interest.
            </p>
            <button
              onClick={handleJoin}
              className="px-5 py-2.5 bg-[#d97706] text-white rounded-lg text-sm font-medium hover:bg-[#b45309]"
            >
              Join and Enter Group
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <MessageCircle className="size-10 text-[#d97706]/40 mx-auto mb-3" />
            <p className="font-medium text-[#1e293b] mb-1">
              No posts in {group.name} yet
            </p>
            <p className="text-sm text-[#64748b] mb-4">
              Start the conversation with your first group post.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#d97706] text-white rounded-lg text-sm font-medium hover:bg-[#b45309]"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const isAuthor =
                currentUser &&
                (post.userId === currentUser.id ||
                  post.user === currentUser.username);

              return (
                <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="size-10 bg-[#d97706] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {post.user.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1e293b]">
                          {post.user}
                        </p>
                        <p className="text-sm text-[#64748b]">
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    {isAuthor && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => beginEdit(post)}
                          className="p-1.5 text-[#64748b] hover:text-[#d97706] hover:bg-[#d97706]/10 rounded-lg transition-colors"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingPostId === post.id ? (
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
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-2 bg-[#d97706] text-white rounded-lg text-sm font-medium hover:bg-[#b45309]"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPostId(null)}
                          className="px-3 py-2 border border-gray-300 text-[#64748b] rounded-lg text-sm font-medium hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {post.title && (
                        <h2 className="text-lg font-semibold text-[#1e293b] mb-2">
                          {post.title}
                        </h2>
                      )}
                      {post.body && (
                        <p className="text-[#1e293b] whitespace-pre-wrap mb-3">
                          {post.body}
                        </p>
                      )}
                      {post.mediaUrl && (
                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-[#fdfcfb]">
                          {post.mediaType === "video" ? (
                            <video
                              controls
                              src={post.mediaUrl}
                              className="w-full max-h-[420px] object-cover bg-black"
                            />
                          ) : (
                            <img
                              src={post.mediaUrl}
                              alt={post.title || "Group post media"}
                              className="w-full max-h-[420px] object-cover"
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

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
                Post in {group.name}
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
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white resize-none"
              />

              {mediaPreview && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  {mediaType === "video" ? (
                    <video
                      controls
                      src={mediaPreview}
                      className="w-full max-h-80 object-cover bg-black"
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full max-h-80 object-cover"
                    />
                  )}
                </div>
              )}

              {readingMedia && (
                <p className="text-sm text-[#64748b]">
                  Preparing media for upload...
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-[#1e293b] hover:border-[#d97706] hover:text-[#d97706] transition-colors"
                >
                  <Image className="size-4" />
                  Add Image
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-[#1e293b] hover:border-[#d97706] hover:text-[#d97706] transition-colors"
                >
                  <Film className="size-4" />
                  Add Video
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <button
              onClick={handleCreatePost}
              disabled={
                posting ||
                readingMedia ||
                (!newTitle.trim() && !newBody.trim() && !newMedia)
              }
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm text-white ${
                posting ||
                readingMedia ||
                (!newTitle.trim() && !newBody.trim() && !newMedia)
                  ? "bg-gray-300"
                  : "bg-[#d97706] hover:bg-[#b45309] active:scale-[0.98]"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Send className="size-4" />
                {posting
                  ? "Posting..."
                  : readingMedia
                    ? "Preparing media..."
                    : "Create Group Post"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
