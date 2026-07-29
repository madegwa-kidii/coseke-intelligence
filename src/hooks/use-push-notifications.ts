'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePushNotifications() {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const [isSupported] = useState<boolean>(() => {
        if (typeof navigator === 'undefined' || typeof window === 'undefined') {
            return false;
        }
        return 'serviceWorker' in navigator && 'PushManager' in window;
    });

    const checkSubscription = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
            setIsSubscribed(!!sub);
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    }, []);

    useEffect(() => {
        checkSubscription();
    }, [checkSubscription]);

    const subscribeToPush = useCallback(async () => {
        try {
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                throw new Error('Permission not granted for notifications');
            }

            const registration = await navigator.serviceWorker.ready;

            const response = await fetch('/api/push/vapid-public-key');
            const { publicKey } = await response.json();

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub),
            });

            setSubscription(sub);
            setIsSubscribed(true);

            return sub;
        } catch (error) {
            console.error('Error subscribing to push:', error);
            throw error;
        }
    }, []);

    const unsubscribeFromPush = useCallback(async () => {
        try {
            if (subscription) {
                await subscription.unsubscribe();

                await fetch('/api/push/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription),
                });

                setSubscription(null);
                setIsSubscribed(false);
            }
        } catch (error) {
            console.error('Error unsubscribing from push:', error);
            throw error;
        }
    }, [subscription]);

    return {
        isSupported,
        isSubscribed,
        subscription,
        subscribeToPush,
        unsubscribeFromPush,
    };
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}