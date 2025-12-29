
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ItemMaster from './components/ItemMaster';
import MenuMaster from './components/MenuMaster';
import RecipeMaster from './components/RecipeMaster';
import ImageEditor from './components/ImageEditor';
import { Item, MenuItem, Recipe, Department, UOM } from './types';
import { TrendingUp, DollarSign, Package, ChefHat, Zap, Layers } from 'lucide-react';

const Dashboard: React.FC<{ items: Item[], menuItems: MenuItem[], onLoadDemo: () => void }> = ({ items, menuItems, onLoadDemo }) => {
  const sellingItems = menuItems.filter(m => !m.isBaseRecipe);
  const avgPrice = sellingItems.reduce((acc, c) => acc + (c.sellingPrice || 0), 0) / (sellingItems.length || 1);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-sky-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-sky-600 font-medium text-lg mt-1">Manage, Analyze, and Optimize your Culinary Enterprise</p>
        </div>
        <button 
          onClick={onLoadDemo}
          className="group relative flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Zap size={22} className="relative z-10" />
          <span className="relative z-10">Initialize Demo Engine</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard icon={<Package className="text-sky-600" />} title="Master Items" value={items.length.toString()} color="bg-sky-100" />
        <StatCard icon={<ChefHat className="text-indigo-600" />} title="Selling Dishes" value={sellingItems.length.toString()} color="bg-indigo-100" />
        <StatCard icon={<Layers className="text-emerald-600" />} title="Base Recipes" value={menuItems.filter(m => m.isBaseRecipe).length.toString()} color="bg-emerald-100" />
        <StatCard icon={<DollarSign className="text-amber-600" />} title="Avg Menu Ticket" value={`₹${avgPrice.toFixed(0)}`} color="bg-amber-100" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-sky-100 relative overflow-hidden">
          <h2 className="text-3xl font-black text-sky-900 mb-8">Operational Flow</h2>
          <div className="space-y-8 relative z-10">
            <FlowStep num="01" title="Procurement Master" desc="Input raw materials with their brand details and yield percentages." />
            <FlowStep num="02" title="Prep Engineering" desc="Build Base Recipes like stocks, doughs, and sauces that serve multiple dishes." />
            <FlowStep num="03" title="Profit Optimization" desc="Construct final menu items and monitor food cost % against target margins." />
          </div>
          <div className="absolute -right-20 -bottom-20 bg-sky-50 rounded-full w-80 h-80 -z-0" />
        </div>
        
        <div className="bg-sky-900 p-12 rounded-[3rem] text-white shadow-2xl shadow-sky-200 flex flex-col justify-center">
          <TrendingUp size={48} className="text-sky-400 mb-6" />
          <h2 className="text-3xl font-black mb-4">Real-time Intelligence</h2>
          <p className="text-sky-200 text-lg leading-relaxed mb-8 font-medium">
            Our recursive costing engine calculates deep recipe structures instantly. 
            Update one ingredient price in the Item Master, and every affected recipe 
            across your entire enterprise is updated immediately.
          </p>
          <div className="h-1 bg-sky-800 rounded-full overflow-hidden">
            <div className="h-full bg-sky-400 w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FlowStep: React.FC<{ num: string, title: string, desc: string }> = ({ num, title, desc }) => (
  <div className="flex gap-6 items-start">
    <span className="text-4xl font-black text-sky-100 select-none">{num}</span>
    <div>
      <h3 className="text-xl font-black text-sky-900">{title}</h3>
      <p className="text-sky-500 font-medium leading-snug mt-1">{desc}</p>
    </div>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, color: string }> = ({ icon, title, value, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-sky-50 flex items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    <div className={`p-5 rounded-[1.5rem] ${color} shadow-inner`}>{icon}</div>
    <div>
      <p className="text-[11px] font-black text-sky-300 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-3xl font-black text-sky-900">{value}</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>(() => JSON.parse(localStorage.getItem('majhi_items') || '[]'));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => JSON.parse(localStorage.getItem('majhi_menu') || '[]'));
  const [recipes, setRecipes] = useState<Recipe[]>(() => JSON.parse(localStorage.getItem('majhi_recipes') || '[]'));

  useEffect(() => { localStorage.setItem('majhi_items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('majhi_menu', JSON.stringify(menuItems)); }, [menuItems]);
  useEffect(() => { localStorage.setItem('majhi_recipes', JSON.stringify(recipes)); }, [recipes]);

  const loadDemo = () => {
    const dItems: Item[] = [
      { id: 'i1', itemCode: 'RAW001', itemName: 'Local Red Onion', brandName: 'Farmers Choice', packagingSize: 1, uom: UOM.KG, netContent: 25, pricePerPackage: 1500, yieldPercent: 85 },
      { id: 'i2', itemCode: 'RAW002', itemName: 'Fresh Tomato', brandName: 'Local Market', packagingSize: 1, uom: UOM.KG, netContent: 25, pricePerPackage: 1100, yieldPercent: 92 },
      { id: 'i3', itemCode: 'RAW003', itemName: 'Refined Oil', brandName: 'Fortune', packagingSize: 1, uom: UOM.LTR, netContent: 15, pricePerPackage: 2100, yieldPercent: 100 },
      { id: 'i4', itemCode: 'RAW004', itemName: 'Garam Masala', brandName: 'Mdh', packagingSize: 1, uom: UOM.PKT, netContent: 0.1, pricePerPackage: 85, yieldPercent: 100 },
      { id: 'i5', itemCode: 'RAW005', itemName: 'Paneer Block', brandName: 'Amul', packagingSize: 1, uom: UOM.KG, netContent: 1, pricePerPackage: 450, yieldPercent: 100 }
    ];
    const dMenu: MenuItem[] = [
      { id: 'm1', menuCode: 'BASE01', menuName: 'Classic Indian Gravy', department: Department.FOOD, portionSize: '1 KG', sellingPrice: 0, yieldPercent: 80, isBaseRecipe: true },
      { id: 'm2', menuCode: 'SELL01', menuName: 'Mutter Paneer Signature', department: Department.FOOD, portionSize: '1 Plate', sellingPrice: 380, yieldPercent: 95, isBaseRecipe: false }
    ];
    const dRecipes: Recipe[] = [
      { menuItemId: 'm1', ingredients: [{ id: 'i1', type: 'item', quantity: 1.5 }, { id: 'i2', type: 'item', quantity: 2 }, { id: 'i3', type: 'item', quantity: 0.2 }, { id: 'i4', type: 'item', quantity: 0.05 }] },
      { menuItemId: 'm2', ingredients: [{ id: 'm1', type: 'base_recipe', quantity: 0.35 }, { id: 'i5', type: 'item', quantity: 0.2 }, { id: 'i3', type: 'item', quantity: 0.02 }] }
    ];
    setItems(dItems); setMenuItems(dMenu); setRecipes(dRecipes);
    alert("Culinary Demo Engine Initialized!");
  };

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard items={items} menuItems={menuItems} onLoadDemo={loadDemo} />} />
          <Route path="/items" element={<ItemMaster items={items} setItems={setItems} />} />
          <Route path="/menu" element={<MenuMaster menuItems={menuItems} setMenuItems={setMenuItems} />} />
          <Route path="/recipes" element={<RecipeMaster items={items} menuItems={menuItems} recipes={recipes} setRecipes={setRecipes} />} />
          <Route path="/ai-visuals" element={<ImageEditor />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
