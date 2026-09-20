'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Message {
    _id?: string;
    sender: 'user' | 'admin';
    text: string;
    createdAt: string;
    readByUser?: boolean;
}

interface Chat {
    _id: string;
    messages: Message[];
    status: 'open' | 'replied' | 'closed';
    unreadByUser?: number;
}

// ─── Clean Minimal SVG Icons ────────────────────────────────────────────────
const ChatIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform duration-300 hover:translate-x-1 hover:-translate-y-1">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 transition-transform duration-300 hover:rotate-90">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const MinimizeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const QUICK_REPLIES = [
    "What's your MOQ & pricing?",
    "Can you customize designs for us?",
    "What are your shipping & export terms?",
    "Can you handle large bulk/wholesale orders?"
];

const QuickReplyChips: React.FC<{ onSelect: (text: string) => void }> = ({ onSelect }) => (
    <div className="flex flex-wrap gap-2">
        {QUICK_REPLIES.map((q) => (
            <button
                key={q}
                type="button"
                onClick={() => onSelect(q)}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-left transition-colors duration-200 hover:bg-[#EFEAE2]"
                style={{ background: '#FAF8F5', border: '1px solid #E8E3DC', color: '#2B2B2B' }}
            >
                {q}
            </button>
        ))}
    </div>
);

const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 text-[#6B6B6B]">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const FloatingChatbot: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [showTeaser, setShowTeaser] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchChat = useCallback(async (silent = false) => {
        if (!isAuthenticated) return;
        if (!silent) setIsLoadingChat(true);
        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/chat/my-chat`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.ok) {
                setChat(data.chat);
                if (data.chat?.unreadByUser > 0) {
                    setHasUnread(true);
                }
            }
        } catch (err) {
            console.error('Error fetching chat:', err);
        } finally {
            if (!silent) setIsLoadingChat(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            fetchChat();
            pollIntervalRef.current = setInterval(() => fetchChat(true), 8000);
        } else {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [isOpen, isAuthenticated, fetchChat]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const interval = setInterval(() => fetchChat(true), 30000);
        fetchChat(true);
        return () => clearInterval(interval);
    }, [isAuthenticated, fetchChat]);

    useEffect(() => {
        scrollToBottom();
    }, [chat?.messages]);

    useEffect(() => {
        if (isOpen) {
            setHasUnread(false);
            setShowTeaser(false);
            setTimeout(() => textareaRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Deep-link: automatically open chat when URL has ?openChat=true or ?chat=open
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const searchParams = new URLSearchParams(window.location.search);
        const shouldOpen = searchParams.get('openChat') === 'true' || searchParams.get('chat') === 'open';

        if (shouldOpen) {
            setIsOpen(true);
            if (!isAuthenticated && !isLoading) {
                setShowLoginPrompt(true);
            } else if (isAuthenticated) {
                setShowLoginPrompt(false);
                fetchChat();

                const pendingMessage = localStorage.getItem('pendingChatMessage');
                if (pendingMessage) {
                    setInputText(pendingMessage);
                    localStorage.removeItem('pendingChatMessage');
                    setTimeout(() => textareaRef.current?.focus(), 300);
                }
            }

            // Clean up the URL parameter without page reload
            searchParams.delete('openChat');
            searchParams.delete('chat');
            const newSearch = searchParams.toString();
            const cleanUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
            window.history.replaceState({}, '', cleanUrl);
        }
    }, [isAuthenticated, isLoading, fetchChat]);

    // Greeting teaser bubble: shown once until dismissed or chat is opened (per browser session)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.location.pathname.startsWith('/admin')) return;
        try {
            if (sessionStorage.getItem('chatTeaserDismissed')) return;
        } catch { /* ignore */ }
        const timer = setTimeout(() => setShowTeaser(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const dismissTeaser = () => {
        setShowTeaser(false);
        try { sessionStorage.setItem('chatTeaserDismissed', '1'); } catch { /* ignore */ }
    };

    const handleToggle = () => {
        if (showTeaser) dismissTeaser();
        if (!isAuthenticated && !isLoading) {
            setShowLoginPrompt(true);
            setIsOpen(true);
        } else {
            setShowLoginPrompt(false);
            setIsOpen(prev => !prev);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || isSending) return;
        const text = inputText.trim();
        setInputText('');
        setIsSending(true);
        setError(null);

        const optimisticMsg: Message = {
            sender: 'user',
            text,
            createdAt: new Date().toISOString()
        };
        setChat(prev => prev
            ? { ...prev, messages: [...prev.messages, optimisticMsg] }
            : { _id: 'temp', messages: [optimisticMsg], status: 'open' }
        );

        try {
            const token = localStorage.getItem('authToken');
            const res = await fetch(`${API_URL}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            if (data.ok) {
                setChat(data.chat);
            } else {
                setError(data.error || 'Failed to send message');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleQuickReplyPreAuth = (text: string) => {
        localStorage.setItem('pendingChatMessage', text);
        window.location.href = `/login?redirect=${encodeURIComponent('/?openChat=true')}`;
    };

    const handleQuickReplyPostAuth = (text: string) => {
        setInputText(text);
        setTimeout(() => textareaRef.current?.focus(), 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <>
            <style>{`
                @keyframes chatSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes dotBounce {
                    0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
                    40% { transform: translateY(-4px); opacity: 1; }
                }
                @keyframes teaserPop {
                    from { opacity: 0; transform: translateX(8px) scale(0.95); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }
                .teaser-bubble {
                    animation: teaserPop 0.35s cubic-bezier(0.25, 1, 0.5, 1);
                }
                
                .chat-window {
                    animation: chatSlideUp 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                    overscroll-behavior: contain;
                    height: min(560px, calc(100vh - 180px));
                    height: min(560px, calc(100dvh - 180px));
                }
                .chat-fab {
                    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                }
                .chat-fab:hover {
                    transform: scale(1.05) translateY(-2px);
                }
                
                .msg-bubble {
                    animation: chatSlideUp 0.2s ease-out backwards;
                }
                .typing-dot { 
                    animation: dotBounce 1.4s ease-in-out infinite; 
                }
                .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                
                .chat-scrollbar::-webkit-scrollbar { width: 4px; }
                .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .chat-scrollbar::-webkit-scrollbar-thumb { 
                    background: #E5E5E5; 
                    border-radius: 4px; 
                }
                .chat-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: #9CA3AF; 
                }
                
                .chat-input { resize: none; outline: none; }
                .chat-input::placeholder { color: #9CA3AF; font-weight: 400; }
            `}</style>

            {/* ─── Floating Action Button ──────────────────────────────────────── */}
            <div className="fixed bottom-8 right-4 sm:bottom-10 sm:right-6 z-50" id="chat-fab-container">
                {/* ─── Greeting Teaser Bubble ──────────────────────────────────── */}
                {showTeaser && !isOpen && (
                    <div className="absolute right-[68px] sm:right-[76px] bottom-0 h-14 flex items-center pointer-events-none">
                        <div
                            className="teaser-bubble pointer-events-auto relative flex items-start gap-2.5 pl-2.5 pr-7 py-2.5 rounded-2xl cursor-pointer max-w-[calc(100vw-110px)] sm:max-w-[250px] bg-white"
                            style={{
                                border: '1px solid #E8E3DC',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                            }}
                            onClick={handleToggle}
                            role="button"
                            aria-label="Open chat: Ask us anything about customization, shipping, or pricing"
                        >
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-[#FAF8F5] text-[#2B2B2B] border border-[#E8E3DC]"
                            >
                                HS
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-[#1C1C1C] leading-tight">Hi there! 👋</p>
                                <p className="text-[12px] mt-0.5 text-[#6B6B6B] leading-snug">
                                    Ask us anything about customization, shipping, or pricing.
                                </p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); dismissTeaser(); }}
                                aria-label="Dismiss"
                                className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-[#9CA3AF] hover:text-[#2B2B2B] hover:bg-[#FAF8F5] transition-colors"
                            >
                                ✕
                            </button>
                            <div
                                className="absolute top-1/2 -right-[6px] -translate-y-1/2 w-3 h-3 rotate-45 bg-white"
                                style={{ borderRight: '1px solid #E8E3DC', borderBottom: '1px solid #E8E3DC' }}
                            />
                        </div>
                    </div>
                )}

                <button
                    id="chat-fab-btn"
                    onClick={handleToggle}
                    className={`chat-fab relative flex items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)]`}
                    style={{
                        background: '#2B2B2B', // primary color
                        border: '2px solid #FFFFFF'
                    }}
                    aria-label="Chat with our export team"
                >
                    <div style={{ color: '#FFFFFF' }} className="flex items-center justify-center">
                        {isOpen ? <CloseIcon /> : <ChatIcon />}
                    </div>

                    {/* Unread badge */}
                    {hasUnread && !isOpen && (
                        <span
                            className="absolute w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ 
                                background: '#EF4444', // Red for notification
                                fontSize: '10px',
                                top: '0px',
                                right: '0px',
                                border: '2px solid #2B2B2B'
                            }}
                        >
                            !
                        </span>
                    )}
                </button>

                {/* ─── Chat Window ─────────────────────────────────────────────── */}
                {isOpen && (
                    <div
                        className="chat-window absolute bottom-[calc(100%+16px)] right-0 origin-bottom-right flex flex-col rounded-xl overflow-hidden bg-white"
                        style={{
                            width: 'min(360px, calc(100vw - 32px))',
                            boxShadow: '0 20px 40px rgba(43, 43, 43, 0.15)',
                            border: '1px solid #E8E3DC'
                        }}
                        id="chat-window"
                    >
                        {/* Header */}
                        <div 
                            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                            style={{ background: '#2B2B2B', color: '#FFFFFF' }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 bg-white text-[#2B2B2B]"
                                >
                                    HS
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[15px] tracking-wide leading-tight">
                                        HS Global Export Team
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                                        <span className="text-xs font-medium text-gray-300">Export Executive · Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-full transition-colors hover:bg-[rgba(255,255,255,0.1)] text-white"
                                aria-label="Minimize chat"
                            >
                                <MinimizeIcon />
                            </button>
                        </div>

                        {/* Content Area */}
                        {!isAuthenticated ? (
                            /* ── Login Gate ────────────────────────────────────── */
                            <div data-lenis-prevent className="flex flex-col items-center justify-center flex-1 p-8 text-center bg-[#FAF8F5] overflow-y-auto overscroll-contain">
                                <div className="mb-6">
                                    <LockIcon />
                                </div>
                                <h3 className="text-[#1C1C1C] font-semibold text-xl mb-2">Talk to an Export Executive</h3>
                                <p className="text-[14px] mb-6 text-[#4A4A4A] leading-relaxed">
                                    Sign in to start chatting with our team about customization, shipping, or pricing.
                                </p>
                                <div className="mb-6">
                                    <p className="text-[12px] mb-2 text-[#9CA3AF] font-medium">Quick questions to get started:</p>
                                    <QuickReplyChips onSelect={handleQuickReplyPreAuth} />
                                </div>
                                <a
                                    href={`/login?redirect=${encodeURIComponent('/?openChat=true')}`}
                                    id="chat-login-btn"
                                    className="block w-full py-3 px-6 rounded-lg text-center text-[14px] font-medium transition-all duration-200"
                                    style={{
                                        background: '#2B2B2B',
                                        color: '#FFFFFF'
                                    }}
                                >
                                    Sign In
                                </a>
                                <p className="text-[13px] mt-4 text-[#6B6B6B]">
                                    New here?{' '}
                                    <a href={`/signup?redirect=${encodeURIComponent('/?openChat=true')}`} className="text-[#2B2B2B] font-medium underline underline-offset-2">Register now</a>
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* ── Messages Area ──────────────────────────────── */}
                                <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4 chat-scrollbar bg-[#FAF8F5]" id="chat-messages">
                                    
                                    {isLoadingChat ? (
                                        <div className="flex justify-center items-center h-full">
                                            <div className="flex gap-1.5 p-3 rounded-full bg-white border border-[#E8E3DC]">
                                                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#6B6B6B]"></span>
                                                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#6B6B6B]"></span>
                                                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#6B6B6B]"></span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Welcome message */}
                                            <div className="msg-bubble flex gap-2.5 mb-2" style={{ animationDelay: '0.1s' }}>
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-auto bg-white text-[#2B2B2B] border border-[#E8E3DC]"
                                                >HS</div>
                                                <div
                                                    className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-[14px] max-w-[85%] leading-relaxed bg-white text-[#1C1C1C] border border-[#E8E3DC]"
                                                >
                                                    Hi {user?.name?.split(' ')[0]}! Ask us anything about customization, shipping, or pricing.
                                                </div>
                                            </div>

                                            {/* Quick replies (only before the conversation has started) */}
                                            {(!chat?.messages || chat.messages.length === 0) && (
                                                <div className="msg-bubble pl-[38px]" style={{ animationDelay: '0.2s' }}>
                                                    <QuickReplyChips onSelect={handleQuickReplyPostAuth} />
                                                </div>
                                            )}

                                            {/* Chat messages */}
                                            {chat?.messages?.map((msg, idx) => (
                                                <div
                                                    key={msg._id || idx}
                                                    className={`msg-bubble flex ${msg.sender === 'user' ? 'justify-end' : 'gap-2.5'} group`}
                                                    style={{ animationDelay: `${(idx % 10) * 0.05}s` }}
                                                >
                                                    {msg.sender === 'admin' && (
                                                        <div
                                                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-auto bg-white text-[#2B2B2B] border border-[#E8E3DC]"
                                                        >HS</div>
                                                    )}
                                                    <div className="flex flex-col max-w-[85%]">
                                                        <div
                                                            className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${msg.sender === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                                                            style={msg.sender === 'user'
                                                                ? {
                                                                    background: '#2B2B2B',
                                                                    color: '#FFFFFF'
                                                                }
                                                                : {
                                                                    background: '#FFFFFF',
                                                                    color: '#1C1C1C',
                                                                    border: '1px solid #E8E3DC'
                                                                }
                                                            }
                                                        >
                                                            {msg.text}
                                                        </div>
                                                        <span
                                                            className={`text-[10px] mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#9CA3AF] ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}
                                                        >
                                                            {formatTime(msg.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Sending indicator */}
                                            {isSending && (
                                                <div className="flex gap-2.5">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-auto bg-white text-[#2B2B2B] border border-[#E8E3DC]">HS</div>
                                                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center bg-white border border-[#E8E3DC]">
                                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span>
                                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span>
                                                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Error */}
                                            {error && (
                                                <div className="text-center text-xs py-2 px-3 rounded-lg bg-red-50 text-red-600 border border-red-100">
                                                    {error}
                                                </div>
                                            )}

                                            {/* Awaiting reply notice */}
                                            {chat?.status === 'open' && !isSending && (chat?.messages?.length || 0) > 0 && (
                                                <div className="text-center mt-4 mb-2">
                                                    <span className="text-[11px] px-3 py-1 rounded-full font-medium text-[#6B6B6B] bg-[#E8E3DC]">
                                                        We'll get back to you personally, shortly
                                                    </span>
                                                </div>
                                            )}

                                            <div ref={messagesEndRef} className="h-1" />
                                        </>
                                    )}
                                </div>

                                {/* ── Input Area ───────────────────────────────────── */}
                                <div className="bg-white border-t border-[#E8E3DC] p-3 flex-shrink-0">
                                    <div className="flex gap-2 items-end rounded-lg p-1.5 bg-[#FAF8F5] border border-[#E8E3DC] focus-within:border-[#9CA3AF] transition-colors">
                                        <textarea
                                            ref={textareaRef}
                                            id="chat-input"
                                            className="chat-input flex-1 bg-transparent text-[14px] text-[#1C1C1C] leading-relaxed pl-2 py-1.5"
                                            style={{
                                                minHeight: '36px',
                                                maxHeight: '120px',
                                                border: 'none',
                                            }}
                                            placeholder="Ask about customization, shipping, pricing..."
                                            value={inputText}
                                            onChange={e => {
                                                setInputText(e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                            }}
                                            onKeyDown={handleKeyDown}
                                            rows={1}
                                        />
                                        <button
                                            id="chat-send-btn"
                                            onClick={handleSend}
                                            disabled={!inputText.trim() || isSending}
                                            className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center transition-all duration-200"
                                            style={{
                                                background: inputText.trim() && !isSending ? '#2B2B2B' : 'transparent',
                                                color: inputText.trim() && !isSending ? '#FFFFFF' : '#9CA3AF',
                                                cursor: inputText.trim() && !isSending ? 'pointer' : 'not-allowed',
                                            }}
                                            aria-label="Send message"
                                        >
                                            <SendIcon />
                                        </button>
                                    </div>
                                    <div className="text-center mt-2 flex items-center justify-center gap-1.5">
                                        <p className="text-[10px] text-[#9CA3AF]">
                                            Direct line to our export team
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default FloatingChatbot;
