import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Plus, Search, Clock, Flame, ArrowLeft, X, Heart, Copy, Share2, Trash2 } from 'lucide-react';

const API_BASE = 'https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php';
const DEFAULT_RECIPE_IMAGE = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop';

type Recipe = {
  id: number;
  recipeKey: string;
  isUserRecipe: boolean;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  image: string;
  category: string;
  ingredients: string[];
  instructions?: string;
};

const allRecipes: Recipe[] = [
  { id: 1, recipeKey: 'preset-1', isUserRecipe: false, name: 'High-Protein Buddha Bowl', calories: 480, protein: 42, carbs: 45, fat: 16, prepTime: '15 min', image: 'https://images.unsplash.com/photo-1752028935881-0674807b046c?w=400&h=300&fit=crop', category: 'Lunch', ingredients: ['Quinoa', 'Chickpeas', 'Avocado', 'Mixed greens', 'Tahini dressing'] },
  { id: 2, recipeKey: 'preset-2', isUserRecipe: false, name: 'Grilled Chicken & Veggies', calories: 420, protein: 52, carbs: 20, fat: 14, prepTime: '25 min', image: 'https://images.unsplash.com/photo-1606858274001-dd10efc5ce7d?w=400&h=300&fit=crop', category: 'Dinner', ingredients: ['Chicken breast', 'Bell peppers', 'Zucchini', 'Olive oil', 'Herbs'] },
  { id: 3, recipeKey: 'preset-3', isUserRecipe: false, name: 'Protein Smoothie Bowl', calories: 350, protein: 28, carbs: 40, fat: 10, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop', category: 'Breakfast', ingredients: ['Protein powder', 'Frozen berries', 'Banana', 'Almond milk', 'Granola'] },
  { id: 4, recipeKey: 'preset-4', isUserRecipe: false, name: 'Salmon & Quinoa', calories: 550, protein: 45, carbs: 35, fat: 22, prepTime: '30 min', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop', category: 'Dinner', ingredients: ['Salmon fillet', 'Quinoa', 'Asparagus', 'Lemon', 'Dill'] },
  { id: 5, recipeKey: 'preset-5', isUserRecipe: false, name: 'Overnight Oats', calories: 320, protein: 18, carbs: 48, fat: 8, prepTime: '5 min', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop', category: 'Breakfast', ingredients: ['Oats', 'Greek yogurt', 'Chia seeds', 'Honey', 'Mixed berries'] },
  { id: 6, recipeKey: 'preset-6', isUserRecipe: false, name: 'Turkey Wrap', calories: 380, protein: 35, carbs: 30, fat: 12, prepTime: '10 min', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', category: 'Lunch', ingredients: ['Turkey slices', 'Whole wheat wrap', 'Lettuce', 'Tomato', 'Mustard'] },
];

function normalizeUserRecipe(recipe: any): Recipe {
  const recipeId = Number(recipe.id) || Date.now();
  const rawIngredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : typeof recipe.ingredients === 'string'
      ? recipe.ingredients.split(',')
      : [];

  return {
    id: recipeId,
    recipeKey: `user-${recipeId}`,
    isUserRecipe: true,
    name: recipe.name || 'Untitled Recipe',
    category: recipe.category || 'Lunch',
    calories: Number(recipe.calories) || 0,
    protein: Number(recipe.protein) || 0,
    carbs: Number(recipe.carbs) || 0,
    fat: Number(recipe.fat) || 0,
    prepTime: recipe.prepTime || recipe.prep_time || '15 min',
    image: recipe.image || DEFAULT_RECIPE_IMAGE,
    ingredients: rawIngredients.map((ingredient: string) => ingredient.trim()).filter(Boolean),
    instructions: recipe.instructions || '',
  };
}

export function RecipesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [newRecipe, setNewRecipe] = useState({ name: '', category: 'Lunch', calories: '', protein: '', prepTime: '', ingredients: '' });
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [recipeCreated, setRecipeCreated] = useState(false);
  const [sharingRecipeKey, setSharingRecipeKey] = useState<string | null>(null);
  const [deletingRecipeId, setDeletingRecipeId] = useState<number | null>(null);
  const [shareNotice, setShareNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'High-Protein'];
  const recipes = [...userRecipes, ...allRecipes];

  useEffect(() => {
    fetch(`${API_BASE}/recipes.php?action=get_recipes`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUserRecipes(data.map((recipe: any) => normalizeUserRecipe(recipe)));
        }
      })
      .catch(() => console.error('Could not fetch user recipes'));
  }, []);

  const filtered = recipes.filter(recipe => {
    const matchesFilter = activeFilter === 'All' || recipe.category === activeFilter || (activeFilter === 'High-Protein' && recipe.protein >= 35);
    const matchesSearch = !searchQuery || recipe.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleSavedRecipe = (recipeKey: string) => {
    setSavedRecipes(prev => (
      prev.includes(recipeKey)
        ? prev.filter(savedKey => savedKey !== recipeKey)
        : [...prev, recipeKey]
    ));
  };

  const handleCreateRecipe = async () => {
    if (!newRecipe.name) return;

    const recipeData = {
      name: newRecipe.name,
      category: newRecipe.category,
      calories: parseInt(newRecipe.calories, 10) || 0,
      protein: parseInt(newRecipe.protein, 10) || 0,
      carbs: 0,
      fat: 0,
      prepTime: newRecipe.prepTime || '15 min',
      image: DEFAULT_RECIPE_IMAGE,
      ingredients: newRecipe.ingredients.split(',').map((ingredient: string) => ingredient.trim()).filter(Boolean),
    };

    let createdRecipe = normalizeUserRecipe({ ...recipeData, id: Date.now() });

    try {
      const res = await fetch(`${API_BASE}/recipes.php?action=create_recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(recipeData)
      });
      const data = await res.json();

      if (data.status === 'success' && data.id) {
        createdRecipe = normalizeUserRecipe({ ...recipeData, id: data.id });
      }
    } catch {
      console.error('Could not save recipe to backend');
    }

    setUserRecipes(prev => [createdRecipe, ...prev]);
    setRecipeCreated(true);
  };

  const handleShareRecipe = async (recipe: Recipe) => {
    if (!recipe.isUserRecipe) {
      setShareNotice({ type: 'error', message: 'Only recipes you created can be shared to the Community feed.' });
      return;
    }

    setSharingRecipeKey(recipe.recipeKey);
    setShareNotice(null);

    try {
      const res = await fetch(`${API_BASE}/recipes.php?action=share_recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipe_id: recipe.id }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        setShareNotice({ type: 'success', message: `${recipe.name} is now live on the Community feed.` });
      } else {
        setShareNotice({ type: 'error', message: data.message || 'Unable to share this recipe right now.' });
      }
    } catch {
      setShareNotice({ type: 'error', message: 'Network error while sharing this recipe.' });
    }

    setSharingRecipeKey(null);
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    if (!confirm('Are you sure you want to delete this recipe? This cannot be undone.')) return;
    setDeletingRecipeId(recipeId);
    try {
      const res = await fetch(`${API_BASE}/recipes.php?action=delete_recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipe_id: recipeId }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setUserRecipes(prev => prev.filter(r => Number(r.id) !== recipeId));
        if (selectedRecipe && Number(selectedRecipe.id) === recipeId) {
          setSelectedRecipe(null);
        }
      } else {
        alert(data.message || 'Failed to delete recipe');
      }
    } catch {
      alert('Network error deleting recipe');
    }
    setDeletingRecipeId(null);
  };

  const handleDuplicate = (recipe: Recipe) => {
    setNewRecipe({
      name: `${recipe.name} - Copy`,
      category: recipe.category || 'Lunch',
      calories: recipe.calories ? String(recipe.calories) : '',
      protein: recipe.protein ? String(recipe.protein) : '',
      prepTime: recipe.prepTime || '15 min',
      ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join(', ') : '',
    });

    setSelectedRecipe(null);
    setShowCreateModal(true);
    setRecipeCreated(false);
  };

  const resetCreate = () => {
    setShowCreateModal(false);
    setRecipeCreated(false);
    setNewRecipe({ name: '', category: 'Lunch', calories: '', protein: '', prepTime: '', ingredients: '' });
  };

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
            <div>
              <h1 className="text-3xl font-bold text-[#1e293b] mb-2">Recipes</h1>
              <p className="text-[#64748b]">Healthy meal ideas for your goals</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="bg-[#d97706] text-white px-4 py-2 rounded-lg hover:bg-[#b45309] flex items-center gap-2 self-start md:self-auto"><Plus className="size-5" />Create Recipe</button>
          </div>

          {shareNotice && (
            <div className={`mb-6 rounded-xl border px-4 py-3 ${shareNotice.type === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className={`font-semibold ${shareNotice.type === 'success' ? 'text-emerald-800' : 'text-red-700'}`}>
                    {shareNotice.type === 'success' ? 'Recipe shared to community' : 'Unable to share recipe'}
                  </p>
                  <p className={`text-sm ${shareNotice.type === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>{shareNotice.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  {shareNotice.type === 'success' && (
                    <button onClick={() => navigate('/community')} className="px-3 py-2 rounded-lg bg-[#d97706] text-white text-sm font-medium hover:bg-[#b45309]">
                      View Community
                    </button>
                  )}
                  <button onClick={() => setShareNotice(null)} className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-[#64748b] hover:bg-white">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

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
              {filtered.map((recipe) => {
                const isSaved = savedRecipes.includes(recipe.recipeKey);
                const isSharing = sharingRecipeKey === recipe.recipeKey;

                return (
                  <div key={recipe.recipeKey} onClick={() => setSelectedRecipe(recipe)} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_RECIPE_IMAGE; }} />
                      <button onClick={(e) => { e.stopPropagation(); toggleSavedRecipe(recipe.recipeKey); }} className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow">
                        <Heart className={`size-4 ${isSaved ? 'fill-[#d97706] text-[#d97706]' : 'text-[#64748b]'}`} />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-[#d97706] bg-[#d97706]/10 px-2 py-1 rounded">{recipe.category}</span>
                        {recipe.isUserRecipe && (
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748b]">My Recipe</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-[#1e293b] text-lg mt-2 mb-3">{recipe.name}</h3>
                      <div className="flex items-center justify-between text-sm text-[#64748b]">
                        <span className="flex items-center gap-1"><Flame className="size-4 text-[#d97706]" />{recipe.calories} cal</span>
                        <span className="flex items-center gap-1"><Clock className="size-4 text-[#d97706]" />{recipe.prepTime}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                        <p className="text-sm text-[#1e293b]"><span className="font-semibold">{recipe.protein}g</span> protein</p>
                        {recipe.isUserRecipe && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShareRecipe(recipe); }}
                            disabled={isSharing}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${isSharing ? 'bg-gray-200 text-[#64748b] cursor-not-allowed' : 'bg-[#1e293b] text-white hover:bg-[#334155]'}`}
                          >
                            <Share2 className="size-4" />
                            {isSharing ? 'Sharing...' : 'Share to Community'}
                          </button>
                        )}
                        {recipe.isUserRecipe && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteRecipe(Number(recipe.id)); }}
                            disabled={deletingRecipeId === Number(recipe.id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-60"
                          >
                            <Trash2 className="size-4" />
                            {deletingRecipeId === Number(recipe.id) ? 'Deleting...' : 'Delete Recipe'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecipe(null)}>
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <img src={selectedRecipe.image} alt={selectedRecipe.name} className="w-full h-48 object-cover rounded-t-lg" />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-[#d97706] bg-[#d97706]/10 px-3 py-1.5 rounded-md uppercase tracking-wider">{selectedRecipe.category}</span>
                <div className="flex items-center gap-2">
                  {selectedRecipe.isUserRecipe && (
                    <button
                      onClick={() => handleShareRecipe(selectedRecipe)}
                      disabled={sharingRecipeKey === selectedRecipe.recipeKey}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${sharingRecipeKey === selectedRecipe.recipeKey ? 'bg-gray-200 text-[#64748b] cursor-not-allowed' : 'text-white bg-[#1e293b] hover:bg-[#334155]'}`}
                    >
                      <Share2 className="size-4" />{sharingRecipeKey === selectedRecipe.recipeKey ? 'Sharing...' : 'Share to Community'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(selectedRecipe)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#d97706] bg-[#d97706]/10 px-3 py-1.5 rounded-lg hover:bg-[#d97706]/20 transition-colors"
                  >
                    <Copy className="size-4" /> Duplicate
                  </button>
                  <button onClick={() => setSelectedRecipe(null)} className="text-[#64748b] hover:text-[#1e293b] bg-gray-100 p-1.5 rounded-full"><X className="size-5" /></button>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#1e293b] mb-4">{selectedRecipe.name}</h2>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-[#fdfcfb] rounded-lg border border-gray-200"><div className="text-sm font-bold text-[#d97706]">{selectedRecipe.calories}</div><div className="text-[10px] sm:text-xs text-[#64748b]">cal</div></div>
                <div className="text-center p-2 bg-[#fdfcfb] rounded-lg border border-gray-200"><div className="text-sm font-bold text-[#d97706]">{selectedRecipe.protein}g</div><div className="text-[10px] sm:text-xs text-[#64748b]">protein</div></div>
                <div className="text-center p-2 bg-[#fdfcfb] rounded-lg border border-gray-200"><div className="text-sm font-bold text-[#d97706]">{selectedRecipe.carbs}g</div><div className="text-[10px] sm:text-xs text-[#64748b]">carbs</div></div>
                <div className="text-center p-2 bg-[#fdfcfb] rounded-lg border border-gray-200"><div className="text-sm font-bold text-[#d97706]">{selectedRecipe.fat}g</div><div className="text-[10px] sm:text-xs text-[#64748b]">fat</div></div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#64748b] mb-4 font-medium"><Clock className="size-4 text-[#d97706]" />{selectedRecipe.prepTime}</div>

              {selectedRecipe.ingredients.length > 0 && (
                <div>
                  <h3 className="font-bold text-[#1e293b] text-base mb-2">Ingredients</h3>
                  <ul className="space-y-1.5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <li key={`${selectedRecipe.recipeKey}-ingredient-${index}`} className="text-sm text-[#1e293b] font-medium flex items-center gap-3">
                        <span className="w-1.5 h-1.5 bg-[#d97706] rounded-full flex-shrink-0"></span>{ingredient}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={resetCreate}>
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1e293b]">Create Recipe</h2>
              <button onClick={resetCreate} className="text-[#64748b] hover:bg-gray-100 p-1.5 rounded-full transition-colors"><X className="size-5" /></button>
            </div>

            {recipeCreated ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">Cooked!</div>
                <h3 className="text-2xl font-bold text-[#1e293b] mb-2">Recipe Created!</h3>
                <p className="text-[#64748b] mb-6 font-medium">{newRecipe.name} has been added</p>
                <button onClick={resetCreate} className="w-full bg-[#d97706] text-white py-3.5 rounded-xl hover:bg-[#b45309] font-bold text-lg shadow-sm">Done</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#1e293b] mb-1.5">Recipe Name <span className="text-red-500">*</span></label>
                  <input type="text" value={newRecipe.name} onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })} placeholder="e.g., Avocado Toast" className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1e293b] mb-1.5">Category</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(category => (
                      <button key={category} onClick={() => setNewRecipe({ ...newRecipe, category })} className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${newRecipe.category === category ? 'bg-[#d97706] text-white shadow-sm' : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'}`}>{category}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-[#1e293b] mb-1.5">Calories</label>
                    <input type="number" value={newRecipe.calories} onChange={e => setNewRecipe({ ...newRecipe, calories: e.target.value })} placeholder="400" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1e293b] mb-1.5">Protein (g)</label>
                    <input type="number" value={newRecipe.protein} onChange={e => setNewRecipe({ ...newRecipe, protein: e.target.value })} placeholder="30" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1e293b] mb-1.5">Prep Time</label>
                    <input type="text" value={newRecipe.prepTime} onChange={e => setNewRecipe({ ...newRecipe, prepTime: e.target.value })} placeholder="15 min" className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1e293b] mb-1.5">Ingredients <span className="text-xs font-medium text-gray-400">(comma-separated)</span></label>
                  <textarea value={newRecipe.ingredients} onChange={e => setNewRecipe({ ...newRecipe, ingredients: e.target.value })} placeholder="Avocado, Bread, Eggs, Salt, Pepper" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent resize-none h-24" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={resetCreate} className="flex-1 px-4 py-3 border-2 border-[#64748b] text-[#64748b] rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                  <button onClick={handleCreateRecipe} disabled={!newRecipe.name} className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all ${!newRecipe.name ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#d97706] hover:bg-[#b45309] shadow-md'}`}>Create</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
