import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Trash2, Dumbbell } from 'lucide-react';

const API_BASE = 'https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php';

export function CreateWorkoutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);

  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [duration, setDuration] = useState('');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [exercises, setExercises] = useState([{ name: '', sets: '3', reps: '10', weight: 'Bodyweight', rest: '60s' }]);

  const toggleMuscle = (mg: string) => {
    setMuscleGroups(prev => prev.includes(mg) ? prev.filter(m => m !== mg) : [...prev, mg]);
  };

  const addExercise = () => setExercises(prev => [...prev, { name: '', sets: '3', reps: '10', weight: 'Bodyweight', rest: '60s' }]);
  const updateExercise = (i: number, field: string, val: string) => setExercises(prev => prev.map((ex, idx) => idx === i ? { ...ex, [field]: val } : ex));
  const removeExercise = (i: number) => { if (exercises.length > 1) setExercises(prev => prev.filter((_, idx) => idx !== i)); };

  const handleCreate = async () => {
    if (!name || exercises.some(e => !e.name)) return;
    setSaving(true);
    const workout = {
      name, difficulty,
      duration: parseInt(duration) || 30,
      calories: (parseInt(duration) || 30) * 8,
      muscleGroups,
      exercises: exercises.map(e => ({ ...e, sets: parseInt(e.sets) || 3 })),
    };
    try {
      await fetch(`${API_BASE}/workouts.php?action=create_workout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(workout),
      });
    } catch {}
    setSaving(false);
    setCreated(true);
  };

  const stepTitles = ['Details', 'Exercises'];

  if (created) {
    return (
      <div className="min-h-screen bg-[#fdfcfb]">
        <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => navigate('/dashboard')} className="text-white p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="size-5" /></button>
            <button onClick={() => navigate('/dashboard')} className="font-semibold text-lg"><span className="text-[#d97706]">Health</span><span className="text-white">Zone</span></button>
            <div className="w-10"></div>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center px-4 pt-20">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"><Check className="size-10 text-green-600" /></div>
          <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Workout Created!</h2>
          <p className="text-[#64748b] mb-1">{name}</p>
          <p className="text-sm text-[#d97706] font-medium mb-8">{exercises.length} exercises · {duration || '30'} min · {difficulty}</p>
          <div className="flex gap-3 w-full max-w-sm">
            <button onClick={() => navigate('/workouts')} className="flex-1 py-3 border-2 border-[#d97706] text-[#d97706] rounded-lg font-medium">View Workouts</button>
            <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 bg-[#d97706] text-white rounded-lg font-medium hover:bg-[#b45309]">Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="text-white p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="size-5" /></button>
          <button onClick={() => navigate('/dashboard')} className="font-semibold text-lg"><span className="text-[#d97706]">Health</span><span className="text-white">Zone</span></button>
          <div className="w-10"></div>
        </div>
      </nav>

      <main className="px-4 py-5 max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1e293b] mb-1">Create Workout</h1>
        <p className="text-sm text-[#64748b] mb-5">Step {step} of 2 — {stepTitles[step - 1]}</p>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-[#d97706]' : 'bg-gray-200'}`}></div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Workout Name <span className="text-red-400">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Morning Push Day" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'Beginner', emoji: '🌱' },
                  { key: 'Intermediate', emoji: '💪' },
                  { key: 'Advanced', emoji: '🔥' },
                ].map(d => (
                  <button key={d.key} onClick={() => setDifficulty(d.key)} className={`py-3 rounded-xl text-center transition-all ${difficulty === d.key ? 'bg-[#d97706] text-white shadow-md' : 'bg-white text-[#64748b] border border-gray-200 hover:border-[#d97706]'}`}>
                    <div className="text-xl mb-1">{d.emoji}</div>
                    <div className="text-[11px] sm:text-xs font-medium">{d.key}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Duration (minutes)</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="30" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-2">Muscle Groups</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'Chest', emoji: '🫁' },
                  { key: 'Back', emoji: '🔙' },
                  { key: 'Shoulders', emoji: '🏋️' },
                  { key: 'Arms', emoji: '💪' },
                  { key: 'Legs', emoji: '🦵' },
                  { key: 'Core', emoji: '🎯' },
                  { key: 'Full Body', emoji: '🧍' },
                  { key: 'Cardio', emoji: '❤️' },
                ].map(mg => (
                  <button key={mg.key} onClick={() => toggleMuscle(mg.key)} className={`py-2.5 rounded-xl text-center transition-all ${muscleGroups.includes(mg.key) ? 'bg-[#d97706] text-white shadow-md' : 'bg-white text-[#64748b] border border-gray-200 hover:border-[#d97706]'}`}>
                    <div className="text-lg mb-0.5">{mg.emoji}</div>
                    <div className="text-[10px] font-medium leading-tight">{mg.key}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => { if (name) setStep(2); }} disabled={!name} className={`w-full py-3.5 rounded-xl font-semibold text-sm text-white mt-2 ${!name ? 'bg-gray-300' : 'bg-[#d97706] hover:bg-[#b45309] shadow-md active:scale-[0.98]'}`}>Next: Add Exercises →</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#1e293b]">Exercises <span className="text-red-400">*</span></label>
              <button onClick={addExercise} className="text-xs text-[#d97706] font-medium flex items-center gap-1"><Plus className="size-3.5" />Add Exercise</button>
            </div>

            <div className="space-y-3">
              {exercises.map((ex, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#d97706] text-white rounded-lg flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                      <span className="text-sm font-semibold text-[#1e293b]">Exercise {idx + 1}</span>
                    </div>
                    {exercises.length > 1 && (
                      <button onClick={() => removeExercise(idx)} className="text-red-400 hover:text-red-600"><Trash2 className="size-4" /></button>
                    )}
                  </div>
                  <input type="text" value={ex.name} onChange={e => updateExercise(idx, 'name', e.target.value)} placeholder="e.g., Bench Press" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[10px] sm:text-xs text-[#64748b] mb-1">Sets</label>
                      <input type="number" value={ex.sets} onChange={e => updateExercise(idx, 'sets', e.target.value)} className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs text-[#64748b] mb-1">Reps</label>
                      <input type="text" value={ex.reps} onChange={e => updateExercise(idx, 'reps', e.target.value)} className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs text-[#64748b] mb-1">Weight</label>
                      <input type="text" value={ex.weight} onChange={e => updateExercise(idx, 'weight', e.target.value)} className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs text-[#64748b] mb-1">Rest</label>
                      <input type="text" value={ex.rest} onChange={e => updateExercise(idx, 'rest', e.target.value)} className="w-full px-2 py-2 border border-gray-300 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleCreate} disabled={exercises.some(e => !e.name) || saving} className={`w-full py-3.5 rounded-xl font-semibold text-sm text-white ${exercises.some(e => !e.name) || saving ? 'bg-gray-300' : 'bg-[#d97706] hover:bg-[#b45309] shadow-md active:scale-[0.98]'}`}>
              {saving ? 'Creating...' : 'Create Workout'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
