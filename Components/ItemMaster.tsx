
import React, { useState } from 'react';
import { Plus, Download, Upload, Trash2, Edit2, Search, X, Percent } from 'lucide-react';
import { Item, UOM } from '../types';
import { exportToCSV, parseCSV } from '../utils/csvUtils';

interface ItemMasterProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

const ItemMaster: React.FC<ItemMasterProps> = ({ items, setItems }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  const [formData, setFormData] = useState<Omit<Item, 'id'>>({
    itemCode: '',
    itemName: '',
    brandName: '',
    packagingSize: 1,
    uom: UOM.KG,
    netContent: 1,
    pricePerPackage: 0,
    yieldPercent: 100
  });

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({ ...item });
    } else {
      setEditingItem(null);
      setFormData({
        itemCode: '',
        itemName: '',
        brandName: '',
        packagingSize: 1,
        uom: UOM.KG,
        netContent: 1,
        pricePerPackage: 0,
        yieldPercent: 100
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setItems(items.map(i => i.id === editingItem.id ? { ...formData, id: i.id } : i));
    } else {
      setItems([...items, { ...formData, id: crypto.randomUUID() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      const newItems: Item[] = parsed.map(p => ({
        id: crypto.randomUUID(),
        itemCode: p.itemCode || '',
        itemName: p.itemName || '',
        brandName: p.brandName || '',
        packagingSize: Number(p.packagingSize) || 1,
        uom: (p.uom as UOM) || UOM.KG,
        netContent: Number(p.netContent) || 1,
        pricePerPackage: Number(p.pricePerPackage) || 0,
        yieldPercent: Number(p.yieldPercent) || 100
      }));
      setItems([...items, ...newItems]);
    };
    reader.readAsText(file);
  };

  const filteredItems = items.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">Item Master</h1>
          <p className="text-sky-600">Manage raw materials and packaging inventory</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 shadow-md transition-all"
          >
            <Plus size={18} /> Add Item
          </button>
          <button 
            onClick={() => exportToCSV(items, 'items_master')}
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
              placeholder="Search items..."
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
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4 text-center">Yield %</th>
                <th className="px-6 py-4">Pkg Details</th>
                <th className="px-6 py-4 text-right">Price/Pkg</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-sky-50/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-sky-600">{item.itemCode}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-sky-900">{item.itemName}</div>
                    <div className="text-xs text-sky-400">{item.brandName}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.yieldPercent < 90 ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                      {item.yieldPercent}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-sky-500">
                    {item.packagingSize} x {item.netContent} {item.uom}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-sky-700">₹{item.pricePerPackage.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-sky-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-sky-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-sky-500 p-1 rounded-lg"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-sky-700 mb-1">Item Code</label>
                <input required type="text" className="w-full p-2 border border-sky-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" value={formData.itemCode} onChange={e => setFormData({ ...formData, itemCode: e.target.value })} />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-sky-700 mb-1">Brand Name</label>
                <input required type="text" className="w-full p-2 border border-sky-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" value={formData.brandName} onChange={e => setFormData({ ...formData, brandName: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-sky-700 mb-1">Item Name</label>
                <input required type="text" className="w-full p-2 border border-sky-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" value={formData.itemName} onChange={e => setFormData({ ...formData, itemName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-sky-700 mb-1">Yield % (Usable)</label>
                <input required type="number" min="1" max="100" className="w-full p-2 border border-sky-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" value={formData.yieldPercent} onChange={e => setFormData({ ...formData, yieldPercent: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-sky-700 mb-1">UOM</label>
                <select className="w-full p-2 border border-sky-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" value={formData.uom} onChange={e => setFormData({ ...formData, uom: e.target.value as UOM })}>
                  {Object.values(UOM).map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sky-700 mb-1">Pkg Size</label>
                <input required type="number" className="w-full p-2 border border-sky-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" value={formData.packagingSize} onChange={e => setFormData({ ...formData, packagingSize: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-sky-700 mb-1">Net Content</label>
                <input required type="number" step="0.001" className="w-full p-2 border border-sky-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" value={formData.netContent} onChange={e => setFormData({ ...formData, netContent: Number(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-sky-700 mb-1">Price Per Package (₹)</label>
                <input required type="number" step="0.01" className="w-full p-2 border border-sky-200 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" value={formData.pricePerPackage} onChange={e => setFormData({ ...formData, pricePerPackage: Number(e.target.value) })} />
              </div>
              <div className="col-span-2 pt-4">
                <button type="submit" className="w-full bg-sky-600 text-white py-3 rounded-xl font-bold hover:bg-sky-700 shadow-lg">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemMaster;
