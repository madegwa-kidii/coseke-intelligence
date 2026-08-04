'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Mail, Bell, Send, Loader2, Users, Check } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface UserOption {
    _id: string;
    name: string;
    email: string;
}

function NotificationsContent() {
    const [activeTab, setActiveTab] = useState<'email' | 'push'>('email');
    const [emailLoading, setEmailLoading] = useState(false);
    const [pushLoading, setPushLoading] = useState(false);

    // User list state
    const [users, setUsers] = useState<UserOption[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState<string | null>(null);
    const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
    const [userSearch, setUserSearch] = useState('');

    // Email form state (subject/text/html — recipients come from selectedEmails)
    const [emailContent, setEmailContent] = useState({
        subject: '',
        message: '',
    });

    // Push notification form state
    const [pushData, setPushData] = useState({
        title: '',
        body: '',
        icon: '',
        badge: '',
    });

    useEffect(() => {
        if (activeTab !== 'email') return;

        let ignore = false;

        (async () => {
            setUsersLoading(true);
            setUsersError(null);
            try {
                const response = await fetch('/api/notifications/email/users');
                const data = await response.json();

                if (!ignore) {
                    if (response.ok) {
                        setUsers(data.users || []);
                    } else {
                        setUsersError(data.error || 'Failed to load users');
                    }
                }
            } catch (error) {
                if (!ignore) {
                    setUsersError('Failed to load users');
                    console.error(error);
                }
            } finally {
                if (!ignore) setUsersLoading(false);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [activeTab]);

    const handleEmailContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEmailContent(prev => ({ ...prev, [name]: value }));
    };

    const handlePushChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPushData(prev => ({ ...prev, [name]: value }));
    };

    const toggleUser = (email: string) => {
        setSelectedEmails(prev => {
            const next = new Set(prev);
            if (next.has(email)) {
                next.delete(email);
            } else {
                next.add(email);
            }
            return next;
        });
    };

    const filteredUsers = users.filter(u => {
        const q = userSearch.trim().toLowerCase();
        if (!q) return true;
        return u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });

    const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedEmails.has(u.email));

    const toggleSelectAllFiltered = () => {
        setSelectedEmails(prev => {
            const next = new Set(prev);
            if (allFilteredSelected) {
                filteredUsers.forEach(u => next.delete(u.email));
            } else {
                filteredUsers.forEach(u => next.add(u.email));
            }
            return next;
        });
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        const recipients = Array.from(selectedEmails);

        if (recipients.length === 0) {
            toast.error('Select at least one recipient');
            return;
        }

        if (!emailContent.subject.trim() || !emailContent.message.trim()) {
            toast.error('Please fill in subject and message');
            return;
        }

        setEmailLoading(true);
        try {
            const response = await fetch('/api/notifications/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    subject: emailContent.subject,
                    text: emailContent.message,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                const sentCount = result.sent ?? recipients.length;
                toast.success(
                    result.failed
                        ? `Sent to ${sentCount}, ${result.failed} failed`
                        : `Email sent to ${sentCount} recipient${sentCount === 1 ? '' : 's'}!`
                );
                setEmailContent({ subject: '', message: '' });
                setSelectedEmails(new Set());
            } else {
                toast.error(result.error || result.message || 'Failed to send email');
            }
        } catch (error) {
            toast.error('Error sending email');
            console.error(error);
        } finally {
            setEmailLoading(false);
        }
    };

    const handleSendPush = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pushData.title || !pushData.body) {
            toast.error('Please fill in title and body');
            return;
        }

        setPushLoading(true);
        try {
            const response = await fetch('/api/push/send-public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pushData),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(
                    result.sent > 0
                        ? `Sent to ${result.sent} subscriber${result.sent === 1 ? '' : 's'}${result.failed ? ` (${result.failed} failed)` : ''}`
                        : result.message || 'No subscribers to notify'
                );
                setPushData({ title: '', body: '', icon: '', badge: '' });
            } else {
                toast.error(result.error || result.message || 'Failed to send push notification');
            }
        } catch (error) {
            toast.error('Error sending push notification');
            console.error(error);
        } finally {
            setPushLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                        Send Notifications
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Send emails and push notifications to users
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 bg-white dark:bg-slate-800 rounded-lg p-1 shadow">
                    <button
                        onClick={() => setActiveTab('email')}
                        className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'email'
                                ? 'bg-blue-500 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Mail size={20} />
                        Email
                    </button>
                    <button
                        onClick={() => setActiveTab('push')}
                        className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'push'
                                ? 'bg-purple-500 text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Bell size={20} />
                        Push Notification
                    </button>
                </div>

                {/* Forms */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
                    {/* Email Form */}
                    {activeTab === 'email' && (
                        <form onSubmit={handleSendEmail} className="space-y-6">
                            {/* Recipient picker */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-slate-900 dark:text-slate-50">
                                        Recipients {selectedEmails.size > 0 && (
                                        <span className="text-slate-500 dark:text-slate-400 font-normal">
                        ({selectedEmails.size} selected)
                      </span>
                                    )}
                                    </label>
                                    {filteredUsers.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={toggleSelectAllFiltered}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            {allFilteredSelected ? 'Deselect all' : 'Select all'}
                                        </button>
                                    )}
                                </div>

                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full px-4 py-2 mb-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />

                                <div className="border border-slate-300 dark:border-slate-600 rounded-lg max-h-56 overflow-y-auto">
                                    {usersLoading && (
                                        <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500 dark:text-slate-400">
                                            <Loader2 size={16} className="animate-spin" />
                                            Loading users...
                                        </div>
                                    )}

                                    {!usersLoading && usersError && (
                                        <div className="py-6 text-center text-sm text-red-600 dark:text-red-400">
                                            {usersError}
                                        </div>
                                    )}

                                    {!usersLoading && !usersError && filteredUsers.length === 0 && (
                                        <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                            No users found
                                        </div>
                                    )}

                                    {!usersLoading && !usersError && filteredUsers.map((u) => {
                                        const checked = selectedEmails.has(u.email);
                                        return (
                                            <button
                                                type="button"
                                                key={u._id}
                                                onClick={() => toggleUser(u.email)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left border-b last:border-b-0 border-slate-100 dark:border-slate-700 transition-colors ${
                                                    checked
                                                        ? 'bg-blue-50 dark:bg-blue-950'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-750'
                                                }`}
                                            >
                        <span
                            className={`flex items-center justify-center w-4 h-4 rounded border shrink-0 ${
                                checked
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'border-slate-300 dark:border-slate-600'
                            }`}
                        >
                          {checked && <Check size={12} className="text-white" />}
                        </span>
                                                <span className="min-w-0">
                          <span className="block text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                            {u.name || u.email}
                          </span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                            {u.email}
                          </span>
                        </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email-subject" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                                    Subject
                                </label>
                                <input
                                    id="email-subject"
                                    type="text"
                                    name="subject"
                                    value={emailContent.subject}
                                    onChange={handleEmailContentChange}
                                    placeholder="Email subject"
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="email-message" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="email-message"
                                    name="message"
                                    value={emailContent.message}
                                    onChange={handleEmailContentChange}
                                    placeholder="Email message..."
                                    rows={6}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={emailLoading || selectedEmails.size === 0}
                                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {emailLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Send Email {selectedEmails.size > 0 && `(${selectedEmails.size})`}
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Push Notification Form */}
                    {activeTab === 'push' && (
                        <form onSubmit={handleSendPush} className="space-y-6">
                            <div>
                                <label htmlFor="push-title" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                                    Notification Title
                                </label>
                                <input
                                    id="push-title"
                                    type="text"
                                    name="title"
                                    value={pushData.title}
                                    onChange={handlePushChange}
                                    placeholder="Notification title"
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="push-body" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                                    Notification Body
                                </label>
                                <textarea
                                    id="push-body"
                                    name="body"
                                    value={pushData.body}
                                    onChange={handlePushChange}
                                    placeholder="Notification body..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="push-icon" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                                        Icon URL (optional)
                                    </label>
                                    <input
                                        id="push-icon"
                                        type="url"
                                        name="icon"
                                        value={pushData.icon}
                                        onChange={handlePushChange}
                                        placeholder="https://example.com/icon.png"
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="push-badge" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                                        Badge URL (optional)
                                    </label>
                                    <input
                                        id="push-badge"
                                        type="url"
                                        name="badge"
                                        value={pushData.badge}
                                        onChange={handlePushChange}
                                        placeholder="https://example.com/badge.png"
                                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={pushLoading}
                                className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {pushLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        Send Push Notification
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        <strong>Note:</strong> {activeTab === 'email'
                        ? 'Select one or more users above, then compose and send. Emails are sent using Nodemailer.'
                        : 'Push notifications will be sent to subscribed users. Ensure the browser has granted notification permissions.'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function NotificationsPage() {
    return (
        <ProtectedRoute>
            <NotificationsContent />
        </ProtectedRoute>
    );
}