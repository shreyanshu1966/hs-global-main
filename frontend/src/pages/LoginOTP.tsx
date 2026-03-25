import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { OTPInput } from '../components/OTPInput';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const LoginOTP: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (formRef.current) {
            gsap.fromTo(formRef.current,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
            );
        }
    }, [step]); // Re-run animation when step changes

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        
        setError('');
        setIsLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_URL}/auth/request-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok && data.ok) {
                setStep('otp');
                setError('');
            } else {
                setError(data.error || 'Failed to send OTP. Please try again.');
            }
        } catch (err: any) {
            console.error('OTP request error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate OTP length
        if (otp.length !== 6) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }
        
        setError('');
        setIsLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_URL}/auth/login-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();

            if (response.ok && data.ok) {
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('authUser', JSON.stringify(data.user));

                // Dispatch custom event to update AuthContext
                window.dispatchEvent(new Event('auth-change'));

                // Redirect to intended page or profile
                const from = (location.state as any)?.from || '/profile';
                navigate(from);
            } else {
                if (response.status === 401) {
                    setError('Invalid or expired OTP. Please try again.');
                } else {
                    setError(data.error || 'Verification failed. Please try again.');
                }
            }
        } catch (err: any) {
            console.error('OTP verification error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-[calc(100vh-134px)] flex bg-white font-sans text-gray-900">
            {/* Left Column: Image / Branding */}
            <div className="hidden lg:flex w-1/2 bg-gray-50 flex-col relative overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(15%)' }}>
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
                <div className="relative z-10 p-12 lg:p-16 h-full flex flex-col justify-between text-white">
                    <div>
                        <Link to="/" className="text-2xl font-bold font-serif tracking-tight text-white hover:text-gray-200 transition-colors inline-block">
                            HS Global
                        </Link>
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-4xl lg:text-5xl font-serif font-medium leading-tight mb-6">
                            Secure, passwordless access.
                        </h2>
                        <p className="text-lg font-light text-gray-200">
                            Log in instantly to your account with a secure one-time password sent directly to your email.
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
                    
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight font-sans">
                            {step === 'email' ? 'Log in with OTP' : 'Enter OTP'}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {step === 'email'
                                ? 'Enter your email to receive a one-time password.'
                                : `We've sent a 6-digit OTP to ${email}.`}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 'email' ? (
                        <form onSubmit={handleRequestOTP} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm"
                                        placeholder="name@example.com"
                                        required
                                    />
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
                                        Sending OTP...
                                    </>
                                ) : (
                                    'Send OTP'
                                )}
                            </button>

                            <div className="mt-8 mb-8 relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-400 text-xs uppercase tracking-wider">Other methods</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    to="/login"
                                    className="w-full py-3 border border-gray-300 text-gray-900 text-sm font-semibold rounded-md hover:bg-gray-50 transition-colors text-center block"
                                >
                                    Log in with password
                                </Link>
                                <div className="pt-2 text-center">
                                    <Link to="/signup" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors underline-offset-4 hover:underline">
                                        Create a new account
                                    </Link>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-4">
                                    Secure Code
                                </label>
                                <OTPInput
                                    value={otp}
                                    onChange={setOtp}
                                    length={6}
                                    disabled={isLoading}
                                />
                                <p className="mt-4 text-xs text-gray-500 font-medium">
                                    OTP expires in 10 minutes.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otp.length !== 6}
                                className="w-full py-3 mt-2 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Log in securely'
                                )}
                            </button>

                            <div className="pt-6 border-t border-gray-100 flex flex-col space-y-4">
                                <button
                                    type="button"
                                    onClick={handleRequestOTP}
                                    disabled={isLoading}
                                    className="text-sm font-semibold text-gray-600 hover:text-black transition-colors text-center disabled:opacity-50"
                                >
                                    Didn't receive it? Resend
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('email');
                                        setOtp('');
                                        setError('');
                                    }}
                                    className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Change email address
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginOTP;
