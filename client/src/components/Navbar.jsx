import React from 'react';
import { Sparkles, PlusCircle, LogOut, User, Settings } from 'lucide-react';
import lumenLogo from '../assets/lumen-logo.png';

const Navbar = ({ onAddClick, onLogout, onProfileClick }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.location.reload()}>
          <div className="w-12 h-12 flex items-center justify-center p-2 rounded-xl group-hover:rotate-6 transition-all">
            <img 
              src={lumenLogo} 
              alt="Lumen AI Logo" 
              className="w-full h-full object-contain filter drop-shadow-lg shadow-purple-500/30" 
            />
          </div>
          <span className="text-white font-bold text-3xl ">Lumen</span>
        </div>

        <div className="flex items-center gap-4">
          <div 
            onClick={onProfileClick}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <User size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="hidden sm:inline text-sm font-medium text-slate-300">{user?.username}</span>
          </div>
          
          <button 
            onClick={onAddClick}
            className="bg-white text-black px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle size={18} />
            <span className="hidden xs:inline">Add Link</span>
          </button>

          <button 
            onClick={onLogout}
            className="p-2.5 rounded-2xl border border-white/10 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;