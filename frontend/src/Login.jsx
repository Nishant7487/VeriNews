import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function Login({ setAuthToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // Strict Validation Rules
    const validateForm = () => {
        if (!isRegistering) return true; // Login me strict check ki zaroorat nahi, backend handle karega

        const usernameRegex = /^[a-zA-Z0-9]{4,}$/; // Min 4 chars, no spaces/special chars
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/; // Min 8, 1 number, 1 special char

        if (!usernameRegex.test(username)) {
            setError("Username must be at least 4 characters long and contain no spaces or special characters.");
            return false;
        }
        if (!passwordRegex.test(password)) {
            setError("Password must be at least 8 characters long, contain at least one number and one special character (!@#$%^&*).");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) return;

        setLoading(true);

        try {
            if (isRegistering) {
                const regResponse = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const regData = await regResponse.json();
                if (!regResponse.ok) throw new Error(regData.detail || 'Registration failed. Username might exist.');
            }

            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const loginResponse = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });

            if (!loginResponse.ok) {
                const errorData = await loginResponse.json();
                throw new Error(errorData.detail || 'Invalid credentials');
            }

            const data = await loginResponse.json();
            localStorage.setItem('verinews_token', data.access_token);
            setAuthToken(data.access_token);
            
        } catch (err) {
            setError(err.message === "Failed to fetch" ? "Cannot connect to backend server." : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30 relative">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            
            <form onSubmit={handleSubmit} className="relative z-10 p-8 bg-slate-900/80 border border-slate-700/50 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.1)] w-[90%] max-w-md backdrop-blur-xl">
                
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-30 rounded-full"></div>
                        <h2 className="relative z-10 text-3xl font-black tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                            {isRegistering ? "Create Access Pass" : "System Access"}
                        </h2>
                    </div>
                </div>

                {isRegistering && (
                    <div className="mb-6 p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-xs font-mono text-slate-400 space-y-2">
                        <p className="text-cyan-400 font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Security Protocol:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Username: Min 4 chars, no spaces.</li>
                            <li>Password: Min 8 chars, 1 number, 1 special char (!@#$%).</li>
                        </ul>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-3 text-sm font-bold text-left text-red-400 bg-red-950/50 border border-red-500/30 rounded-xl flex items-start gap-2">
                        <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}
                
                <div className="space-y-4 mb-6">
                    <input 
                        type="text" 
                        placeholder="Authorized Username" 
                        className="w-full p-4 text-sm text-white bg-slate-950/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder:text-slate-500"
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Security Password" 
                        className="w-full p-4 text-sm text-white bg-slate-950/50 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder:text-slate-500"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full p-4 mb-4 font-bold tracking-wide text-white transition-all bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                >
                    {loading ? 'PROCESSING...' : (isRegistering ? 'ENFORCE RULES & REGISTER' : 'SECURE LOGIN')}
                </button>

                <div className="text-center mt-2">
                    <button 
                        type="button"
                        onClick={() => { setIsRegistering(!isRegistering); setError(''); setPassword(''); }}
                        className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors uppercase tracking-widest"
                    >
                        {isRegistering ? "Already registered? Login" : "Need access? Register here"}
                    </button>
                </div>
            </form>
        </div>
    );
}