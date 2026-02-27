import { useNavigate } from 'react-router-dom';
import { Dumbbell, UtensilsCrossed, Moon, TrendingUp, Users, Trophy, Shield, Smartphone } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      {/* Navigation */}
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate('/dashboard')}
              className="font-semibold text-xl hover:opacity-80 transition-opacity"
            >
              <span className="text-[#d97706]">Health</span>
              <span className="text-white">Zone</span>
            </button>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-[#d97706] text-white rounded-full hover:bg-[#b45309] transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1e293b] mb-6">
            Your Complete Health & Fitness Platform
          </h1>
          <p className="text-xl text-[#64748b] mb-8 max-w-3xl mx-auto">
            Track workouts, manage nutrition, monitor sleep, and connect with a community of fitness enthusiasts. Everything you need in one place.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-[#d97706] text-white text-lg rounded-full hover:bg-[#b45309] transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-[#1e293b] text-center mb-12">
            All-In-One Platform
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Dumbbell className="size-8 text-[#d97706]" />}
              title="Workout Tracking"
              description="Log exercises, sets, reps, and track your progress over time"
            />
            <FeatureCard 
              icon={<UtensilsCrossed className="size-8 text-[#d97706]" />}
              title="Nutrition & Recipes"
              description="Manage recipes, log meals, and track your macros"
            />
            <FeatureCard 
              icon={<Moon className="size-8 text-[#d97706]" />}
              title="Sleep Monitoring"
              description="Track sleep patterns and quality for better recovery"
            />
            <FeatureCard 
              icon={<TrendingUp className="size-8 text-[#d97706]" />}
              title="Progress Analytics"
              description="Visualize your fitness journey with detailed charts"
            />
            <FeatureCard 
              icon={<Users className="size-8 text-[#d97706]" />}
              title="Community Features"
              description="Join group activities and connect with others"
            />
            <FeatureCard 
              icon={<Trophy className="size-8 text-[#d97706]" />}
              title="Challenges & Leaderboards"
              description="Compete with friends and stay motivated"
            />
            <FeatureCard 
              icon={<Shield className="size-8 text-[#d97706]" />}
              title="Pro Mode"
              description="For trainers and dieticians to manage clients"
            />
            <FeatureCard 
              icon={<Smartphone className="size-8 text-[#d97706]" />}
              title="Fully Responsive"
              description="Access on any device, anywhere, anytime"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#1e293b]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Health?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users already achieving their fitness goals
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-[#d97706] text-white text-lg rounded-full hover:bg-[#b45309] transition-colors"
          >
            Start Your Journey
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e293b] py-8 border-t border-[#64748b]/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-semibold text-xl">
            <span className="text-[#d97706]">Health</span>
            <span className="text-white">Zone</span>
          </div>
          <p className="text-white text-sm">
            © 2026 HealthZone (HZ Labs)
          </p>
          <div className="flex items-center gap-6 text-white text-sm">
            <a href="#" className="hover:text-[#d97706] transition-colors">About Us</a>
            <a href="#" className="hover:text-[#d97706] transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-lg border border-[#64748b]/20 hover:border-[#d97706] transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-[#1e293b] mb-2">{title}</h3>
      <p className="text-[#64748b]">{description}</p>
    </div>
  );
}