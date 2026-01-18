import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
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

    useGSAP(() => {
        if (containerRef.current) {
            gsap.from(containerRef.current.children, {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }
    }, [step]);

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
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
            } else {
                setError(data.error || 'Failed to send OTP');
            }
        } catch (err: any) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
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

                // Redirect to intended page or profile
                const from = (location.state as any)?.from || '/profile';
                navigate(from);
            } else {
                setError(data.error || 'Invalid OTP');
            }
        } catch (err: any) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full mx-4">
                <div ref={containerRef} className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-black mb-2">
                            {step === 'email' ? 'Login with OTP' : 'Enter OTP'}
                        </h1>
                        <p className="text-gray-600">
                            {step === 'email'
                                ? 'Enter your email to receive a one-time password'
                                : `We've sent a 6-digit OTP to ${email}`}
                        </p>
                    </div>

                    {step === 'email' ? (
                        <form onSubmit={handleRequestOTP} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending OTP...' : 'Send OTP'}
                            </button>

                            <div className="space-y-3 text-center">
                                <Link
                                    to="/login"
                                    className="block text-sm text-gray-600 hover:text-black transition-colors"
                                >
                                    Login with password instead
                                </Link>
                                <div className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="text-black font-medium hover:underline">
                                        Sign up
                                    </Link>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    One-Time Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest font-mono"
                                        placeholder="000000"
                                        required
                                        maxLength={6}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500 text-center">
                                    OTP expires in 10 minutes
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || otp.length !== 6}
                                className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <div className="space-y-3 text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('email');
                                        setOtp('');
                                        setError('');
                                    }}
                                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Change email
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRequestOTP}
                                    disabled={isLoading}
                                    className="block w-full text-sm text-gray-600 hover:text-black transition-colors disabled:opacity-50"
                                >
                                    Didn't receive OTP? Resend
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
