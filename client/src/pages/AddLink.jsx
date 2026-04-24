import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link2, Sparkles, FileText, Zap } from 'lucide-react';
import axios from 'axios'; 

const AddLink = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [url, setUrl] = useState('');
    const [userContext, setUserContext] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!url) return toast.error("Please paste a URL first!");

        setLoading(true);
        const toastId = toast.loading('Lumen is distilling insight...');

        try {
            const token = localStorage.getItem('token');
            // Using a template literal for the Bearer token is standard practice
            await axios.post(`${API_URL}/api/links/analyze`, 
                { url, context: userContext },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Insight captured in vault!', { id: toastId });
            setUrl(''); 
            setUserContext(''); 
        } catch (error) {
            console.error("Analysis Error:", error);
            const message = error.response?.data?.message || 'Synthesis failed';
            toast.error(message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    // Shortcut: Ctrl+Enter to submit
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 px-4">
            <div className="bg-[#0f0f12] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                {/* Subtle Glow Decor */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full" />
                
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-3 text-white tracking-tight">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                            <Sparkles className="text-purple-400" size={24} />
                        </div>
                        Add to Vault
                    </h2>
                    <p className="text-slate-500 mb-8 text-sm font-medium">
                        Llama 3.3 will distill your link into a searchable insight.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* URL INPUT */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                                Source URL
                            </label>
                            <div className="relative group">
                                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-500 transition-colors" size={18} />
                                <input
                                    type="url"
                                    required
                                    placeholder="https://example.com/insight"
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all text-white placeholder:text-slate-700"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    disabled={loading} 
                                />
                            </div>
                        </div>

                        {/* OPTIONAL CONTEXT AREA */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1 flex justify-between items-center">
                                <span>Context / Scraped Text</span>
                                <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-slate-400 normal-case tracking-normal">Optional</span>
                            </label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-5 text-slate-600 group-focus-within:text-purple-500 transition-colors" size={18} />
                                <textarea
                                    placeholder="Paste relevant text from the page to improve AI summary accuracy..."
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/5 transition-all text-white min-h-[140px] resize-none placeholder:text-slate-700 text-sm leading-relaxed"
                                    value={userContext}
                                    onChange={(e) => setUserContext(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group ${
                                loading 
                                ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5' 
                                : 'bg-white text-black hover:bg-slate-200'
                            }`}
                        >
                            {loading ? (
                                <Zap className="animate-pulse text-purple-500" size={18} />
                            ) : (
                                <Sparkles className="group-hover:rotate-12 transition-transform" size={18} />
                            )}
                            {loading ? 'Synthesizing...' : 'Analyze & Archive'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddLink;