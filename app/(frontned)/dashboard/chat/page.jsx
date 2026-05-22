'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/app/(backend)/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import BookingChatPanel from '@/app/components/chat/BookingChatPanel';
import { MessageSquare, Search, ArrowLeft, Clock3, MessageSquarePlus } from 'lucide-react';

const ChatInboxPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedBookingIDFromQuery = searchParams.get('bookingID');
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedBookingLoading, setSelectedBookingLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBookingID, setSelectedBookingID] = useState(selectedBookingIDFromQuery || '');

    useEffect(() => {
        setSelectedBookingID(selectedBookingIDFromQuery || '');
    }, [selectedBookingIDFromQuery]);

    useEffect(() => {
        const loadBooking = async () => {
            if (!selectedBookingIDFromQuery || !user?.uid) return;

            setSelectedBookingLoading(true);
            try {
                const res = await fetch(`/api/booking/${encodeURIComponent(selectedBookingIDFromQuery)}`);
                const data = await res.json();
                if (data.success && data.booking) {
                    setSelectedBooking(data.booking);
                    return;
                }

                setSelectedBooking(null);
            } catch (error) {
                console.error('Error loading booking for chat:', error);
                setSelectedBooking(null);
            } finally {
                setSelectedBookingLoading(false);
            }
        };

        loadBooking();
    }, [selectedBookingIDFromQuery, user?.uid]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (u) {
                fetchChats(u.uid);
            } else {
                setLoading(false);
            }
        });
        return unsub;
    }, []);

    const fetchChats = async (uid) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/chat?userID=${encodeURIComponent(uid)}`);
            const data = await res.json();
            if (data.success) {
                setChats(data.chats || []);
                if (!selectedBookingIDFromQuery && data.chats?.length) {
                    setSelectedBookingID(data.chats[0].bookingID);
                    router.replace(`/dashboard/chat?bookingID=${encodeURIComponent(data.chats[0].bookingID)}`);
                } else if (selectedBookingIDFromQuery) {
                    const existingChat = (data.chats || []).find((chat) => chat.bookingID === selectedBookingIDFromQuery);
                    if (existingChat?.booking) {
                        setSelectedBooking(existingChat.booking);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredChats = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        if (!normalized) return chats;

        return chats.filter((chat) => {
            const serviceTitle = chat.booking?.service?.title || '';
            const requesterName = chat.booking?.requester?.displayName || '';
            const providerName = chat.booking?.provider?.displayName || '';
            const latestMessage = chat.latestMessage?.message || '';
            return [serviceTitle, requesterName, providerName, latestMessage].some((value) => value.toLowerCase().includes(normalized));
        });
    }, [chats, searchTerm]);

    const selectedChat = useMemo(() => filteredChats.find((chat) => chat.bookingID === selectedBookingID) || chats.find((chat) => chat.bookingID === selectedBookingID) || null, [filteredChats, chats, selectedBookingID]);
    const selectedThreadBooking = selectedChat?.booking || selectedBooking;

    const openChat = (bookingID) => {
        setSelectedBookingID(bookingID);
        setSelectedBooking(chats.find((chat) => chat.bookingID === bookingID)?.booking || null);
        router.push(`/dashboard/chat?bookingID=${encodeURIComponent(bookingID)}`);
    };

    if (loading) {
        return <div className="py-20 text-center text-slate-500">Loading chats...</div>;
    }

    return (
        <div className="min-h-[calc(100vh-6rem)] space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                            <MessageSquare size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-600">Messages</p>
                            <h1 className="text-3xl font-black text-slate-900">Chat Inbox</h1>
                            <p className="text-sm text-slate-500">Open a conversation to continue chatting with the same person or review past bookings.</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <Search size={18} className="text-slate-400" />
                    <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search by service, person, or message..."
                        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Conversations</p>
                    </div>

                    <div className="max-h-[72vh] overflow-y-auto">
                        {filteredChats.length === 0 ? (
                            <div className="px-5 py-10 text-center text-slate-500">
                                <MessageSquarePlus size={34} className="mx-auto mb-3 text-slate-300" />
                                <p className="font-semibold text-slate-900">No conversations found</p>
                                <p className="mt-1 text-sm text-slate-500">You will see previous booking chats here once you start messaging.</p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => {
                                const isActive = chat.bookingID === selectedBookingID;
                                const otherParticipant = user?.uid === chat.booking?.requesterID ? chat.booking?.provider : chat.booking?.requester;
                                return (
                                    <button
                                        key={chat._id}
                                        type="button"
                                        onClick={() => openChat(chat.bookingID)}
                                        className={`w-full border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${isActive ? 'bg-blue-50/70' : 'bg-white'}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black text-slate-900">{chat.booking?.service?.title || 'Booking chat'}</p>
                                                <p className="mt-1 truncate text-sm text-slate-600">With {otherParticipant?.displayName || otherParticipant?.email || 'Partner'}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                                                <Clock3 size={12} />
                                                <span>{chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleDateString() : 'New'}</span>
                                            </div>
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                                            {chat.latestMessage?.message || (chat.latestMessage?.fileLinks?.length ? 'Attachment only' : 'No message preview')}
                                        </p>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <div>
                    {selectedBookingLoading ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-20 text-center text-slate-500 shadow-sm">
                            Loading conversation...
                        </div>
                    ) : selectedThreadBooking && user ? (
                        <BookingChatPanel booking={selectedThreadBooking} currentUser={user} />
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-20 text-center text-slate-500 shadow-sm">
                            <MessageSquare size={42} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-lg font-bold text-slate-900">Pick a conversation</p>
                            <p className="mt-2 text-sm text-slate-500">Select a previous booking thread from the list to continue the chat.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatInboxPage;