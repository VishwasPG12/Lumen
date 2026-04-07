import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Copy, 
  Trash2, 
  Hash, 
  LayoutGrid, 
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Home = ({ token, showAddModal, setShowAddModal }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [selectedLink, setSelectedLink] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: { Authorization: token }
  });

  const fetchLinks = async () => {
    try {
      const res = await api.get('/links');
      setLinks(res.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load your vault");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    const toastId = toast.loading('AI is analyzing the content...');
    try {
      await api.post('/links/analyze', { url });
      setUrl('');
      setShowAddModal(false);
      fetchLinks(); 
      toast.success('Insight saved!', { id: toastId });
    } catch (err) {
      toast.error("Analysis failed", { id: toastId });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm("Permanently delete this insight?")) return;
    try {
      await api.delete(`/links/${id}`);
      setLinks(links.filter(link => link._id !== id));
      if (selectedLink?._id === id) setSelectedLink(null);
      toast.success("Link removed");
    } catch (err) {
      toast.error("Could not delete link");
    }
  };

  const copyToClipboard = (e, text) => {
    e.stopPropagation(); 
    navigator.clipboard.writeText(text);
    toast.success("URL copied");
  };

  const categories = ['All', ...new Set(links.map(l => l.category).filter(Boolean))];

  const filteredLinks = links.filter(link => {
    const matchesCategory = activeCategory === 'All' || link.category === activeCategory;
    const matchesSearch = 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      link.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search titles or #tags..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                activeCategory === cat 
                ? 'bg-purple-600 border-purple-400 text-white' 
                : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
          <p className="text-xs font-bold tracking-widest uppercase">Unlocking Vault...</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredLinks.map((link) => (
            <div 
              key={link._id} 
              onClick={() => setSelectedLink(link)}
              className="break-inside-avoid group bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden hover:bg-white/[0.06] transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 active:scale-[0.98] cursor-pointer"
            >
              <div className="p-7">
                <div className="flex items-start justify-between mb-5">
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-purple-500/20">
                    {link.category}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => copyToClipboard(e, link.url)} className="p-2 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-colors cursor-pointer">
                      <Copy size={16} />
                    </button>
                    <a href={link.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-colors cursor-pointer">
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>

                <h3 className="text-lg font-bold leading-tight mb-3 text-white">
                  {link.title}
                </h3>
                
                <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-4 italic opacity-80">
                  "{link.summary}"
                </p>

                <div className="flex flex-wrap gap-2">
                  {link.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-[11px] text-slate-500 bg-black/40 px-2.5 py-1.5 rounded-xl border border-white/5">
                      <Hash size={12} className="text-purple-500/50" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="px-7 py-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                <button 
                  onClick={(e) => handleDelete(e, link._id)}
                  className="hover:text-red-400 transition-colors p-1 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
          <div className="bg-[#121214] border border-white/10 w-full max-w-lg rounded-[3rem] p-12 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors cursor-pointer"><X size={24} /></button>
            <h2 className="text-3xl font-bold mb-3">Save Insight</h2>
            <p className="text-slate-400 mb-10 text-sm">Our AI will distill the key knowledge and tag it automatically.</p>
            <form onSubmit={handleAnalyze}>
              <div className="mb-10">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">Source URL</label>
                <input autoFocus required type="url" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-lg" value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 rounded-[1.5rem] font-bold border border-white/10 hover:bg-white/5 transition-all text-slate-400 cursor-pointer">Cancel</button>
                <button type="submit" disabled={analyzing} className="flex-[2] bg-white text-black px-6 py-4 rounded-[1.5rem] font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer">{analyzing ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}<span>Analyze & Save</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-2xl bg-black/70 overflow-y-auto" onClick={() => setSelectedLink(null)}>
          <div 
            className="bg-[#121214] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-32 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-b border-white/5 flex items-center px-10">
               <div className="px-4 py-1.5 bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                 {selectedLink.category}
               </div>
            </div>

            <div className="p-10">
              <button 
                onClick={() => setSelectedLink(null)}
                className="absolute top-6 right-8 text-slate-500 hover:text-white transition-colors p-2 cursor-pointer"
              >
                <X size={28} />
              </button>

              <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
                {selectedLink.title}
              </h2>

              <div className="flex flex-wrap gap-6 mb-8 text-slate-400 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-purple-500" />
                  {new Date(selectedLink.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <a 
                  href={selectedLink.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  <LinkIcon size={16} />
                  Visit Source
                </a>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 mb-8">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-500" />
                  AI Summary
                </h4>
                <p className="text-lg text-slate-200 leading-relaxed font-medium">
                  {selectedLink.summary}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {selectedLink.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                    <Hash size={14} className="text-purple-500/50" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-12 flex justify-end gap-4 border-t border-white/5 pt-8">
                 <button 
                   onClick={(e) => handleDelete(e, selectedLink._id)}
                   className="flex items-center gap-2 px-6 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all cursor-pointer font-bold text-sm"
                 >
                   <Trash2 size={18} />
                   Delete Archive
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;