'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, CheckCheck, Clock, X, RefreshCw, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Message {
    _id?: string;
    sender: 'user' | 'admin';
    text: string;
    createdAt: string;
    readByAdmin?: boolean;
    readByUser?: boolean;
}

interface Chat {
    _id: string;
    userName: string;
    userEmail: string;
    messages: Message[];
    status: 'open' | 'replied' | 'closed';
    unreadByAdmin: number;
    lastMessageAt: string;
    user?: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
        phone?: string;
    };
}

const AdminChats: React.FC = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [totalUnread, setTotalUnread] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    });

    const fetchChats = useCallback(async (silent = false) => {
        if (!token) return;
        if (!silent) setIsLoading(true);
        try {
            const params = new URLSearchParams({ limit: '50' });
            if (statusFilter) params.set('status', statusFilter);
            const res = await fetch(`${API_URL}/chat/admin/all?${params}`, { headers: authHeaders() });
            const data = await res.json();
            if (data.ok) {
                setChats(data.chats);
                setTotalUnread(data.totalUnread || 0);
            }
        } catch (err) {
            if (!silent) setError('Failed to load chats');
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [token, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchChatById = useCallback(async (chatId: string) => {
        if (!token) return;
        setIsLoadingChat(true);
        try {
            const res = await fetch(`${API_URL}/chat/admin/${chatId}`, { headers: authHeaders() });
            const data = await res.json();
            if (data.ok) {
                setSelectedChat(data.chat);
                // Update unread count in list
                setChats(prev => prev.map(c => c._id === chatId ? { ...c, unreadByAdmin: 0 } : c));
            }
        } catch (err) {
            setError('Failed to load chat');
        } finally {
            setIsLoadingChat(false);
        }
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    // Poll for updates
    useEffect(() => {
        fetchChats();
        pollRef.current = setInterval(() => fetchChats(true), 10000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [fetchChats]);

    // Re-fetch selected chat when list refreshes
    useEffect(() => {
        if (selectedChat) {
            const updated = chats.find(c => c._id === selectedChat._id);
            if (updated && updated.unreadByAdmin > 0) {
                fetchChatById(selectedChat._id);
            }
        }
    }, [chats]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat?.messages]);

    const handleSelectChat = (chat: Chat) => {
        setSelectedChat(null);
        fetchChatById(chat._id);
        setReplyText('');
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedChat || isSending) return;
        const text = replyText.trim();
        setReplyText('');
        setIsSending(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/chat/admin/${selectedChat._id}/reply`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            if (data.ok) {
                setSelectedChat(data.chat);
                setChats(prev => prev.map(c => c._id === selectedChat._id
                    ? { ...c, status: 'replied', lastMessageAt: new Date().toISOString() }
                    : c
                ));
            } else {
                setError(data.error || 'Failed to send reply');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleCloseChat = async (chatId: string) => {
        if (!confirm('Close this chat session?')) return;
        try {
            const res = await fetch(`${API_URL}/chat/admin/${chatId}/close`, {
                method: 'PATCH',
                headers: authHeaders()
            });
            const data = await res.json();
            if (data.ok) {
                setChats(prev => prev.map(c => c._id === chatId ? { ...c, status: 'closed' } : c));
                if (selectedChat?._id === chatId) {
                    setSelectedChat(prev => prev ? { ...prev, status: 'closed' } : null);
                }
            }
        } catch (err) {
            setError('Failed to close chat');
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            if (diff < 60000) return 'just now';
            if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
            if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        } catch { return ''; }
    };

    const formatFullTime = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        } catch { return ''; }
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            open: 'bg-green-100 text-green-700',
            replied: 'bg-blue-100 text-blue-700',
            closed: 'bg-gray-100 text-gray-500'
        };
        return styles[status] || 'bg-gray-100 text-gray-500';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                id="admin-chats-back-btn"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-purple-600" />
                                <h1 className="text-xl font-bold text-gray-900">Live Chat Management</h1>
                                {totalUnread > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {totalUnread} new
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => fetchChats()}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
                        {error}
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                )}

                <div className="flex gap-6 h-[calc(100vh-160px)]">
                    {/* ── Chat List ──────────────────────────────────────────── */}
                    <div className="w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                        {/* Filter */}
                        <div className="p-3 border-b border-gray-100">
                            <select
                                value={statusFilter}
                                onChange={e => { setStatusFilter(e.target.value); }}
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:border-purple-400"
                                id="chat-status-filter"
                            >
                                <option value="">All Chats</option>
                                <option value="open">Open</option>
                                <option value="replied">Replied</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        {/* Chat list */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                </div>
                            ) : chats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                                    <MessageSquare className="w-10 h-10 mb-2 opacity-30" />
                                    <p className="text-sm">No chats yet</p>
                                </div>
                            ) : (
                                chats.map(chat => (
                                    <button
                                        key={chat._id}
                                        onClick={() => handleSelectChat(chat)}
                                        className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedChat?._id === chat._id ? 'bg-purple-50 border-l-2 border-l-purple-500' : ''}`}
                                        id={`chat-item-${chat._id}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{chat.userName}</p>
                                                    <p className="text-xs text-gray-500 truncate">{chat.userEmail}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(chat.status)}`}>
                                                    {chat.status}
                                                </span>
                                                {chat.unreadByAdmin > 0 && (
                                                    <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                                        {chat.unreadByAdmin}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-1.5 ml-11">
                                            <p className="text-xs text-gray-500 truncate">
                                                {chat.messages[chat.messages.length - 1]?.text}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatTime(chat.lastMessageAt)}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── Chat Detail ────────────────────────────────────────── */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                        {!selectedChat ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Select a chat to view</p>
                                <p className="text-sm">Click a conversation from the list on the left</p>
                            </div>
                        ) : (
                            <>
                                {/* Chat Header */}
                                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{selectedChat.userName}</p>
                                            <p className="text-xs text-gray-500">{selectedChat.userEmail}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(selectedChat.status)}`}>
                                            {selectedChat.status}
                                        </span>
                                    </div>
                                    {selectedChat.status !== 'closed' && (
                                        <button
                                            onClick={() => handleCloseChat(selectedChat._id)}
                                            className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg hover:border-red-200 transition-colors"
                                            id="admin-chat-close-btn"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                            Close Chat
                                        </button>
                                    )}
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-3" style={{ background: '#fafafa' }}>
                                    {isLoadingChat ? (
                                        <div className="flex justify-center items-center h-full">
                                            <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        <>
                                            {selectedChat.messages.map((msg, idx) => (
                                                <div
                                                    key={msg._id || idx}
                                                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'gap-2.5'}`}
                                                >
                                                    {msg.sender === 'user' && (
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                                                            <User className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col max-w-[70%]">
                                                        <div
                                                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender === 'admin'
                                                                ? 'bg-purple-600 text-white rounded-br-none'
                                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                                                }`}
                                                        >
                                                            {msg.text}
                                                        </div>
                                                        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${msg.sender === 'admin' ? 'justify-end' : ''}`}>
                                                            <span>{formatFullTime(msg.createdAt)}</span>
                                                            {msg.sender === 'admin' && (
                                                                <CheckCheck className={`w-3.5 h-3.5 ${msg.readByUser ? 'text-blue-400' : 'text-gray-300'}`} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    {msg.sender === 'admin' && (
                                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                                                            <span className="text-xs font-bold text-purple-600">A</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Reply Box */}
                                {selectedChat.status !== 'closed' ? (
                                    <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
                                        <div className="flex gap-3">
                                            <textarea
                                                id="admin-chat-reply-input"
                                                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100"
                                                placeholder="Type your reply..."
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendReply();
                                                    }
                                                }}
                                                rows={2}
                                            />
                                            <button
                                                id="admin-chat-reply-btn"
                                                onClick={handleSendReply}
                                                disabled={!replyText.trim() || isSending}
                                                className="flex-shrink-0 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl transition-colors flex items-center gap-2 font-medium text-sm"
                                            >
                                                {isSending ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                                Send Reply
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Enter to send · Shift+Enter for new line · User will be notified by email
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-sm text-gray-500">
                                        This chat has been closed.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminChats;
