
import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { GoogleLogin } from '@react-oauth/google';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, googleLogin } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPhonePrompt, setShowPhonePrompt] = useState(false);
    const [pendingCredential, setPendingCredential] = useState('');
    const [googlePhone, setGooglePhone] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (formRef.current) {
            gsap.fromTo(formRef.current,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
            );
        }
    }, { scope: containerRef });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setIsLoading(true);

        try {
            await login(email, password);
            const from = (location.state as any)?.from || '/profile';
            navigate(from);
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.message.includes('Invalid credentials')) {
                setError('Invalid email or password.');
            } else if (err.message.includes('not found')) {
                setError('No account found with this email.');
            } else {
                setError(err.message || 'Login failed.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credential: string) => {
        setError('');
        setIsLoading(true);
        try {
            await googleLogin(credential);
            const from = (location.state as any)?.from || '/profile';
            navigate(from);
        } catch (err: any) {
            console.error('Google login error:', err);
            if (err.requiresPhone) {
                setPendingCredential(credential);
                setShowPhonePrompt(true);
            } else {
                setError(err.message || 'Google login failed.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGooglePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const phoneRegex = /^\+?[\d\s-]{10,15}$/;
        if (!phoneRegex.test(googlePhone)) {
            setError('Please enter a valid phone number');
            return;
        }
        
        setError('');
        setIsLoading(true);
        try {
            await googleLogin(pendingCredential, googlePhone);
            const from = (location.state as any)?.from || '/profile';
            navigate(from);
        } catch (err: any) {
            console.error('Google login with phone error:', err);
            setError(err.message || 'Google login failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-[calc(100vh-134px)] flex bg-white font-sans text-gray-900">
            {/* Left Column: Image / Branding */}
            <div className="hidden lg:flex w-1/2 bg-gray-50 flex-col relative overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                <div className="relative z-10 p-12 lg:p-16 h-full flex flex-col justify-between text-white">
                    <div>
                        <Link to="/" className="text-2xl font-bold font-serif tracking-tight text-white hover:text-gray-200 transition-colors inline-block">
                            HS Global
                        </Link>
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-4xl lg:text-5xl font-serif font-medium leading-tight mb-6">
                            Exquisite materials for your masterpiece.
                        </h2>
                        <p className="text-lg font-light text-gray-200">
                            Join thousands of professionals sourcing the best globally.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative bg-white">
                <div ref={formRef} className="w-full max-w-[420px]">
                    <div className="mb-12 lg:hidden">
                        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-black">
                            HS Global
                        </Link>
                    </div>

                    {showPhonePrompt ? (
                        <div className="text-left space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">One last step</h2>
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                    Please provide your mobile number to continue.
                                </p>
                            </div>
                            
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleGooglePhoneSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={googlePhone}
                                        onChange={(e) => setGooglePhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm"
                                        placeholder="+1 (555) 000-0000"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 mt-4 bg-black text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${isLoading || !googlePhone ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Continuing...
                                        </>
                                    ) : (
                                        'Continue'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPhonePrompt(false)}
                                    className="w-full py-3 mt-2 bg-white text-black border border-gray-300 text-sm font-semibold rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <div className="mb-10">
                                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight font-sans">Log in</h1>
                                <p className="text-gray-500 text-sm">
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="text-black font-semibold hover:underline decoration-1 underline-offset-4">
                                        Sign up
                                    </Link>
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-semibold text-gray-900">
                                            Password
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="mt-2 text-right">
                                        <Link to="/forgot-password" className="text-xs font-medium text-gray-500 hover:text-black transition-colors underline-offset-2 hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 mt-4 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Logging in...
                                        </>
                                    ) : (
                                        'Log in'
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 mb-8 relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-400 text-xs uppercase tracking-wider">Or continue with</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex justify-center w-full [&>div]:w-full">
                                    <GoogleLogin
                                        onSuccess={credentialResponse => {
                                            if (credentialResponse.credential) {
                                                handleGoogleSuccess(credentialResponse.credential);
                                            }
                                        }}
                                        onError={() => {
                                            setError('Google authentication failed');
                                        }}
                                        useOneTap
                                    />
                                </div>

                                <Link
                                    to="/login-otp"
                                    className="w-full py-3 border border-gray-300 text-gray-900 text-sm font-semibold rounded-md hover:bg-gray-50 transition-colors text-center flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-smartphone"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                                    Log in with OTP
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
