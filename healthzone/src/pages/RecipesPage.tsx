import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Plus, Search, Clock, Flame, ArrowLeft, X, Heart } from 'lucide-react';

const API_BASE = 'https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php';

const defaultRecipes = [
  { id: 1, name: 'High-Protein Buddha Bowl', calories: 480, protein: 42, carbs: 45, fat: 16, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1752028935881-0674807b046c?w=400&h=300&fit=crop', category: 'Lunch', ingredients: ['Quinoa', 'Chickpeas', 'Avocado', 'Mixed greens', 'Tahini dressing'], instructions: 'Cook quinoa. Toss chickpeas with spices and roast. Assemble bowl with greens, quinoa, chickpeas, avocado. Drizzle with tahini.' },
  { id: 2, name: 'Grilled Chicken & Veggies', calories: 420, protein: 52, carbs: 20, fat: 14, prepTime: '25 min', image: 'https://images.unsplash.com/photo-1606858274001-dd10efc5ce7d?w=400&h=300&fit=crop', category: 'Dinner', ingredients: ['Chicken breast', 'Bell peppers', 'Zucchini', 'Olive oil', 'Herbs'], instructions: 'Season chicken with herbs. Grill chicken 6-7 min per side. Toss veggies in olive oil and grill alongside. Serve together.' },
  { id: 3, name: 'Protein Smoothie Bowl', calories: 350, protein: 28, carbs: 40, fat: 10, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop', category: 'Breakfast', ingredients: ['Protein powder', 'Frozen berries', 'Banana', 'Almond milk', 'Granola'], instructions: 'Blend protein powder, frozen berries, banana and almond milk until thick. Pour into bowl. Top with granola and fresh fruit.' },
  { id: 4, name: 'Salmon & Quinoa', calories: 550, protein: 45, carbs: 35, fat: 22, prepTime: '30 min', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', category: 'Dinner', ingredients: ['Salmon fillet', 'Quinoa', 'Asparagus', 'Lemon', 'Dill'], instructions: 'Cook quinoa. Season salmon with lemon and dill. Bake at 400°F for 12-15 min. Steam asparagus. Plate together.' },
  { id: 5, name: 'Overnight Oats', calories: 320, protein: 18, carbs: 48, fat: 8, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop', category: 'Breakfast', ingredients: ['Oats', 'Greek yogurt', 'Chia seeds', 'Honey', 'Mixed berries'], instructions: 'Mix oats, yogurt, chia seeds and honey in a jar. Refrigerate overnight. Top with berries before serving.' },
  { id: 6, name: 'Turkey Wrap', calories: 380, protein: 35, carbs: 30, fat: 12, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', category: 'Lunch', ingredients: ['Turkey slices', 'Whole wheat wrap', 'Lettuce', 'Tomato', 'Mustard'], instructions: 'Lay out wrap. Layer turkey, lettuce, tomato. Add mustard. Roll tightly and slice in half.' },
];

export function RecipesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [recipes, setRecipes] = useState<any[]>(defaultRecipes);

  // Fetch recipes from backend
  useEffect(() => {
    fetch(`${API_BASE}/recipes.php?action=get_recipes`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setRecipes([...defaultRecipes, ...data]); })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'High-Protein'];

  const filtered = recipes.filter(r => {
    const matchesFilter = activeFilter === 'All' || r.category === activeFilter || (activeFilter === 'High-Protein' && r.protein >= 35);
    const matchesSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || (r.ingredients && r.ingredients.some((i: string) => i.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesFilter && matchesSearch;
  });


  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/dashboard')} className="text-white p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="size-5" /></button>
          <button onClick={() => navigate('/dashboard')} className="font-semibold text-lg hover:opacity-80 transition-opacity"><span className="text-[#d97706]">Health</span><span className="text-white">Zone</span></button>
          <div className="w-10"></div>
        </div>
      </nav>

      <main className="px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1e293b]">Recipes</h1>
              <p className="text-[#64748b] text-sm">Healthy meal ideas for your goals</p>
            </div>
            <button onClick={() => navigate('/create-recipe')} className="bg-[#d97706] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#b45309] flex items-center gap-1.5 text-sm font-medium flex-shrink-0">
              <Plus className="size-4" /><span className="hidden sm:inline">Create</span> Recipe
            </button>
          </div>

          {/* Search */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-[#64748b]" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search recipes or ingredients..." className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]" />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap text-xs sm:text-sm transition-colors ${activeFilter === cat ? 'bg-[#d97706] text-white' : 'bg-white text-[#64748b] border border-gray-300 hover:border-[#d97706]'}`}>{cat}</button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-12"><UtensilsCrossed className="size-12 text-[#d97706]/30 mx-auto mb-3" /><p className="text-[#1e293b] font-medium">No recipes found</p><p className="text-sm text-[#64748b]">Try a different filter or search term</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filtered.map((recipe) => (
                <div key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    <img src={recipe.image} alt={recipe.name} className="w-full h-28 sm:h-48 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop'; }} />
                    <button onClick={(e) => { e.stopPropagation(); setSavedRecipes(prev => prev.includes(recipe.id) ? prev.filter(id => id !== recipe.id) : [...prev, recipe.id]); }} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow">
                      <Heart className={`size-3.5 sm:size-4 ${savedRecipes.includes(recipe.id) ? 'fill-[#d97706] text-[#d97706]' : 'text-[#64748b]'}`} />
                    </button>
                  </div>
                  <div className="p-2.5 sm:p-4">
                    <span className="text-[10px] sm:text-xs font-medium text-[#d97706] bg-[#d97706]/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">{recipe.category}</span>
                    <h3 className="font-semibold text-[#1e293b] text-sm sm:text-lg mt-1.5 sm:mt-2 mb-2 sm:mb-3 line-clamp-2">{recipe.name}</h3>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-[#64748b]">
                      <span className="flex items-center gap-0.5 sm:gap-1"><Flame className="size-3 sm:size-4 text-[#d97706]" />{recipe.calories}</span>
                      <span className="flex items-center gap-0.5 sm:gap-1"><Clock className="size-3 sm:size-4 text-[#d97706]" />{recipe.prepTime}</span>
                    </div>
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100"><p className="text-xs sm:text-sm text-[#1e293b]"><span className="font-semibold">{recipe.protein}g</span> protein</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedRecipe(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <img src={selectedRecipe.image} alt={selectedRecipe.name} className="w-full h-40 sm:h-48 object-cover sm:rounded-t-lg" />
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#d97706] bg-[#d97706]/10 px-2 py-1 rounded">{selectedRecipe.category}</span>
                <button onClick={() => setSelectedRecipe(null)} className="text-[#64748b] hover:text-[#1e293b]"><X className="size-5" /></button>
              </div>
              <h2 className="text-xl font-bold text-[#1e293b] mb-4">{selectedRecipe.name}</h2>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { val: selectedRecipe.calories, label: 'cal' },
                  { val: `${selectedRecipe.protein}g`, label: 'protein' },
                  { val: `${selectedRecipe.carbs}g`, label: 'carbs' },
                  { val: `${selectedRecipe.fat}g`, label: 'fat' },
                ].map(m => (
                  <div key={m.label} className="text-center p-2 bg-[#fdfcfb] rounded-lg border border-gray-200"><div className="text-sm font-bold text-[#d97706]">{m.val}</div><div className="text-[10px] sm:text-xs text-[#64748b]">{m.label}</div></div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#64748b] mb-4"><Clock className="size-4" />{selectedRecipe.prepTime}</div>
              {selectedRecipe.ingredients && (
                <div className="mb-4">
                  <h3 className="font-semibold text-[#1e293b] text-sm mb-2">Ingredients</h3>
                  <ul className="space-y-1">{selectedRecipe.ingredients.map((ing: string, i: number) => (
                    <li key={i} className="text-sm text-[#64748b] flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#d97706] rounded-full flex-shrink-0"></span>{ing}</li>
                  ))}</ul>
                </div>
              )}
              {selectedRecipe.instructions && (
                <div>
                  <h3 className="font-semibold text-[#1e293b] text-sm mb-2">Instructions</h3>
                  <p className="text-sm text-[#64748b] leading-relaxed">{selectedRecipe.instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
