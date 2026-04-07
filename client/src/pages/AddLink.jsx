import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link2, Sparkles } from 'lucide-react';
import axios from 'axios'; // 1. Import Axios

const AddLink = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false); // Add a loading state

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!url) return toast.error("Please paste a URL first!");

        setLoading(true); // Disable the button while AI is thinking
        const toastId = toast.loading('Lumen is analyzing with Gemini...');

        try {
            // 2. Make the ACTUAL request to your backend
            const response = await axios.post(`${API_URL}/api/links/analyze`, {
                url: url
            });

            console.log("Success:", response.data);

            toast.success('Link saved and tagged!', { id: toastId });
            setUrl(''); // Clear input
        } catch (error) {
            console.error("Axios Error:", error);
            toast.error(error.response?.data?.message || 'Something went wrong', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="text-sky-400" />
                    Add to your Vault
                </h2>
                <p className="text-slate-400 mb-6">Paste any URL and let AI do the rest.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="url"
                            placeholder="https://example.com/awesome-article"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading} // Prevent typing while loading
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-semibold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/20'
                            }`}
                    >
                        {loading ? 'Analyzing...' : 'Analyze & Save'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddLink;