
import React, { useState, useMemo } from 'react';
import { ChefHat, Plus, Trash2, Download, Calculator, Search, Layers, TrendingUp, Tag, Beaker, AlertCircle } from 'lucide-react';
import { Item, MenuItem, Recipe, RecipeIngredient } from '../types';
import { exportToCSV } from '../utils/csvUtils';

interface RecipeMasterProps {
  items: Item[];
  menuItems: MenuItem[];
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
}

const RecipeMaster: React.FC<RecipeMasterProps> = ({ items, menuItems, recipes, setRecipes }) => {
  const [activeTab, setActiveTab] = useState<'main' | 'base'>('main');
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(m => activeTab === 'main' ? !m.isBaseRecipe : m.isBaseRecipe);
  }, [menuItems, activeTab]);

  const selectedMenuItem = useMemo(() => {
    return menuItems.find(m => m.id === selectedMenuId);
  }, [menuItems, selectedMenuId]);

  const currentRecipe = useMemo(() => {
    return recipes.find(r => r.menuItemId === selectedMenuId) || { menuItemId: selectedMenuId, ingredients: [] };
  }, [recipes, selectedMenuId]);

  /**
   * Deep Cost Calculator
   * Handles Item yield and Recursive Base Recipe yield
   */
  const calculateIngredientCost = (ingredient: RecipeIngredient): number => {
    if (ingredient.type === 'item') {
      const item = items.find(i => i.id === ingredient.id);
      if (!item) return 0;
      
      // 1. Get base cost per unit (e.g. price per 1 KG)
      const purchaseUnitCost = item.pricePerPackage / (item.packagingSize * item.netContent);
      
      // 2. Adjust for Item Yield (Wastage during prep)
      // If 1kg onion costs $10 and yield is 80%, effective cost is $12.5 per usable kg
      const yieldFactor = (item.yieldPercent || 100) / 100;
      const effectiveUnitCost = purchaseUnitCost / yieldFactor;
      
      return effectiveUnitCost * ingredient.quantity;
    } else {
      // It's a base recipe used as an ingredient
      const baseRecipe = recipes.find(r => r.menuItemId === ingredient.id);
      const baseMenuDetails = menuItems.find(m => m.id === ingredient.id);
      if (!baseRecipe || !baseMenuDetails) return 0;

      // Sum costs of base recipe components
      const rawBaseCost = baseRecipe.ingredients.reduce((acc, curr) => acc + calculateIngredientCost(curr), 0);
      
      // Adjust for Base Recipe Yield (Cooking loss/Reduction)
      const recipeYieldFactor = (baseMenuDetails.yieldPercent || 100) / 100;
      const costPerOutputUnit = rawBaseCost / recipeYieldFactor;
      
      return costPerOutputUnit * ingredient.quantity;
    }
  };

  const totalRecipeCost = useMemo(() => {
    return currentRecipe.ingredients.reduce((acc, curr) => acc + calculateIngredientCost(curr), 0);
  }, [currentRecipe.ingredients, items, recipes, menuItems]);

  const foodCostPercentage = useMemo(() => {
    if (!selectedMenuItem || selectedMenuItem.sellingPrice <= 0) return 0;
    // Main dish might also have a yield factor (e.g. portioning loss)
    const yieldAdjustedCost = totalRecipeCost / ((selectedMenuItem.yieldPercent || 100) / 100);
    return (yieldAdjustedCost / selectedMenuItem.sellingPrice) * 100;
  }, [totalRecipeCost, selectedMenuItem]);

  const handleAddIngredient = (id: string, type: 'item' | 'base_recipe') => {
    if (!selectedMenuId || id === selectedMenuId) return;
    const existingRecipe = recipes.find(r => r.menuItemId === selectedMenuId);
    const newIng: RecipeIngredient = { id, type, quantity: 1 };

    if (existingRecipe) {
      const updated = [...existingRecipe.ingredients, newIng];
      setRecipes(recipes.map(r => r.menuItemId === selectedMenuId ? { ...r, ingredients: updated } : r));
    } else {
      setRecipes([...recipes, { menuItemId: selectedMenuId, ingredients: [newIng] }]);
    }
  };

  const updateQuantity = (idx: number, val: number) => {
    const updated = currentRecipe.ingredients.map((ing, i) => i === idx ? { ...ing, quantity: val } : ing);
    setRecipes(recipes.map(r => r.menuItemId === selectedMenuId ? { ...r, ingredients: updated } : r));
  };

  const removeIngredient = (idx: number) => {
    const updated = currentRecipe.ingredients.filter((_, i) => i !== idx);
    setRecipes(recipes.map(r => r.menuItemId === selectedMenuId ? { ...r, ingredients: updated } : r));
  };

  const exportRecipeSheet = () => {
    if (!selectedMenuItem) return;
    const data = currentRecipe.ingredients.map(ing => {
      const name = ing.type === 'item' ? items.find(i => i.id === ing.id)?.itemName : menuItems.find(m => m.id === ing.id)?.menuName;
      return {
        'Component': name || 'Deleted',
        'Type': ing.type === 'item' ? 'Material' : 'Base Prep',
        'Quantity': ing.quantity,
        'Unit Cost': (calculateIngredientCost(ing) / ing.quantity).toFixed(2),
        'Total Line Cost': calculateIngredientCost(ing).toFixed(2)
      };
    });
    exportToCSV(data, `RECIPE_${selectedMenuItem.menuCode}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">Recipe Manager</h1>
          <p className="text-sky-600">Engineered costing with multi-tier yield support</p>
        </div>
        <div className="bg-sky-100/50 p-1.5 rounded-2xl flex gap-1 shadow-inner border border-sky-100">
          <button 
            onClick={() => { setActiveTab('main'); setSelectedMenuId(''); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'main' ? 'bg-sky-600 text-white shadow-lg' : 'text-sky-600 hover:bg-sky-200'}`}
          >
            <Tag size={18} /> Main Dishes
          </button>
          <button 
            onClick={() => { setActiveTab('base'); setSelectedMenuId(''); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'base' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-600 hover:bg-indigo-200'}`}
          >
            <Beaker size={18} /> Base Recipes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Selection & Analysis Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-sky-100">
            <label className="block text-[10px] font-black text-sky-400 uppercase mb-3 tracking-widest">
              Select Target Item
            </label>
            <select
              className="w-full p-4 border-2 border-sky-50 rounded-2xl focus:border-sky-500 outline-none bg-sky-50/20 font-bold text-sky-900 cursor-pointer"
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
            >
              <option value="">-- Choose {activeTab === 'main' ? 'Menu Dish' : 'Base Prep'} --</option>
              {filteredMenuItems.map(m => (
                <option key={m.id} value={m.id}>{m.menuName}</option>
              ))}
            </select>
          </div>

          {selectedMenuItem && (
            <div className={`rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden ${activeTab === 'main' ? 'bg-gradient-to-br from-sky-600 to-sky-700' : 'bg-gradient-to-br from-indigo-600 to-indigo-700'}`}>
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Cost Analysis</h3>
                  <TrendingUp size={24} className="opacity-40" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                    <p className="text-[10px] opacity-70 uppercase font-bold mb-1">Total Raw Cost</p>
                    <p className="text-2xl font-black">₹{totalRecipeCost.toFixed(2)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl">
                    <p className="text-[10px] opacity-70 uppercase font-bold mb-1">Yield Factor</p>
                    <p className="text-2xl font-black">{selectedMenuItem.yieldPercent}%</p>
                  </div>
                </div>

                {activeTab === 'main' ? (
                  <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] opacity-70 uppercase font-bold">Selling Price</p>
                      <p className="text-3xl font-black">₹{selectedMenuItem.sellingPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-70 uppercase font-bold">Food Cost %</p>
                      <p className={`text-4xl font-black ${foodCostPercentage > 35 ? 'text-red-300' : 'text-emerald-300'}`}>
                        {foodCostPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-[10px] opacity-70 uppercase font-bold">Cost per Prepared Unit</p>
                    <p className="text-3xl font-black">₹{(totalRecipeCost / (selectedMenuItem.yieldPercent / 100)).toFixed(2)}</p>
                  </div>
                )}
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
                <Calculator size={160} />
              </div>
            </div>
          )}

          {/* Ingredient Picker */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-sky-100 flex flex-col h-[450px]">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-300" size={18} />
              <input
                type="text"
                placeholder="Find components..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-sky-50 focus:border-sky-200 outline-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {menuItems.some(m => m.isBaseRecipe && m.id !== selectedMenuId) && (
                <div>
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-3 px-2 flex items-center gap-2">
                    <Layers size={14} /> Available Base Preps
                  </h4>
                  <div className="space-y-2">
                    {menuItems.filter(m => m.isBaseRecipe && m.id !== selectedMenuId && m.menuName.toLowerCase().includes(searchTerm.toLowerCase())).map(br => (
                      <button 
                        key={br.id} 
                        onClick={() => handleAddIngredient(br.id, 'base_recipe')} 
                        className="w-full flex items-center justify-between p-3.5 border border-indigo-50 rounded-2xl hover:bg-indigo-50 transition-colors group text-left"
                      >
                        <span className="text-sm font-bold text-indigo-900">{br.menuName}</span>
                        <Plus size={16} className="text-indigo-300 group-hover:text-indigo-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[10px] font-black text-sky-400 uppercase mb-3 px-2 flex items-center gap-2">
                  <Tag size={14} /> Inventory Materials
                </h4>
                <div className="space-y-2">
                  {items.filter(i => i.itemName.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => handleAddIngredient(item.id, 'item')} 
                      className="w-full flex items-center justify-between p-3.5 border border-sky-50 rounded-2xl hover:bg-sky-50 transition-colors group text-left"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-sky-900">{item.itemName}</span>
                        <span className="text-[10px] text-sky-400 font-mono">Yield: {item.yieldPercent}%</span>
                      </div>
                      <Plus size={16} className="text-sky-300 group-hover:text-sky-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Builder Canvas */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-sky-100 overflow-hidden flex flex-col h-full min-h-[700px]">
            <div className="p-10 border-b border-sky-50 flex justify-between items-center bg-sky-50/20">
              <div>
                <h2 className="text-3xl font-black text-sky-900">
                  {selectedMenuItem ? selectedMenuItem.menuName : 'Select a Target'}
                </h2>
                {selectedMenuItem && (
                  <div className="flex items-center gap-4 mt-2">
                    <span className="bg-sky-100 text-sky-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                      Dept: {selectedMenuItem.department}
                    </span>
                    <span className="text-sky-400 text-xs font-bold">
                      Portion: {selectedMenuItem.portionSize}
                    </span>
                  </div>
                )}
              </div>
              {selectedMenuItem && (
                <button 
                  onClick={exportRecipeSheet}
                  className="flex items-center gap-2 bg-sky-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-sky-800 transition-transform active:scale-95 shadow-xl shadow-sky-100"
                >
                  <Download size={20} /> Export Sheet
                </button>
              )}
            </div>

            <div className="flex-1 p-10 overflow-y-auto">
              {selectedMenuItem ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-sky-400 border-b border-sky-100">
                      <th className="pb-6 font-black w-32">Type</th>
                      <th className="pb-6 font-black">Component Name</th>
                      <th className="pb-6 font-black w-40">Quantity Input</th>
                      <th className="pb-6 font-black text-right">Adjusted Cost</th>
                      <th className="pb-6 font-black text-right w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50">
                    {currentRecipe.ingredients.map((ing, idx) => {
                      const cost = calculateIngredientCost(ing);
                      const name = ing.type === 'item' 
                        ? items.find(i => i.id === ing.id)?.itemName 
                        : menuItems.find(m => m.id === ing.id)?.menuName;
                      const uom = ing.type === 'item' ? items.find(i => i.id === ing.id)?.uom : 'Portion';
                      
                      return (
                        <tr key={idx} className="group hover:bg-sky-50/40 transition-colors">
                          <td className="py-7">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${ing.type === 'item' ? 'bg-sky-100 text-sky-600' : 'bg-indigo-100 text-indigo-600'}`}>
                              {ing.type === 'item' ? 'Material' : 'Prep'}
                            </span>
                          </td>
                          <td className="py-7 font-bold text-sky-900 text-lg">{name || '---'}</td>
                          <td className="py-7">
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                step="0.001"
                                className="w-28 p-2.5 border-2 border-sky-50 rounded-2xl focus:border-sky-500 outline-none text-base font-black text-sky-900 bg-sky-50/30"
                                value={ing.quantity}
                                onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                              />
                              <span className="text-[10px] font-black text-sky-300 uppercase">{uom}</span>
                            </div>
                          </td>
                          <td className="py-7 text-right font-black text-sky-900 text-lg">₹{cost.toFixed(2)}</td>
                          <td className="py-7 text-right">
                            <button 
                              onClick={() => removeIngredient(idx)} 
                              className="p-3 text-sky-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {currentRecipe.ingredients.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-40 text-center text-sky-200 flex flex-col items-center">
                          <AlertCircle size={64} className="mb-6 opacity-20" />
                          <p className="text-xl font-bold">Recipe is empty</p>
                          <p className="text-sm font-medium mt-1">Start adding components from the side panel</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {currentRecipe.ingredients.length > 0 && (
                    <tfoot>
                      <tr className="border-t-4 border-sky-100">
                        <td colSpan={3} className="pt-10 text-right font-black text-sky-400 uppercase tracking-widest">Recipe Base Total:</td>
                        <td className="pt-10 text-right font-black text-sky-900 text-3xl">₹{totalRecipeCost.toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center text-sky-200">
                  <ChefHat size={160} className="mb-8 opacity-5" />
                  <h3 className="text-2xl font-black text-sky-900/10">Engineering Canvas</h3>
                  <p className="text-lg font-medium max-w-sm mt-2">Select a menu item or base prep to define its composition and analyze food costs.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeMaster;
