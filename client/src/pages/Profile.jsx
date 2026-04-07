import React from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Mail, Trash2, ArrowLeft, ShieldAlert } from 'lucide-react';

const Profile = ({ onBack, onLogout, token }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "WARNING: This will permanently delete your account and ALL your saved links. This cannot be undone. Proceed?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/auth/delete-account`, {
        headers: { Authorization: token }
      });
      toast.success("Account purged. Goodbye!");
      onLogout(); // Log them out after deletion
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-10 cursor-pointer group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back to Vault</span>
      </button>

      <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20">
            <User size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">{user?.username}</h2>
          <p className="text-slate-500 flex items-center gap-2 mt-2">
            <Mail size={14} /> {user?.email}
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
            <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2">
              <ShieldAlert size={18} />
              Danger Zone
            </h4>
            <p className="text-sm text-slate-500 mb-6">
              Deleting your account will remove all your saved insights, tags, and summaries from our servers forever.
            </p>
            <button 
              onClick={handleDeleteAccount}
              className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-red-500/20 cursor-pointer"
            >
              <Trash2 size={20} />
              Delete Account & Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;