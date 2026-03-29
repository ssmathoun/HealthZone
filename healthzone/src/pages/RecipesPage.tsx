import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Plus, Search, Clock, Flame, ArrowLeft, X, Heart } from 'lucide-react';

const allRecipes = [
  { id: 1, name: 'High-Protein Buddha Bowl', calories: 480, protein: 42, carbs: 45, fat: 16, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1752028935881-0674807b046c?w=400&h=300&fit=crop', category: 'Lunch', ingredients: ['Quinoa', 'Chickpeas', 'Avocado', 'Mixed greens', 'Tahini dressing'] },
  { id: 2, name: 'Grilled Chicken & Veggies', calories: 420, protein: 52, carbs: 20, fat: 14, prepTime: '25 min', image: 'https://images.unsplash.com/photo-1606858274001-dd10efc5ce7d?w=400&h=300&fit=crop', category: 'Dinner', ingredients: ['Chicken breast', 'Bell peppers', 'Zucchini', 'Olive oil', 'Herbs'] },
  { id: 3, name: 'Protein Smoothie Bowl', calories: 350, protein: 28, carbs: 40, fat: 10, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop', category: 'Breakfast', ingredients: ['Protein powder', 'Frozen berries', 'Banana', 'Almond milk', 'Granola'] },
  { id: 4, name: 'Salmon & Quinoa', calories: 550, protein: 45, carbs: 35, fat: 22, prepTime: '30 min', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', category: 'Dinner', ingredients: ['Salmon fillet', 'Quinoa', 'Asparagus', 'Lemon', 'Dill'] },
  { id: 5, name: 'Overnight Oats', calories: 320, protein: 18, carbs: 48, fat: 8, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop', category: 'Breakfast', ingredients: ['Oats', 'Greek yogurt', 'Chia seeds', 'Honey', 'Mixed berries'] },
  { id: 6, name: 'Turkey Wrap', calories: 380, protein: 35, carbs: 30, fat: 12, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', category: 'Lunch', ingredients: ['Turkey slices', 'Whole wheat wrap', 'Lettuce', 'Tomato', 'Mustard'] },
];

export function RecipesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<number[]>([]);
  const [newRecipe, setNewRecipe] = useState({ name: '', category: 'Lunch', calories: '', protein: '', prepTime: '', ingredients: '' });
  const [userRecipes, setUserRecipes] = useState<any[]>([]);
  const [recipeCreated, setRecipeCreated] = useState(false);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'High-Protein'];
  const recipes = [...allRecipes, ...userRecipes];

  const filtered = recipes.filter(r => {
    const matchesFilter = activeFilter === 'All' || r.category === activeFilter || (activeFilter === 'High-Protein' && r.protein >= 35);
    const matchesSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateRecipe = () => {
    if (!newRecipe.name) return;
    setUserRecipes(prev => [...prev, {
      id: Date.now(), name: newRecipe.name, category: newRecipe.category,
      calories: parseInt(newRecipe.calories) || 0, protein: parseInt(newRecipe.protein) || 0,
      carbs: 0, fat: 0, prepTime: newRecipe.prepTime || '15 min',
      image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop',
      ingredients: newRecipe.ingredients.split(',').map((i: string) => i.trim()).filter(Boolean),
    }]);
    setRecipeCreated(true);
  };

  const resetCreate = () => { setShowCreateModal(false); setRecipeCreated(false); setNewRecipe({ name: '', category: 'Lunch', calories: '', protein: '', prepTime: '', ingredients: '' }); };

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <nav className="bg-[#1e293b] sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate('/dashboard')} className="text-white p-2 hover:bg-white/10 rounded-full"><ArrowLeft className="size-5" /></button>
          <button onClick={() => navigate('/dashboard')} className="font-semibold text-lg hover:opacity-80 transition-opacity"><span className="text-[#d97706]">Health</span><span className="text-white">Zone</span></button>
          <div className="w-10"></div>
        </div>
      </nav>
      <main className="px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div><h1 className="text-3xl font-bold text-[#1e293b] mb-2">Recipes</h1><p className="text-[#64748b]">Healthy meal ideas for your goals</p></div>
            <button onClick={() => setShowCreateModal(true)} className="bg-[#d97706] text-white px-4 py-2 rounded-lg hover:bg-[#b45309] flex items-center gap-2 self-start md:self-auto"><Plus className="size-5" />Create Recipe</button>
          </div>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-[#64748b]" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search recipes..." className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d97706]" />
          </div>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveFilter(cat)} className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${activeFilter === cat ? 'bg-[#d97706] text-white' : 'bg-white text-[#64748b] border border-gray-300 hover:border-[#d97706]'}`}>{cat}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12"><UtensilsCrossed className="size-12 text-[#d97706]/30 mx-auto mb-3" /><p className="text-[#1e293b] font-medium">No recipes found</p><p className="text-sm text-[#64748b]">Try a different filter or search term</p></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((recipe) => (
                <div key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative">
                    <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop'; }} />
                    <button onClick={(e) => { e.stopPropagation(); setSavedRecipes(prev => prev.includes(recipe.id) ? prev.filter(id => id !== recipe.id) : [...prev, recipe.id]); }} className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow">
                      <Heart className={`size-4 ${savedRecipes.includes(recipe.id) ? 'fill-[#d97706] text-[#d97706]' : 'text-[#64748b]'}`} />
                    </button>
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-[#d97706] bg-[#d97706]/10 px-2 py-1 rounded">{recipe.category}</span>
                    <h3 className="font-semibold text-[#1e293b] text-lg mt-2 mb-3">{recipe.name}</h3>
                    <div className="flex items-center justify-between text-sm text-[#64748b]">
                      <span className="flex items-center gap-1"><Flame className="size-4 text-[#d97706]" />{recipe.calories} cal</span>
                      <span className="flex items-center gap-1"><Clock className="size-4 text-[#d97706]" />{recipe.prepTime}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100"><p className="text-sm text-[#1e293b]"><span className="font-semibold">{recipe.protein}g</span> protein</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecipe(null)}>
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <img src={selectedRecipe.image} alt={selectedRecipe.name} className="w-full h-48 object-cover rounded-t-lg" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#d97706] bg-[#d97706]/10 px-2 py-1 rounded">{selectedRecipe.category}</span>
                <button onClick={() => setSelectedRecipe(null)} className="text-[#64748b] hover:text-[#1e293b]"><X className="size-5" /></button>
              </div>
              <h2 className="text-xl font-bold text-[#1e293b] mb-4">{selectedRecipe.name}</h2>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-[#fdfcfb] rounded-lg border border-gray-200"><div className="text-sm font-bold text-[#d97706]">{selectedRecipe.calories}</div><div className="text-xs text-[#64748b]">cal</div></div>
                <div className="text-center p-2 bg-[#fdfcfb] rounded-lg border border-gray-200"><div className="text-sm font-bold text-[#d97706]">{selectedRecipe.protein}g</div><div className="text-xs text-[#64748b]">protein</div></div>
                <div className="text-center p-2 bg-[#fdfcfb] rounded-lg border border-gray-200"><div className="text-sm font-bold text-[#d97706]">{selectedRecipe.carbs}g</div><div className="text-xs text-[#64748b]">carbs</div></div>
                <div className="text-center p-2 bg-[#fdfcfb] rounded-lg border border-gray-200"><div className="text-sm font-bold text-[#d97706]">{selectedRecipe.fat}g</div><div className="text-xs text-[#64748b]">fat</div></div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#64748b] mb-4"><Clock className="size-4" />{selectedRecipe.prepTime}</div>
              {selectedRecipe.ingredients && (<div><h3 className="font-semibold text-[#1e293b] text-sm mb-2">Ingredients</h3><ul className="space-y-1">{selectedRecipe.ingredients.map((ing: string, i: number) => (<li key={i} className="text-sm text-[#64748b] flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#d97706] rounded-full flex-shrink-0"></span>{ing}</li>))}</ul></div>)}
            </div>
          </div>
        </div>
      )}

      {/* Create Recipe Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={resetCreate}>
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1e293b]">Create Recipe</h2>
              <button onClick={resetCreate} className="text-[#64748b] hover:text-[#1e293b]"><X className="size-5" /></button>
            </div>
            {recipeCreated ? (
              <div className="text-center py-8"><div className="text-5xl mb-4">👨‍🍳</div><h3 className="text-xl font-bold text-[#1e293b] mb-2">Recipe Created!</h3><p className="text-[#64748b] mb-6">{newRecipe.name} has been added</p><button onClick={resetCreate} className="w-full bg-[#d97706] text-white py-3 rounded-lg hover:bg-[#b45309] font-medium">Done</button></div>
            ) : (
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-[#1e293b] mb-1">Recipe Name *</label><input type="text" value={newRecipe.name} onChange={e => setNewRecipe({...newRecipe, name: e.target.value})} placeholder="e.g., Avocado Toast" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]" /></div>
                <div><label className="block text-sm font-medium text-[#1e293b] mb-1">Category</label><div className="flex gap-2 flex-wrap">{['Breakfast','Lunch','Dinner','Snacks'].map(c => (<button key={c} onClick={() => setNewRecipe({...newRecipe, category: c})} className={`px-3 py-1.5 rounded-full text-xs font-medium ${newRecipe.category === c ? 'bg-[#d97706] text-white' : 'bg-gray-100 text-[#64748b]'}`}>{c}</button>))}</div></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-sm font-medium text-[#1e293b] mb-1">Calories</label><input type="number" value={newRecipe.calories} onChange={e => setNewRecipe({...newRecipe, calories: e.target.value})} placeholder="400" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]" /></div>
                  <div><label className="block text-sm font-medium text-[#1e293b] mb-1">Protein (g)</label><input type="number" value={newRecipe.protein} onChange={e => setNewRecipe({...newRecipe, protein: e.target.value})} placeholder="30" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]" /></div>
                  <div><label className="block text-sm font-medium text-[#1e293b] mb-1">Prep Time</label><input type="text" value={newRecipe.prepTime} onChange={e => setNewRecipe({...newRecipe, prepTime: e.target.value})} placeholder="15 min" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706]" /></div>
                </div>
                <div><label className="block text-sm font-medium text-[#1e293b] mb-1">Ingredients (comma-separated)</label><textarea value={newRecipe.ingredients} onChange={e => setNewRecipe({...newRecipe, ingredients: e.target.value})} placeholder="Avocado, Bread, Eggs, Salt, Pepper" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] resize-none" rows={3} /></div>
                <div className="flex gap-3 pt-2">
                  <button onClick={resetCreate} className="flex-1 px-4 py-2.5 border-2 border-[#64748b] text-[#64748b] rounded-lg font-medium text-sm">Cancel</button>
                  <button onClick={handleCreateRecipe} disabled={!newRecipe.name} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm text-white ${!newRecipe.name ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#d97706] hover:bg-[#b45309]'}`}>Create</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
