'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, Send, MessageSquare, Loader2, X, ArrowDown } from 'lucide-react';
import Swal from 'sweetalert2';

const BookingChatPanel = ({ booking, currentUser, onClose }) => {
    const [chat, setChat] = useState(null);
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const scrollContainerRef = useRef(null);
    const endRef = useRef(null);

    const otherParticipant = booking && currentUser
        ? (currentUser.uid === booking.requesterID ? booking.provider : booking.requester)
        : null;

    const fetchChat = async () => {
        if (!booking?._id || !currentUser?.uid) return;

        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/chat/${encodeURIComponent(booking._id)}?userID=${encodeURIComponent(currentUser.uid)}`);
            const data = await res.json();
            if (data.success) {
                setChat(data.chat);
            } else {
                setError(data.error || 'Failed to load chat');
            }
        } catch (fetchError) {
            console.error('Error loading chat:', fetchError);
            setError('Failed to load chat');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!booking?._id || !currentUser?.uid) {
            setChat(null);
            return undefined;
        }

        fetchChat();
        const intervalId = setInterval(fetchChat, 5000);

        return () => clearInterval(intervalId);
    }, [booking?._id, currentUser?.uid]);

    useEffect(() => {
        if (autoScrollEnabled) {
            endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [chat?.messages?.length, autoScrollEnabled]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return undefined;

        const handleScroll = () => {
            const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
            setAutoScrollEnabled(distanceFromBottom < 160);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        setFiles(selectedFiles);
    };

    const handleSend = async (event) => {
        event.preventDefault();

        if (!booking?._id || !currentUser?.uid) return;
        if (!message.trim() && files.length === 0) {
            Swal.fire({ icon: 'warning', text: 'Type a message or attach a file first.' });
            return;
        }

        setSending(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('senderID', currentUser.uid);
            formData.append('message', message.trim());
            files.forEach((file) => formData.append('files', file));

            const res = await fetch(`/api/chat/${encodeURIComponent(booking._id)}`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                setChat(data.chat);
                setMessage('');
                setFiles([]);
                await fetchChat();
            } else {
                setError(data.error || 'Failed to send message');
            }
        } catch (sendError) {
            console.error('Error sending chat message:', sendError);
            setError('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (!booking) return null;

    const messages = chat?.messages || [];

    return (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Booking Chat</p>
                        <h3 className="text-lg font-black text-slate-900">{booking.service?.title || 'Booking conversation'}</h3>
                        <p className="text-sm text-slate-500">With {otherParticipant?.displayName || otherParticipant?.email || 'your booking partner'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={fetchChat}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                        Refresh
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            aria-label="Close chat"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div ref={scrollContainerRef} className="max-h-[520px] overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-4 py-4 sm:px-6">
                {loading && !chat ? (
                    <div className="flex items-center justify-center py-20 text-slate-500">
                        <Loader2 className="mr-2 animate-spin" size={18} />
                        Loading chat...
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        {error}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900">No messages yet</p>
                            <p className="text-sm text-slate-500">Start the conversation with a short note or a file.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {messages.map((entry) => {
                            const isMine = entry.senderID === currentUser?.uid;
                            return (
                                <div key={entry._id || `${entry.senderID}-${entry.createdAt}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[88%] rounded-3xl px-4 py-3 shadow-sm sm:max-w-[75%] ${isMine ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 border border-slate-200'}`}>
                                        <div className="mb-2 flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-80">
                                            <span>{isMine ? 'You' : otherParticipant?.displayName || 'Partner'}</span>
                                            <span>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}</span>
                                        </div>
                                        {entry.message ? <p className="whitespace-pre-wrap text-sm leading-6">{entry.message}</p> : null}

                                        {Array.isArray(entry.fileLinks) && entry.fileLinks.length > 0 && (
                                            <div className={`mt-3 space-y-2 ${isMine ? 'text-blue-50' : 'text-slate-700'}`}>
                                                {entry.fileLinks.map((file, index) => (
                                                    <a
                                                        key={`${file.url}-${index}`}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${isMine ? 'bg-white/10 hover:bg-white/15' : 'bg-slate-50 hover:bg-slate-100'}`}
                                                    >
                                                        <Paperclip size={14} />
                                                        <span className="truncate">{file.name || 'Attachment'}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={endRef} />
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
                {files.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {files.map((file) => (
                            <span key={`${file.name}-${file.size}`} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                <Paperclip size={12} />
                                {file.name}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-end gap-3">
                    <label className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                        <Paperclip size={18} />
                        <input type="file" multiple className="hidden" onChange={handleFileChange} />
                    </label>

                    <div className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white">
                        <textarea
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    handleSend(event);
                                }
                            }}
                            placeholder="Write a message..."
                            rows={2}
                            className="w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={sending}
                        className="inline-flex h-12 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                        Send
                    </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <p>Messages refresh every few seconds while this panel is open.</p>
                    {!autoScrollEnabled && (
                        <button
                            type="button"
                            onClick={() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700"
                        >
                            <ArrowDown size={12} />
                            Latest
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default BookingChatPanel;