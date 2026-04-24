import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Sparkles, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

const Auth = ({ onLoginSuccess }) => {
    // Safely get the API URL
    const getApiUrl = () => {
        try {
            return import.meta.env.VITE_API_URL || 'http://localhost:5000';
        } catch (e) {
            return 'http://localhost:5000';
        }
    };

    const API_URL = getApiUrl();
    const [isLogin, setIsLogin] = useState(true); 
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    // Reset form when toggling between login and register
    useEffect(() => {
        setFormData({ username: '', email: '', password: '' });
    }, [isLogin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const { data } = await axios.post(`${API_URL}${endpoint}`, formData);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            toast.success(isLogin ? `Welcome back, ${data.user.username}!` : "Account created successfully!");

            onLoginSuccess(data.token);
        } catch (err) {
            toast.error(err.response?.data?.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-6 selection:bg-purple-500/30">
            <div className="w-full max-w-md">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-4 animate-in fade-in zoom-in duration-700">
                        <Sparkles className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white italic">Lumen</h1>
                    <p className="text-slate-500 mt-2 text-center font-medium">Your AI-Powered Knowledge Vault</p>
                </div>

                {/* Auth Card */}
                <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-2xl font-bold mb-8 text-center text-white tracking-tight">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    autoComplete="username"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-white"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                            </div>
                        )}

                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                            <input
                                type="email"
                                placeholder="Email Address"
                                autoComplete="email"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-white"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                            <input
                                type="password"
                                placeholder="Password"
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-white"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-black py-4 rounded-2xl mt-4 flex items-center justify-center gap-3 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-white/10"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <span>{isLogin ? "Sign In" : "Get Started"}</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="w-full mt-8 text-sm font-semibold text-slate-500 hover:text-purple-400 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Join Lumen" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;