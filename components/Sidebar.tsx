import React from 'react';
import { LayoutDashboard, Receipt, FileCode, ShieldAlert, BookOpen } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'invoice', label: 'Invoice Extraction', icon: Receipt },
    { id: 'bim', label: 'BIM Analysis', icon: FileCode },
    { id: 'risk', label: 'Risk Prediction', icon: ShieldAlert },
    { id: 'compliance', label: 'Compliance Audit', icon: BookOpen },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-xl">
      <div className="p-6 border-b border-slate-700 flex items-center space-x-2">
        <LayoutDashboard className="w-8 h-8 text-blue-400" />
        <span className="text-xl font-bold tracking-tight">Construct<span className="text-blue-400">AI</span> ERP</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        <p>Powered by Gemini 2.5 Flash</p>
        <p>v1.0.0 Enterprise Build</p>
      </div>
    </div>
  );
};

export default Sidebar;