import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Trash2 } from 'lucide-react';

const API_BASE = 'https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php';

export function CreateRecipePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Lunch');
  const [prepTime, setPrepTime] = useState('');
  const [servings, setServings] = useState('4');
  const [imageUrl, setImageUrl] = useState('');

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [instructions, setInstructions] = useState('');

  const addIngredient = () => setIngredients(prev => [...prev, '']);
  const updateIngredient = (i: number, val: string) => setIngredients(prev => prev.map((v, idx) => idx === i ? val : v));
  const removeIngredient = (i: number) => { if (ingredients.length > 1) setIngredients(prev => prev.filter((_, idx) => idx !== i)); };

  const handleCreate = async () => {
    setSaving(true);
    const recipe = {
      name, category, prepTime: prepTime || '15 min', servings: parseInt(servings) || 4,
      calories: parseInt(calories) || 0, protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0, fat: parseInt(fat) || 0,
      ingredients: ingredients.filter(Boolean), instructions, image: imageUrl,
    };
    try {
      await fetch(`${API_BASE}/recipes.php?action=create_recipe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(recipe),
      });
    } catch {}
    setSaving(false);
    setCreated(true);
  };

  const stepTitles = ['Details', 'Nutrition', 'Ingredients'];

  if (created) {
    return (
      <div className="min-h-screen bg-[#fdfcfb]">
        <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => navigate('/recipes')} className="text-white p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="size-5" /></button>
            <button onClick={() => navigate('/dashboard')} className="font-semibold text-lg"><span className="text-[#d97706]">Health</span><span className="text-white">Zone</span></button>
            <div className="w-10"></div>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center px-4 pt-20">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"><Check className="size-10 text-green-600" /></div>
          <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Recipe Created!</h2>
          <p className="text-[#64748b] mb-1">{name}</p>
          <p className="text-sm text-[#d97706] font-medium mb-8">{category} · {calories || 0} cal · {ingredients.filter(Boolean).length} ingredients</p>
          <div className="flex gap-3 w-full max-w-sm">
            <button onClick={() => navigate('/recipes')} className="flex-1 py-3 border-2 border-[#d97706] text-[#d97706] rounded-lg font-medium">View Recipes</button>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1e293b] mb-1">Create Recipe</h1>
        <p className="text-sm text-[#64748b] mb-5">Step {step} of 3 — {stepTitles[step - 1]}</p>

        {/* Step Indicator */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-[#d97706]' : 'bg-gray-200'}`}></div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Recipe Name <span className="text-red-400">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Avocado Toast with Eggs" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-2">Category <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'Breakfast', emoji: '🌅' },
                  { key: 'Lunch', emoji: '☀️' },
                  { key: 'Dinner', emoji: '🌙' },
                  { key: 'Snacks', emoji: '🍎' },
                ].map(c => (
                  <button key={c.key} onClick={() => setCategory(c.key)} className={`py-3 rounded-xl text-center transition-all ${category === c.key ? 'bg-[#d97706] text-white shadow-md' : 'bg-white text-[#64748b] border border-gray-200 hover:border-[#d97706]'}`}>
                    <div className="text-xl mb-1">{c.emoji}</div>
                    <div className="text-[11px] sm:text-xs font-medium">{c.key}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-1">Prep Time</label>
                <input type="text" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="15 min" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-1">Servings</label>
                <input type="number" value={servings} onChange={e => setServings(e.target.value)} placeholder="4" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Image URL <span className="text-[#64748b] text-xs font-normal">(optional)</span></label>
              <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
            </div>
            <button onClick={() => { if (name) setStep(2); }} disabled={!name} className={`w-full py-3.5 rounded-xl font-semibold text-sm text-white mt-2 ${!name ? 'bg-gray-300' : 'bg-[#d97706] hover:bg-[#b45309] shadow-md active:scale-[0.98]'}`}>Next: Nutrition →</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[#64748b]">Nutritional info per serving</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-1">Calories</label>
                <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="400" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-1">Protein (g)</label>
                <input type="number" value={protein} onChange={e => setProtein(e.target.value)} placeholder="30" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-1">Carbs (g)</label>
                <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="40" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1e293b] mb-1">Fat (g)</label>
                <input type="number" value={fat} onChange={e => setFat(e.target.value)} placeholder="15" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
              </div>
            </div>
            <button onClick={() => setStep(3)} className="w-full py-3.5 rounded-xl font-semibold text-sm text-white bg-[#d97706] hover:bg-[#b45309] shadow-md active:scale-[0.98]">Next: Ingredients →</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#1e293b]">Ingredients <span className="text-red-400">*</span></label>
                <button onClick={addIngredient} className="text-xs text-[#d97706] font-medium flex items-center gap-1"><Plus className="size-3.5" />Add</button>
              </div>
              <div className="space-y-2">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={ing} onChange={e => updateIngredient(i, e.target.value)} placeholder={`Ingredient ${i + 1}`} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
                    {ingredients.length > 1 && (
                      <button onClick={() => removeIngredient(i)} className="px-3 text-red-400 hover:text-red-600"><Trash2 className="size-4" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1e293b] mb-1">Instructions</label>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Describe how to prepare this recipe..." rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white resize-none" />
            </div>
            <button onClick={handleCreate} disabled={!ingredients.some(Boolean) || saving} className={`w-full py-3.5 rounded-xl font-semibold text-sm text-white ${!ingredients.some(Boolean) || saving ? 'bg-gray-300' : 'bg-[#d97706] hover:bg-[#b45309] shadow-md active:scale-[0.98]'}`}>
              {saving ? 'Creating...' : 'Create Recipe'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
