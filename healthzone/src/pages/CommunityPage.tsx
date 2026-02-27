import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, Heart, Share2, Trophy, Calendar, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export function CommunityPage() {
  const navigate = useNavigate();
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});

  const handleLike = (postId: string) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const posts = [
    {
      id: '1',
      user: 'Sarah Chen',
      avatar: '👩',
      time: '2h ago',
      content: 'Just completed my first 5K run! Thanks to everyone in Runners United for the motivation 🏃‍♀️',
      likes: 24,
      comments: 8,
      image: null
    },
    {
      id: '2',
      user: 'Mike Rodriguez',
      avatar: '👨',
      time: '5h ago',
      content: 'New PR on bench press - 225 lbs! The 30-day consistency challenge is really paying off 💪',
      likes: 42,
      comments: 15,
      image: null
    },
    {
      id: '3',
      user: 'Jordan Kim',
      avatar: '🧑',
      time: '1d ago',
      content: 'Meal prep Sunday complete! 5 days of healthy meals ready to go. Who else is prepping today?',
      likes: 31,
      comments: 12,
      image: null
    }
  ];

  const groups = [
    { id: 1, name: 'FitSquad', members: 24, activity: 'Basketball' },
    { id: 2, name: 'Runners United', members: 18, activity: 'Running' },
    { id: 3, name: 'Meal Preppers', members: 32, activity: 'Nutrition' },
    { id: 4, name: 'Yoga Warriors', members: 15, activity: 'Yoga' }
  ];

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Navigation */}
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-white p-2 hover:bg-white/10 rounded-full flex items-center gap-2"
          >
            <ArrowLeft className="size-5" />
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <span className="text-[#d97706]">Health</span>
            <span className="text-white">Zone</span>
          </button>
          <div className="w-10"></div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1e293b] mb-2">Community</h1>
            <p className="text-[#64748b]">Connect with fitness enthusiasts</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <textarea 
                  placeholder="Share your progress or ask a question..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97706] resize-none"
                  rows={3}
                ></textarea>
                <div className="flex justify-end mt-2">
                  <button className="bg-[#d97706] text-white px-4 py-2 rounded-lg hover:bg-[#b45309]">
                    Post
                  </button>
                </div>
              </div>

              {/* Posts */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="size-10 bg-[#d97706] rounded-full flex items-center justify-center text-xl">
                        {post.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1e293b]">{post.user}</h3>
                        <p className="text-sm text-[#64748b]">{post.time}</p>
                      </div>
                    </div>
                    <p className="text-[#1e293b] mb-4">{post.content}</p>
                    <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 text-sm transition-colors ${
                          likedPosts[post.id] ? 'text-[#d97706]' : 'text-[#64748b] hover:text-[#d97706]'
                        }`}
                      >
                        <Heart className={`size-4 ${likedPosts[post.id] ? 'fill-current' : ''}`} />
                        <span>{post.likes + (likedPosts[post.id] ? 1 : 0)}</span>
                      </button>
                      <button className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#d97706] transition-colors">
                        <MessageCircle className="size-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#d97706] transition-colors">
                        <Share2 className="size-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* My Groups */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                  <Users className="size-5 text-[#d97706]" />
                  My Groups
                </h2>
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div 
                      key={group.id}
                      className="flex items-center justify-between p-3 bg-[#fdfcfb] rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="font-medium text-[#1e293b] text-sm">{group.name}</p>
                        <p className="text-xs text-[#64748b]">{group.members} members</p>
                      </div>
                      <Users className="size-4 text-[#d97706]" />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-3 text-[#d97706] text-sm font-medium hover:text-[#b45309]">
                  + Join New Group
                </button>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="font-semibold text-[#1e293b] mb-3 flex items-center gap-2">
                  <Calendar className="size-5 text-[#d97706]" />
                  Upcoming Events
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-[#fdfcfb] rounded-lg">
                    <p className="font-medium text-[#1e293b] text-sm">Basketball Game</p>
                    <p className="text-xs text-[#64748b]">Today, 6:00 PM</p>
                  </div>
                  <div className="p-3 bg-[#fdfcfb] rounded-lg">
                    <p className="font-medium text-[#1e293b] text-sm">Morning Run</p>
                    <p className="text-xs text-[#64748b]">Tomorrow, 6:30 AM</p>
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg shadow-md p-4 text-white">
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="size-5 text-[#d97706]" />
                  Leaderboard
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>🥇 Sarah Chen</span>
                    <span className="font-semibold">2,840 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>🥈 Mike Rodriguez</span>
                    <span className="font-semibold">2,735 pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>🥉 Jordan Kim</span>
                    <span className="font-semibold">2,680 pts</span>
                  </div>
                </div>
                <button className="w-full mt-3 text-[#d97706] text-sm font-medium hover:text-[#f59e0b]">
                  View Full Leaderboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}