
import React, { useState } from 'react';
import { Plus, Download, Upload, Trash2, Edit2, Search, X, PieChart } from 'lucide-react';
import { MenuItem, Department } from '../types';
import { exportToCSV, parseCSV } from '../utils/csvUtils';

interface MenuMasterProps {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}

const MenuMaster: React.FC<MenuMasterProps> = ({ menuItems, setMenuItems }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>({
    menuCode: '',
    menuName: '',
    department: Department.FOOD,
    portionSize: '1 Plate',
    sellingPrice: 0,
    yieldPercent: 100,
    isBaseRecipe: false
  });

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        menuCode: '',
        menuName: '',
        department: Department.FOOD,
        portionSize: '1 Plate',
        sellingPrice: 0,
        yieldPercent: 100,
        isBaseRecipe: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setMenuItems(menuItems.map(m => m.id === editingItem.id ? { ...formData, id: m.id } : m));
    } else {
      setMenuItems([...menuItems, { ...formData, id: crypto.randomUUID() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setMenuItems(menuItems.filter(m => m.id !== id));
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      const newItems: MenuItem[] = parsed.map(p => ({
        id: crypto.randomUUID(),
        menuCode: p.menuCode || '',
        menuName: p.menuName || '',
        department: (p.department as Department) || Department.FOOD,
        portionSize: p.portionSize || '1 Portion',
        sellingPrice: Number(p.sellingPrice) || 0,
        yieldPercent: Number(p.yieldPercent) || 100,
        isBaseRecipe: p.isBaseRecipe === 'true'
      }));
      setMenuItems([...menuItems, ...newItems]);
    };
    reader.readAsText(file);
  };

  const filteredItems = menuItems.filter(item => 
    item.menuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.menuCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">Menu Master</h1>
          <p className="text-sky-600">Define your menu offerings and pricing</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 shadow-md transition-all"
          >
            <Plus size={18} /> Add Menu Item
          </button>
          <button 
            onClick={() => exportToCSV(menuItems, 'menu_master')}
            className="flex items-center gap-2 bg-white text-sky-600 border border-sky-200 px-4 py-2 rounded-lg hover:bg-sky-50 shadow-sm"
          >
            <Download size={18} /> Export CSV
          </button>
          <label className="flex items-center gap-2 bg-white text-sky-600 border border-sky-200 px-4 py-2 rounded-lg hover:bg-sky-50 shadow-sm cursor-pointer">
            <Upload size={18} /> Import CSV
            <input type="file" className="hidden" accept=".csv" onChange={handleImport} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
        <div className="p-4 border-b border-sky-50 bg-sky-50/30">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
            <input
              type="text"
              placeholder="Search menu..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-sky-50/50 text-sky-700 text-sm uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Menu Name</th>
                <th className="px-6 py-4">Dept</th>
                <th className="px-6 py-4">Portion</th>
                <th className="px-6 py-4">Selling Price</th>
                <th className="px-6 py-4">Yield %</th>
                <th className="px-6 py-4">Base?</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-sky-600">{item.menuCode}</td>
                  <td className="px-6 py-4 font-medium">{item.menuName}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold uppercase">
                      {item.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sky-500">{item.portionSize}</td>
                  <td className="px-6 py-4 font-semibold text-sky-700">₹{item.sellingPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">{item.yieldPercent}%</td>
                  <td className="px-6 py-4">
                    {item.isBaseRecipe ? (
                      <span className="text-green-600 flex items-center gap-1 text-sm font-medium">
                        <PieChart size={14} /> Yes
                      </span>
                    ) : 'No'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sky-400">
                    No menu items found. Build your menu today!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-sky-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-sky-500 p-1 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-sky-700 mb-1">Menu Code</label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.menuCode}
                  onChange={e => setFormData({ ...formData, menuCode: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sky-700 mb-1">Department</label>
                <select
                  className="w-full p-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
                >
                  {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-sky-700 mb-1">Menu Name</label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.menuName}
                  onChange={e => setFormData({ ...formData, menuName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sky-700 mb-1">Portion Size</label>
                <input
                  required
                  type="text"
                  className="w-full p-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.portionSize}
                  onChange={e => setFormData({ ...formData, portionSize: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sky-700 mb-1">Selling Price (₹)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full p-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.sellingPrice}
                  onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sky-700 mb-1">Yield %</label>
                <input
                  required
                  type="number"
                  className="w-full p-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
                  value={formData.yieldPercent}
                  onChange={e => setFormData({ ...formData, yieldPercent: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isBase"
                  className="w-5 h-5 accent-sky-600 rounded"
                  checked={formData.isBaseRecipe}
                  onChange={e => setFormData({ ...formData, isBaseRecipe: e.target.checked })}
                />
                <label htmlFor="isBase" className="text-sm font-medium text-sky-700">Is Base Recipe?</label>
              </div>
              <div className="col-span-2 pt-4">
                <button
                  type="submit"
                  className="w-full bg-sky-600 text-white py-3 rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-200 transition-all"
                >
                  {editingItem ? 'Update Menu Item' : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuMaster;
