// components/notifications/notification-display.tsx
'use client';

import { useNotifications, Notification } from './notification-context';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

// Static class strings per type — kept literal (not interpolated) so Tailwind's
// JIT scanner can pick them up; dynamic strings like `border-${type}` won't work.
const typeClasses = {
    success: {
        border: 'border-success',
        icon: 'text-success',
        actionBorder: 'border-success',
        actionText: 'text-success',
        ring: 'focus:ring-success',
    },
    error: {
        border: 'border-destructive',
        icon: 'text-destructive',
        actionBorder: 'border-destructive',
        actionText: 'text-destructive',
        ring: 'focus:ring-destructive',
    },
    warning: {
        border: 'border-warning',
        icon: 'text-warning',
        actionBorder: 'border-warning',
        actionText: 'text-warning',
        ring: 'focus:ring-warning',
    },
    info: {
        border: 'border-foreground',
        icon: 'text-foreground',
        actionBorder: 'border-foreground',
        actionText: 'text-foreground',
        ring: 'focus:ring-foreground',
    },
} as const;

function NotificationItem({ notification }: { notification: Notification }) {
    const { removeNotification } = useNotifications();
    const Icon = iconMap[notification.type];
    const classes = typeClasses[notification.type];

    return (
        <div
            className={`max-w-sm w-full bg-card border ${classes.border} shadow-lg rounded-lg pointer-events-auto overflow-hidden transform transition-all duration-300 ease-in-out`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${classes.icon}`} />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-foreground">
                            {notification.title}
                        </p>
                        {notification.message && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {notification.message}
                            </p>
                        )}
                        {notification.actions && notification.actions.length > 0 && (
                            <div className="mt-3 flex space-x-2">
                                {notification.actions.map((action, index) => (
                                    <Button
                                        key={index}
                                        size="sm"
                                        variant="outline"
                                        onClick={action.onClick}
                                        className={`text-xs ${classes.actionBorder} ${classes.actionText}`}
                                    >
                                        {action.label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className={`rounded-md inline-flex text-muted-foreground hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 ${classes.ring} transition-opacity`}
                            onClick={() => removeNotification(notification.id)}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function NotificationDisplay() {
    const { notifications } = useNotifications();

    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                    />
                ))}
            </div>
        </div>
    );
}