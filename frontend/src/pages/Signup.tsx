import React, { useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, UserPlus } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Validation State
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
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
            );
        }
    }, { scope: containerRef });

    // Validation Logic
    const validateEmail = (email: string) => {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    };

    const validatePhone = (phone: string) => {
        if (!phone) return true; // Optional
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

    const getStrengthText = (score: number) => {
        if (score === 0) return '';
        if (score < 3) return 'Weak';
        if (score < 4) return 'Medium';
        return 'Strong';
    };

    const isFormValid = useMemo(() => {
        return (
            name.length >= 2 &&
            validateEmail(email) &&
            validatePhone(phone) &&
            passwordStrength >= 3 && // Require at least medium strength
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
            setError('Please fix the errors in the form before submitting.');
            return;
        }

        setIsLoading(true);

        try {
            await register(name, email, password, phone);
            navigate('/profile');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen pt-24 pb-20 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-md mx-auto px-4">
                <div ref={formRef} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
                        <p className="text-gray-600">Join us today</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5 text-red-500">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onBlur={() => handleBlur('name')}
                                    className={`w-full pl-11 pr-4 py-3 border ${touched.name && name.length < 2 ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            {touched.name && name.length < 2 && (
                                <p className="mt-1 text-xs text-red-500">Name must be at least 2 characters long.</p>
                            )}
                        </div>

                        {/* Email */}
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
                                    onBlur={() => handleBlur('email')}
                                    className={`w-full pl-11 pr-4 py-3 border ${touched.email && !validateEmail(email) ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            {touched.email && !validateEmail(email) && (
                                <p className="mt-1 text-xs text-red-500">Please enter a valid email address.</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number (Optional)
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    onBlur={() => handleBlur('phone')}
                                    className={`w-full pl-11 pr-4 py-3 border ${touched.phone && !validatePhone(phone) ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            {touched.phone && !validatePhone(phone) && (
                                <p className="mt-1 text-xs text-red-500">Please enter a valid phone number (digits only).</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    className={`w-full pl-11 pr-12 py-3 border ${touched.password && passwordStrength < 3 ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                                    placeholder="Create a strong password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Strength Meter */}
                            <div className="mt-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-gray-500">Strength</span>
                                    <span className={`text-xs font-medium ${passwordStrength < 3 ? 'text-red-500' :
                                        passwordStrength < 4 ? 'text-yellow-500' : 'text-green-500'
                                        }`}>
                                        {getStrengthText(passwordStrength)}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="mt-1.5 text-xs text-gray-500">
                                    Must contain at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                                </p>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => handleBlur('confirmPassword')}
                                    className={`w-full pl-11 pr-12 py-3 border ${touched.confirmPassword && password !== confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-black'} rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {touched.confirmPassword && password !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 bg-black text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${isLoading || !isFormValid ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800 shadow-lg hover:shadow-xl'}`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-black font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
