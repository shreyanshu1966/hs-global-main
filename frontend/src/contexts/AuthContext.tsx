import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    phoneVerified?: boolean;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    role: string;
    avatar?: string;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedToken = localStorage.getItem('authToken');
                const storedUser = localStorage.getItem('authUser');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));

                    // Verify token is still valid by fetching profile
                    try {
                        const response = await fetch(`${API_URL}/auth/profile`, {
                            headers: {
                                'Authorization': `Bearer ${storedToken}`
                            }
                        });

                        if (response.ok) {
                            const data = await response.json();
                            if (data.ok && data.user) {
                                setUser(data.user);
                                localStorage.setItem('authUser', JSON.stringify(data.user));
                            }
                        } else {
                            // Token invalid, clear auth
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('authUser');
                            setToken(null);
                            setUser(null);
                        }
                    } catch (error) {
                        console.error('Error verifying token:', error);
                    }
                }
            } catch (error) {
                console.error('Error loading user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.error || 'Login failed');
            }

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUser', JSON.stringify(data.user));
        } catch (error: any) {
            throw new Error(error.message || 'Login failed');
        }
    };

    const register = async (name: string, email: string, password: string, phone?: string) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, phone })
            });

            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authUser', JSON.stringify(data.user));
        } catch (error: any) {
            throw new Error(error.message || 'Registration failed');
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');

        // Call logout endpoint (optional, for cookie cleanup)
        fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(() => { });
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
                throw new Error(result.error || 'Profile update failed');
            }

            setUser(result.user);
            localStorage.setItem('authUser', JSON.stringify(result.user));
        } catch (error: any) {
            throw new Error(error.message || 'Profile update failed');
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        if (!token) throw new Error('Not authenticated');

        try {
            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const result = await response.json();

            if (!response.ok || !result.ok) {
                throw new Error(result.error || 'Password change failed');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Password change failed');
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
