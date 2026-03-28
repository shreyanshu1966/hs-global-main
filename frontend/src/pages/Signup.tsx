import React, { useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { GoogleLogin } from '@react-oauth/google';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { register, googleLogin } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    const [touched, setTouched] = useState({
        name: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false
    });

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

    const validateEmail = (email: string) => {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    };

    const validatePhone = (phone: string) => {
        if (!phone) return false;
        return /^\+?[\d\s-]{10,15}$/.test(phone);
    };

    const getPasswordStrength = (pass: string) => {
        let score = 0;
        if (!pass) return 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[a-z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const passwordStrength = getPasswordStrength(password);

    const getStrengthColor = (score: number) => {
        if (score === 0) return 'bg-gray-200';
        if (score < 3) return 'bg-red-500';
        if (score < 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const isFormValid = useMemo(() => {
        return (
            name.length >= 2 &&
            validateEmail(email) &&
            validatePhone(phone) &&
            passwordStrength >= 3 &&
            password === confirmPassword
        );
    }, [name, email, phone, password, confirmPassword, passwordStrength]);

    const handleBlur = (field: keyof typeof touched) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isFormValid) {
            setTouched({
                name: true,
                email: true,
                phone: true,
                password: true,
                confirmPassword: true
            });
            setError('Please correct the highlighted fields.');
            return;
        }

        setIsLoading(true);

        try {
            await register(name, email, password, phone);
            setRegistrationSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credential: string) => {
        setError('');
        setIsLoading(true);
        try {
            await googleLogin(credential);
            navigate('/profile');
        } catch (err: any) {
            console.error('Google signup error:', err);
            setError(err.message || 'Google authentication failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-[calc(100vh-134px)] flex bg-white font-sans text-gray-900">
            {/* Left Column: Image / Branding */}
            <div className="hidden lg:flex w-1/2 bg-gray-50 flex-col relative overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(30%)' }}>
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
                <div className="relative z-10 p-12 lg:p-16 h-full flex flex-col justify-between text-white">
                    <div>
                        <Link to="/" className="text-2xl font-bold font-serif tracking-tight text-white hover:text-gray-200 transition-colors inline-block">
                            HS Global
                        </Link>
                    </div>
                    <div className="max-w-md">
                        <blockquote className="text-3xl lg:text-4xl font-serif font-medium leading-tight mb-6">
                            "HS Global has redefined how we source materials for our high-end architectural projects."
                        </blockquote>
                        <div className="text-lg font-light text-gray-300">
                            — Design Director, Studio Architects
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-16 relative bg-white overflow-y-auto">
                <div ref={formRef} className="w-full max-w-[420px] py-12">
                    <div className="mb-12 lg:hidden">
                        <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-black">
                            HS Global
                        </Link>
                    </div>

                    {error && !registrationSuccess && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {registrationSuccess ? (
                        <div className="text-left space-y-6">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Check your email</h2>
                                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                    We've sent a verification link to <strong className="text-black font-semibold">{email}</strong>. Please click the link to activate your account.
                                </p>
                            </div>
                            <div className="space-y-4 pt-4">
                                <Link
                                    to="/login"
                                    className="block w-full py-3 bg-black text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors text-center"
                                >
                                    Log in
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-10">
                                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight font-sans">Create an account</h1>
                                <p className="text-gray-500 text-sm">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-black font-semibold hover:underline decoration-1 underline-offset-4">
                                        Log in
                                    </Link>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={() => handleBlur('name')}
                                        className={`w-full px-4 py-3 bg-white border ${touched.name && name.length < 2 ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black focus:border-black'} rounded-md focus:ring-1 outline-none transition-colors text-sm`}
                                        placeholder="Jane Doe"
                                        required
                                    />
                                    {touched.name && name.length < 2 && (
                                        <p className="mt-1.5 text-xs text-red-600 font-medium">Name must be at least 2 characters long.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => handleBlur('email')}
                                        className={`w-full px-4 py-3 bg-white border ${touched.email && !validateEmail(email) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black focus:border-black'} rounded-md focus:ring-1 outline-none transition-colors text-sm`}
                                        placeholder="jane@company.com"
                                        required
                                    />
                                    {touched.email && !validateEmail(email) && (
                                        <p className="mt-1.5 text-xs text-red-600 font-medium">Please enter a valid email address.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        onBlur={() => handleBlur('phone')}
                                        className={`w-full px-4 py-3 bg-white border ${touched.phone && !validatePhone(phone) ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black focus:border-black'} rounded-md focus:ring-1 outline-none transition-colors text-sm`}
                                        placeholder="+1 (555) 000-0000"
                                        required
                                    />
                                    {touched.phone && !validatePhone(phone) && (
                                        <p className="mt-1.5 text-xs text-red-600 font-medium">{phone ? 'Invalid phone format.' : 'Phone number is required.'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onBlur={() => handleBlur('password')}
                                            className={`w-full pl-4 pr-12 py-3 bg-white border ${touched.password && passwordStrength < 3 ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black focus:border-black'} rounded-md focus:ring-1 outline-none transition-colors text-sm`}
                                            placeholder="Create a strong password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="mt-3">
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div 
                                                    key={level} 
                                                    className={`h-1 flex-1 rounded-full ${passwordStrength >= level ? getStrengthColor(passwordStrength).replace('bg-','') + ' bg-current text-' + getStrengthColor(passwordStrength).replace('bg-','') : 'bg-gray-200'}`}
                                                ></div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">
                                            Minimum 8 chars with uppercase, lowercase, numbers & symbols
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            onBlur={() => handleBlur('confirmPassword')}
                                            className={`w-full pl-4 pr-12 py-3 bg-white border ${touched.confirmPassword && password !== confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-black focus:border-black'} rounded-md focus:ring-1 outline-none transition-colors text-sm`}
                                            placeholder="Confirm your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {touched.confirmPassword && password !== confirmPassword && (
                                        <p className="mt-1.5 text-xs text-red-600 font-medium">Passwords do not match.</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 mt-4 bg-black text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 ${isLoading || !isFormValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </form>
                            
                            <div className="mt-8 mb-6 relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-400 text-xs uppercase tracking-wider">Or continue with</span>
                                </div>
                            </div>

                            <div className="flex justify-center w-full [&>div]:w-full mb-6">
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
                            
                            <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
                                By signing up, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signup;
