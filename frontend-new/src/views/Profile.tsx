'use client';
import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, MapPin, Edit2, Save, X,
    Lock, LogOut, Loader2, Camera, ShieldCheck, AlertTriangle
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import OrderHistory from '../components/OrderHistory';

const Profile: React.FC = () => {
    const { user, logout, updateProfile, changePassword } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isResendingVerification, setIsResendingVerification] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [street, setStreet] = useState(user?.address?.street || '');
    const [city, setCity] = useState(user?.address?.city || '');
    const [state, setState] = useState(user?.address?.state || '');
    const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
    const [country, setCountry] = useState(user?.address?.country || '');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const containerRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (profileRef.current) {
            gsap.fromTo(profileRef.current.children,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, { scope: containerRef });

    if (!user) {
        return null; // ProtectedRoute will handle redirect
    }

    const handleSaveProfile = async () => {
        setError('');
        setSuccess('');
        setIsSaving(true);

        try {
            await updateProfile({
                name,
                phone,
                address: {
                    street,
                    city,
                    state,
                    postalCode,
                    country
                }
            });
            setSuccess('Profile updated successfully.');
            setIsEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setIsSaving(true);

        try {
            await changePassword(currentPassword, newPassword);
            setSuccess('Password changed successfully.');
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to change password.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResendVerification = async () => {
        if (!user || (user as any).emailVerified) return;
        
        setIsResendingVerification(true);
        setError('');
        setSuccess('');
        
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`${API_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok && data.ok) {
                setSuccess('Verification email sent. Please check your inbox.');
                setTimeout(() => setSuccess(''), 5000);
            } else {
                setError(data.error || 'Failed to send verification email.');
            }
        } catch (err: any) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsResendingVerification(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div ref={containerRef} className="min-h-[calc(100vh-134px)] py-10 bg-gray-50 font-sans text-gray-900">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Error/Success Messages Sticky Top */}
                {(error || success) && (
                    <div className="mb-6 animate-fade-in">
                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-medium">
                                {success}
                            </div>
                        )}
                    </div>
                )}

                <div ref={profileRef} className="space-y-8">
                    
                    {/* Header Card */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-8 sm:p-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
                                <div className="relative group cursor-pointer">
                                    <div className="w-28 h-28 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-800 text-4xl font-serif font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="absolute inset-0 bg-black/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-gray-700" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{user.name}</h1>
                                    <p className="text-gray-500">{user.email}</p>
                                    
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2 text-sm font-medium">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md capitalize border border-gray-200">
                                            {user.role}
                                        </span>
                                        {(user as any).emailVerified ? (
                                            <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-md border border-green-200">
                                                <ShieldCheck className="w-4 h-4" /> Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                                                <AlertTriangle className="w-4 h-4" /> Unverified Email
                                            </span>
                                        )}
                                        {(user as any).phoneVerified && (
                                            <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-md border border-green-200">
                                                Phone Verified
                                            </span>
                                        )}
                                    </div>
                                    
                                    {!(user as any).emailVerified && (
                                        <button
                                            onClick={handleResendVerification}
                                            disabled={isResendingVerification}
                                            className="mt-3 text-sm text-black font-semibold hover:underline decoration-1 underline-offset-2 disabled:opacity-50 disabled:no-underline"
                                        >
                                            {isResendingVerification ? 'Sending link...' : 'Resend verification link'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors text-sm font-semibold border border-red-100"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign out
                            </button>
                        </div>
                    </div>

                    {/* Profile Information List */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-gray-900">Personal Information</h2>
                                <p className="text-sm text-gray-500 mt-1">Update your photo and personal details here.</p>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email address</label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-gray-500 cursor-not-allowed text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Phone number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200"
                                    />
                                </div>
                                <div className="md:col-span-2 mt-4 pb-2 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Address details</h3>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Street address</label>
                                    <input
                                        type="text"
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">State / Province</label>
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">ZIP / Postal code</label>
                                    <input
                                        type="text"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Country</label>
                                    <input
                                        type="text"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-gray-900">Security</h2>
                                <p className="text-sm text-gray-500 mt-1">Manage your password and security settings.</p>
                            </div>
                            {!isChangingPassword && (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
                                >
                                    Update
                                </button>
                            )}
                        </div>

                        {isChangingPassword ? (
                            <form onSubmit={handleChangePassword} className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="md:col-span-2 max-w-md">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Current password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="max-w-md">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">New password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="max-w-md">
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm new password</label>
                                        <input
                                            type="password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-colors text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex gap-3 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsChangingPassword(false);
                                                setCurrentPassword('');
                                                setNewPassword('');
                                                setConfirmNewPassword('');
                                            }}
                                            className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                            Save Password
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="p-8">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm mb-1">Password</p>
                                        <p className="text-gray-500 text-sm">Last changed 3 months ago (placeholder)</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Orders Section */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                         <div className="px-8 py-6 border-b border-gray-200 bg-gray-50/50">
                            <h2 className="text-xl font-bold tracking-tight text-gray-900">Order History</h2>
                            <p className="text-sm text-gray-500 mt-1">View and track your previous orders.</p>
                        </div>
                        <div className="p-8">
                            <OrderHistory />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
