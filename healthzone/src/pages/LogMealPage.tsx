import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UtensilsCrossed, Check, Flame, Trash2 } from 'lucide-react';

const API_BASE = 'https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php';

const presets = [
  { name: 'Protein Shake', cal: 250, pro: 30, carb: 15, fat: 5, emoji: '🥤' },
  { name: 'Chicken & Rice', cal: 520, pro: 45, carb: 55, fat: 10, emoji: '🍗' },
  { name: 'Greek Yogurt', cal: 150, pro: 15, carb: 12, fat: 5, emoji: '🥛' },
  { name: 'Salad Bowl', cal: 380, pro: 28, carb: 30, fat: 14, emoji: '🥗' },
  { name: 'Oatmeal', cal: 280, pro: 10, carb: 45, fat: 6, emoji: '🥣' },
  { name: 'Protein Bar', cal: 220, pro: 20, carb: 25, fat: 8, emoji: '🍫' },
  { name: 'Eggs & Toast', cal: 350, pro: 22, carb: 30, fat: 16, emoji: '🍳' },
  { name: 'Banana', cal: 105, pro: 1, carb: 27, fat: 0, emoji: '🍌' },
];

const mealEmoji: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };

export function LogMealPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'log' | 'history'>('log');
  const [mealType, setMealType] = useState('lunch');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [logged, setLogged] = useState(false);
  const [saving, setSaving] = useState(false);

  const [meals, setMeals] = useState<any[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);

  const fetchMeals = async () => {
    setLoadingMeals(true);
    try {
      const res = await fetch(`${API_BASE}/meals.php?action=get_meals`, { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) setMeals(data);
    } catch {}
    setLoadingMeals(false);
  };

  useEffect(() => { fetchMeals(); }, []);

  const applyPreset = (p: typeof presets[0]) => {
    setMealName(p.name);
    setCalories(String(p.cal));
    setProtein(String(p.pro));
    setCarbs(String(p.carb));
    setFat(String(p.fat));
  };

  const resetForm = () => {
    setMealName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
    setLogged(false);
  };

  const handleLog = async () => {
    if (!mealName || !calories) return;
    setSaving(true);
    const meal = {
      name: mealName, type: mealType,
      calories: parseInt(calories) || 0, protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0, fat: parseInt(fat) || 0,
    };
    try {
      await fetch(`${API_BASE}/meals.php?action=log_meal`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(meal),
      });
    } catch {}
    setSaving(false);
    setLogged(true);
    fetchMeals();
  };

  const deleteMeal = async (id: number) => {
    try {
      await fetch(`${API_BASE}/meals.php?action=delete_meal`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ id }),
      });
    } catch {}
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const totalCal = meals.reduce((s, m) => s + (parseInt(m.calories) || 0), 0);
  const totalPro = meals.reduce((s, m) => s + (parseInt(m.protein) || 0), 0);
  const totalCarb = meals.reduce((s, m) => s + (parseInt(m.carbs) || 0), 0);
  const totalFat = meals.reduce((s, m) => s + (parseInt(m.fat) || 0), 0);

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/dashboard')} className="text-white p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="size-5" /></button>
          <button onClick={() => navigate('/dashboard')} className="font-semibold text-lg"><span className="text-[#d97706]">Health</span><span className="text-white">Zone</span></button>
          <div className="w-10"></div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40">
        <div className="max-w-lg mx-auto flex">
          <button onClick={() => { setTab('log'); if (logged) resetForm(); }} className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${tab === 'log' ? 'text-[#d97706] border-b-2 border-[#d97706]' : 'text-[#64748b]'}`}>
            Log Meal
          </button>
          <button onClick={() => setTab('history')} className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${tab === 'history' ? 'text-[#d97706] border-b-2 border-[#d97706]' : 'text-[#64748b]'}`}>
            Today's Meals
            {meals.length > 0 && <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-[#d97706] text-white rounded-full">{meals.length}</span>}
          </button>
        </div>
      </div>

      {tab === 'log' && !logged && (
        <main className="px-4 py-5 max-w-lg mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e293b] mb-1">Log Meal</h1>
          <p className="text-sm text-[#64748b] mb-5">Track what you eat today</p>

          {/* Meal Type */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#1e293b] mb-2">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'breakfast', emoji: '🌅', label: 'Breakfast' },
                { key: 'lunch', emoji: '☀️', label: 'Lunch' },
                { key: 'dinner', emoji: '🌙', label: 'Dinner' },
                { key: 'snack', emoji: '🍎', label: 'Snack' },
              ].map(t => (
                <button key={t.key} onClick={() => setMealType(t.key)} className={`py-3 rounded-xl text-center transition-all ${mealType === t.key ? 'bg-[#d97706] text-white shadow-md scale-[1.02]' : 'bg-white text-[#64748b] border border-gray-200 hover:border-[#d97706]'}`}>
                  <div className="text-xl mb-1">{t.emoji}</div>
                  <div className="text-[11px] sm:text-xs font-medium">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Add */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#1e293b] mb-2">Quick Add</label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)} className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all ${mealName === p.name ? 'bg-[#d97706]/10 border-2 border-[#d97706]' : 'bg-white border border-gray-200 hover:border-[#d97706]'}`}>
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-[#1e293b]">{p.name}</p>
                    <p className="text-[11px] text-[#64748b]">{p.cal} cal · {p.pro}g protein</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-5"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div><div className="relative flex justify-center"><span className="bg-[#fdfcfb] px-3 text-xs text-[#64748b]">or enter manually</span></div></div>

          {/* Manual Entry */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Meal Name <span className="text-red-400">*</span></label>
              <input type="text" value={mealName} onChange={e => setMealName(e.target.value)} placeholder="e.g., Grilled Chicken Salad" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-1">Calories <span className="text-red-400">*</span></label>
                <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="450" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-1">Protein (g)</label>
                <input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="35" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-1">Carbs (g)</label>
                <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="50" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-1">Fat (g)</label>
                <input type="number" value={fat} onChange={e => setFat(e.target.value)} placeholder="15" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleLog} disabled={!mealName || !calories || saving} className={`w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all ${!mealName || !calories || saving ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#d97706] hover:bg-[#b45309] shadow-md active:scale-[0.98]'}`}>
            {saving ? 'Logging...' : 'Log Meal'}
          </button>
        </main>
      )}

      {/* Success Screen */}
      {tab === 'log' && logged && (
        <div className="flex flex-col items-center justify-center px-4 pt-20 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"><Check className="size-10 text-green-600" /></div>
          <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Meal Logged!</h2>
          <p className="text-[#64748b] mb-1">{mealName}</p>
          <div className="flex gap-3 text-sm mb-8">
            <span className="text-[#d97706] font-semibold">{calories} cal</span>
            {protein && <span className="text-[#64748b]">{protein}g protein</span>}
            {carbs && <span className="text-[#64748b]">{carbs}g carbs</span>}
            {fat && <span className="text-[#64748b]">{fat}g fat</span>}
          </div>
          <div className="flex gap-3 w-full max-w-sm">
            <button onClick={resetForm} className="flex-1 py-3 border-2 border-[#d97706] text-[#d97706] rounded-lg font-medium">Log Another</button>
            <button onClick={() => setTab('history')} className="flex-1 py-3 bg-[#d97706] text-white rounded-lg font-medium hover:bg-[#b45309]">View Today's Meals</button>
          </div>
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <main className="px-4 py-5 max-w-lg mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e293b] mb-1">Today's Meals</h1>
          <p className="text-sm text-[#64748b] mb-5">Everything you've logged today</p>

          {/* Summary Card */}
          {meals.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
              <h3 className="text-sm font-semibold text-[#1e293b] mb-3">Daily Summary</h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-[#d97706]">{totalCal}</div>
                  <div className="text-[10px] sm:text-xs text-[#64748b]">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-[#1e293b]">{totalPro}g</div>
                  <div className="text-[10px] sm:text-xs text-[#64748b]">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-[#1e293b]">{totalCarb}g</div>
                  <div className="text-[10px] sm:text-xs text-[#64748b]">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-[#1e293b]">{totalFat}g</div>
                  <div className="text-[10px] sm:text-xs text-[#64748b]">Fat</div>
                </div>
              </div>
            </div>
          )}

          {loadingMeals ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-[#64748b]">Loading meals...</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-12">
              <UtensilsCrossed className="size-12 text-[#d97706]/30 mx-auto mb-3" />
              <p className="text-[#1e293b] font-medium mb-1">No meals logged yet</p>
              <p className="text-sm text-[#64748b] mb-4">Start tracking your meals today</p>
              <button onClick={() => setTab('log')} className="px-6 py-2.5 bg-[#d97706] text-white rounded-lg font-medium text-sm hover:bg-[#b45309]">Log Your First Meal</button>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal: any) => (
                <div key={meal.id} className="bg-white rounded-xl border border-gray-200 p-4 transition-all hover:shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="text-2xl mt-0.5">{mealEmoji[meal.meal_type || meal.type] || '🍽️'}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#1e293b] text-sm truncate">{meal.name}</h3>
                        <p className="text-xs text-[#64748b] capitalize">{meal.meal_type || meal.type}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                          <span className="text-xs font-semibold text-[#d97706] flex items-center gap-1"><Flame className="size-3" />{meal.calories} cal</span>
                          {parseInt(meal.protein) > 0 && <span className="text-xs text-[#64748b]">{meal.protein}g protein</span>}
                          {parseInt(meal.carbs) > 0 && <span className="text-xs text-[#64748b]">{meal.carbs}g carbs</span>}
                          {parseInt(meal.fat) > 0 && <span className="text-xs text-[#64748b]">{meal.fat}g fat</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteMeal(meal.id)} className="text-gray-300 hover:text-red-400 p-1 transition-colors flex-shrink-0">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Log Another CTA at bottom */}
              <button onClick={() => { resetForm(); setTab('log'); }} className="w-full py-3 border-2 border-dashed border-[#d97706]/40 text-[#d97706] rounded-xl font-medium text-sm hover:border-[#d97706] hover:bg-[#d97706]/5 transition-all">
                + Log Another Meal
              </button>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
