'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Bell, Send, Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function NotificationsContent() {
  const [activeTab, setActiveTab] = useState<'email' | 'push'>('email');
  const [emailLoading, setEmailLoading] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  // Email form state
  const [emailData, setEmailData] = useState({
    to: '',
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };

  const handlePushChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPushData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailData.to || !emailData.subject || !emailData.message) {
      toast.error('Please fill in all email fields');
      return;
    }

    setEmailLoading(true);
    try {
      const response = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Email sent successfully!');
        setEmailData({ to: '', subject: '', message: '' });
      } else {
        toast.error(result.message || 'Failed to send email');
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
              <div>
                <label htmlFor="email-to" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                  Recipient Email Address
                </label>
                <input
                  id="email-to"
                  type="email"
                  name="to"
                  value={emailData.to}
                  onChange={handleEmailChange}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email-subject" className="block text-sm font-medium text-slate-900 dark:text-slate-50 mb-2">
                  Subject
                </label>
                <input
                  id="email-subject"
                  type="text"
                  name="subject"
                  value={emailData.subject}
                  onChange={handleEmailChange}
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
                  value={emailData.message}
                  onChange={handleEmailChange}
                  placeholder="Email message..."
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {emailLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Send Email
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
              ? 'Emails will be sent using Nodemailer. Ensure valid email addresses are provided.'
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
