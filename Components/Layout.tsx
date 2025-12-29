
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Database, 
  Menu as MenuIcon, 
  BookOpen, 
  Camera, 
  LayoutDashboard,
  ChefHat
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/items", icon: <Database size={20} />, label: "Item Master" },
    { to: "/menu", icon: <MenuIcon size={20} />, label: "Menu Master" },
    { to: "/recipes", icon: <BookOpen size={20} />, label: "Recipe Master" },
    { to: "/ai-visuals", icon: <Camera size={20} />, label: "AI Visuals" },
  ];

  return (
    <div className="flex h-screen bg-sky-50">
      {/* Sidebar */}
      <aside className="w-64 bg-sky-900 text-white flex flex-col shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-sky-800">
          <div className="bg-sky-500 p-2 rounded-lg">
            <ChefHat size={24} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Majhi's Recipe</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-900/50' 
                    : 'text-sky-200 hover:bg-sky-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 text-xs text-sky-400 border-t border-sky-800 text-center">
          &copy; 2024 Majhi's Enterprise
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
