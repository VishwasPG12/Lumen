import React, { useState, useEffect, useMemo } from 'react';
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
  Link as LinkIcon,
  FileText,
  ClipboardCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Home = ({ token, showAddModal, setShowAddModal, onLogout }) => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [userContext, setUserContext] = useState(''); 
  const [analyzing, setAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [selectedLink, setSelectedLink] = useState(null);

  // Safely retrieve API URL from environment
  const getApiUrl = () => {
    try {
      const envUrl = import.meta.env?.VITE_API_URL;
      return envUrl || 'http://localhost:5000';
    } catch (e) {
      return 'http://localhost:5000';
    }
  };

  const API_URL = getApiUrl();

  /**
   * Optimized API instance
   * useMemo ensures the headers update only when the token changes,
   * preventing race conditions that lead to 401 errors.
   */
  const api = useMemo(() => {
    // 1. Check if token is a valid string, not "null" or "undefined" from localStorage
    const isTokenValid = token && token !== "null" && token !== "undefined";
    
    // 2. Ensure exactly ONE "Bearer " prefix
    const authToken = isTokenValid 
      ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) 
      : '';

    return axios.create({
      baseURL: `${API_URL}/api`,
      headers: { 
        Authorization: authToken 
      }
    });
  }, [token, API_URL]); // This dependency is CRITICAL

  const fetchLinks = async () => {
    if (!token || token === "null") return;
    
    try {
      setLoading(true);
      const res = await api.get('/links');
      setLinks(res.data || []);
    } catch (err) {
      console.error("Vault fetch error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Re-authenticating...");
        if (onLogout) onLogout(); 
      } else {
        toast.error("Failed to unlock vault");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [api]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url) return toast.error("Please provide a source URL");
    
    setAnalyzing(true);
    const toastId = toast.loading('Lumen is synthesizing the insight...');
    try {
      await api.post('/links/analyze', { 
        url, 
        context: userContext 
      });
      
      setUrl('');
      setUserContext(''); 
      setShowAddModal(false);
      fetchLinks(); 
      toast.success('Insight archived!', { id: toastId });
    } catch (err) {
      const message = err.response?.data?.message || "Synthesis failed";
      toast.error(message, { id: toastId });
      
      if (err.response?.status === 401 && onLogout) {
        onLogout();
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm("Purge this memory permanently?")) return;
    try {
      await api.delete(`/links/${id}`);
      setLinks(links.filter(link => link._id !== id));
      if (selectedLink?._id === id) setSelectedLink(null);
      toast.success("Memory purged");
    } catch (err) {
      if (err.response?.status === 401 && onLogout) {
        onLogout();
      } else {
        toast.error("Failed to purge link");
      }
    }
  };

  const copyToClipboard = (e, text, type = "URL") => {
    if (e) e.stopPropagation(); 
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard`);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success(`${type} copied to clipboard`);
      } catch (err) {
        toast.error("Copy failed");
      }
      document.body.removeChild(textArea);
    }
  };

  const categories = ['All', ...new Set(links.map(l => l.category).filter(Boolean))];

  const filteredLinks = links.filter(link => {
    const matchesCategory = activeCategory === 'All' || link.category === activeCategory;
    
    // SAFETY CHECK: Ensure title and tags exist before calling toLowerCase()
    const title = link.title || 'Untitled';
    const tags = link.tags || [];
    const search = searchQuery.toLowerCase();
    
    const matchesSearch = 
      title.toLowerCase().includes(search) || 
      tags.some(t => t.toLowerCase().includes(search));
      
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-8">
      {/* SEARCH AND CATEGORIES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search titles or #tags..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer whitespace-nowrap ${
                activeCategory === cat 
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20' 
                : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FEED GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 opacity-30">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
          <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white">Synchronizing Vault</p>
        </div>
      ) : filteredLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[3.5rem] bg-white/[0.01]">
          <LayoutGrid className="w-16 h-16 text-slate-800 mb-6 opacity-20" />
          <h3 className="text-xl font-bold text-slate-500 tracking-tight">The Archive is Empty</h3>
          <p className="text-slate-600 mt-1 font-medium">Capture your first insight to begin.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {filteredLinks.map((link) => (
            <div 
              key={link._id} 
              onClick={() => setSelectedLink(link)}
              className="break-inside-avoid group bg-[#0f0f12] border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.04] transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10 active:scale-[0.98] cursor-pointer"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-purple-500/20">
                    {link.category}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button onClick={(e) => copyToClipboard(e, link.url)} className="p-2.5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-colors" title="Copy URL">
                      <Copy size={14} />
                    </button>
                    <a href={link.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2.5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-colors" title="Open Site">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                <h3 className="text-lg font-bold leading-snug mb-3 text-white line-clamp-2 tracking-tight">
                  {link.title}
                </h3>
                
                <p className="text-[13px] text-slate-400 leading-relaxed mb-8 line-clamp-4 italic opacity-70 font-medium">
                  "{link.summary}"
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {link.tags && link.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-[10px] text-slate-500 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 font-bold">
                      <Hash size={10} className="text-purple-500/40" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                <span>{link.createdAt ? new Date(link.createdAt).toLocaleDateString() : 'Draft'}</span>
                <button 
                  onClick={(e) => handleDelete(e, link._id)}
                  className="hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD INSIGHT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-2xl bg-black/70">
          <div className="bg-[#0f0f12] border border-white/10 w-full max-w-lg rounded-[3rem] p-10 shadow-[0_0_100px_rgba(0,0,0,1)] relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors p-2"><X size={24} /></button>
            <h2 className="text-3xl font-bold mb-3 text-white tracking-tight">Capture Insight</h2>
            <p className="text-slate-500 mb-10 text-sm font-medium">Synthesize URLs into your private knowledge vault.</p>
            
            <form onSubmit={handleAnalyze} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 ml-2">Source URL</label>
                <div className="relative group">
                    <LinkIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
                    <input autoFocus required type="url" placeholder="https://..." className="w-full bg-black border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all text-white placeholder:text-slate-800" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 ml-2 flex justify-between">
                  <span>Context (Optional)</span>
                  <span className="text-purple-500/40 normal-case tracking-normal">Improves AI Distillation</span>
                </label>
                <div className="relative group">
                    <FileText size={18} className="absolute left-5 top-5 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
                    <textarea 
                      placeholder="Paste key takeaways or raw text from the page..." 
                      className="w-full bg-black border border-white/10 rounded-[1.5rem] py-5 pl-14 pr-4 focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all text-white min-h-[140px] resize-none text-sm leading-relaxed placeholder:text-slate-800" 
                      value={userContext} 
                      onChange={(e) => setUserContext(e.target.value)} 
                    />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-5 rounded-[1.5rem] font-bold border border-white/5 hover:bg-white/5 transition-all text-slate-500">Cancel</button>
                <button type="submit" disabled={analyzing} className="flex-[2] bg-white text-black px-6 py-5 rounded-[1.5rem] font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 shadow-xl shadow-white/5">
                  {analyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  <span>{analyzing ? "Synthesizing..." : "Analyze & Archive"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-3xl bg-black/80" onClick={() => setSelectedLink(null)}>
          <div 
            className="bg-[#0f0f12] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Graphic */}
            <div className="shrink-0 h-32 bg-gradient-to-br from-purple-900/60 via-blue-900/20 to-transparent border-b border-white/5 flex items-end px-8 pb-6">
               <span className="px-4 py-1.5 bg-purple-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-purple-500/20">
                 {selectedLink.category}
               </span>
               <button 
                onClick={() => setSelectedLink(null)}
                className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-2 bg-black/20 rounded-full border border-white/5 hover:border-white/20"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-grow">
  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-[1.2] tracking-tight">
    {selectedLink.title}
  </h2>

              <div className="flex flex-wrap gap-6 mb-8 text-slate-500 text-xs font-bold uppercase tracking-widest items-center">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-purple-500/60" />
                  {selectedLink.createdAt ? new Date(selectedLink.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}
                </div>
                <a 
                  href={selectedLink.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <LinkIcon size={16} />
                  Source
                </a>
                <button 
                  onClick={() => copyToClipboard(null, selectedLink.summary, "Summary")}
                  className="flex items-center gap-2 text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  <ClipboardCheck size={16}/> Copy Summary
                </button>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 mb-8 relative group">
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 flex items-center gap-2">
                  <Sparkles size={12} className="text-purple-500/60" />
                  Distilled Knowledge
                </h4>
                <p className="text-lg text-slate-200 leading-relaxed font-medium italic opacity-90">
                  "{selectedLink.summary}"
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedLink.tags && selectedLink.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 text-[10px] text-slate-400 bg-white/5 px-4 py-2 rounded-xl border border-white/5 font-bold">
                    <Hash size={12} className="text-purple-500/30" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Action Area */}
            <div className="shrink-0 p-6 border-t border-white/5 bg-black/20 flex justify-end">
                 <button 
                   onClick={(e) => handleDelete(e, selectedLink._id)}
                   className="flex items-center gap-2 px-6 py-3 rounded-2xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-all font-bold text-xs uppercase tracking-widest"
                 >
                   <Trash2 size={16} />
                   Purge Archive
                 </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;