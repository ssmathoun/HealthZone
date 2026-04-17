import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Users, Award, Dumbbell, X } from 'lucide-react';

const trainers = [
  {
    id: 1,
    name: "Coach Sarah Miller",
    specialty: "Strength Training",
    rating: 4.9,
    emoji: "💪",
    bio: "NSCA Certified Strength & Conditioning Specialist with 8+ years of experience. Specializes in progressive overload training and powerlifting programs.",
    clients: 142,
    email: "sarah.miller@healthzone.com",
    certifications: ["NSCA-CSCS", "NASM-CPT", "First Aid/CPR"],
    workouts: ["Push Day Power", "Leg Day Builder", "Pull Day Strength"],
  },
  {
    id: 2,
    name: "Dr. James Wilson",
    specialty: "Nutrition & Performance",
    rating: 4.8,
    emoji: "🥗",
    bio: "PhD in Sports Nutrition from UB. Helps athletes optimize their performance through evidence-based nutrition strategies and functional fitness routines.",
    clients: 98,
    email: "james.wilson@healthzone.com",
    certifications: ["PhD Sports Nutrition", "ISSN-CISSN", "ACE-CPT"],
    workouts: ["Full Body HIIT", "Core & Mobility"],
  },
  {
    id: 3,
    name: "Coach Maria Garcia",
    specialty: "Yoga & Flexibility",
    rating: 4.7,
    emoji: "🧘",
    bio: "RYT-500 certified yoga instructor with a focus on athletic recovery and mobility. 6 years of experience helping athletes prevent injuries through flexibility training.",
    clients: 76,
    email: "maria.garcia@healthzone.com",
    certifications: ["RYT-500", "NASM-CES", "First Aid/CPR"],
    workouts: ["Morning Flow", "Deep Stretch Recovery", "Athletic Mobility"],
  },
  {
    id: 4,
    name: "Coach Mike Thompson",
    specialty: "Cardio & Endurance",
    rating: 4.6,
    emoji: "🏃",
    bio: "Former collegiate track athlete turned certified running coach. Specializes in marathon training, HIIT programming, and cardiovascular conditioning.",
    clients: 112,
    email: "mike.thompson@healthzone.com",
    certifications: ["RRCA Running Coach", "ACE-CPT", "USAW-L1"],
    workouts: ["5K Training Plan", "Sprint Intervals", "Endurance Builder"],
  },
];

export function TrainerDirectoryPage() {
  const navigate = useNavigate();
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/dashboard')} className="text-white p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <Award className="size-5 text-[#d97706]" />
            <span className="text-white font-semibold text-base">Trainer Directory</span>
          </div>
          <div className="w-9" />
        </div>
      </nav>

      <main className="px-4 py-6 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1e293b] mb-1">Certified Trainers</h1>
          <p className="text-sm text-[#64748b]">Select a professional to guide your fitness journey</p>
        </div>

        <div className="space-y-4">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              onClick={() => setSelectedTrainer(trainer)}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg hover:border-[#d97706] border border-transparent transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#d97706]/20 rounded-full flex items-center justify-center text-2xl shrink-0">
                  {trainer.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1e293b] text-base">{trainer.name}</h3>
                  <p className="text-sm text-[#64748b] mb-2">{trainer.specialty}</p>
                  <div className="flex items-center gap-4 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 text-[#d97706] fill-[#d97706]" /> {trainer.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3.5" /> {trainer.clients} clients
                    </span>
                  </div>
                </div>
                <button className="text-xs text-[#d97706] font-medium px-3 py-1.5 border border-[#d97706] rounded-full hover:bg-[#d97706] hover:text-white transition-colors shrink-0">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Trainer Detail Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedTrainer(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-md p-4 sm:p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-1 pb-2 sm:hidden"><div className="w-10 h-1 bg-gray-300 rounded-full"></div></div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1e293b]">Trainer Profile</h2>
              <button onClick={() => setSelectedTrainer(null)} className="text-[#64748b] hover:text-[#1e293b]"><X className="size-5" /></button>
            </div>

            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-[#d97706]/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
                {selectedTrainer.emoji}
              </div>
              <h3 className="text-xl font-bold text-[#1e293b]">{selectedTrainer.name}</h3>
              <p className="text-sm text-[#64748b]">{selectedTrainer.specialty}</p>
              {selectedTrainer.email && (
                <p className="text-xs text-[#64748b] mt-1">{selectedTrainer.email}</p>
              )}
              <div className="flex items-center justify-center gap-4 mt-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#d97706]">
                    <Star className="size-4 inline text-[#d97706] fill-[#d97706]" /> {selectedTrainer.rating}
                  </div>
                  <div className="text-xs text-[#64748b]">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#d97706]">{selectedTrainer.clients}</div>
                  <div className="text-xs text-[#64748b]">Clients</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-[#1e293b] text-sm mb-2">About</h4>
              <p className="text-sm text-[#64748b] leading-relaxed">{selectedTrainer.bio}</p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-[#1e293b] text-sm mb-2">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTrainer.certifications.map((cert: string) => (
                  <span key={cert} className="text-xs bg-[#1e293b]/5 text-[#1e293b] px-2 py-1 rounded-full">{cert}</span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-[#1e293b] text-sm mb-2">Workouts by {selectedTrainer.name.split(' ')[0]}</h4>
              <div className="space-y-2">
                {selectedTrainer.workouts.map((w: string) => (
                  <div key={w} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="size-4 text-[#d97706]" />
                      <span className="text-sm font-medium text-[#1e293b]">{w}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setSelectedTrainer(null); navigate('/workouts'); }}
              className="w-full bg-[#d97706] text-white py-3 rounded-lg hover:bg-[#b45309] font-medium flex items-center justify-center gap-2"
            >
              <Dumbbell className="size-4" />
              View Their Workouts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
