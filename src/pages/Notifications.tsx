import { useEffect, useState } from 'react';
import { Clock, User, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getNotifications, markNotificationsRead } from '../services/notifications';
import type { NotificationRecord } from '../services/types';

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) {
    return 'Just now';
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Yesterday';
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function Notifications() {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadNotifications = async () => {
      setIsLoading(true);
      setQueryError(null);

      try {
        const nextNotifications = await getNotifications(userId);
        setNotifications(nextNotifications);
      } catch (error) {
        setQueryError(error instanceof Error ? error.message : 'Unable to load notifications.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadNotifications();
  }, [userId]);

  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((notification) => notification.unread).map((notification) => notification.id);

    try {
      await markNotificationsRead(unreadIds);
      setActionError(null);
      setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update notifications.');
    }
  };

  const handleMarkOneRead = async (notificationId: string) => {
    const target = notifications.find((notification) => notification.id === notificationId);
    if (!target?.unread) {
      return;
    }

    try {
      await markNotificationsRead([notificationId]);
      setActionError(null);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, unread: false } : notification,
        ),
      );
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to update notification.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto">
      <header className="flex justify-between items-start pb-6 border-b border-outline-variant mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1">Notifications Center</h1>
          <p className="text-sm text-on-surface-variant flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-error inline-block"></span> {unreadCount} Unread Alerts
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="border border-outline-variant text-on-surface hover:bg-surface-variant px-4 py-2 rounded text-xs font-bold tracking-widest transition-colors"
            onClick={() => void handleMarkAllRead()}
            disabled={unreadCount === 0}
            style={{ opacity: unreadCount === 0 ? 0.5 : 1 }}
          >
            MARK ALL READ
          </button>
        </div>
      </header>

      {queryError ? (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {queryError}
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {actionError}
        </div>
      ) : null}

      <div className="pt-0">
        <h3 className="text-[0.65rem] text-on-surface-variant tracking-widest mb-4 font-bold uppercase">ALERTS</h3>

        <div className="flex flex-col gap-3 mb-8">
          {isLoading ? (
            <div className="bg-surface-container border border-outline-variant rounded-lg p-5 text-sm text-on-surface-variant">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-surface-container border border-outline-variant rounded-lg p-5 text-sm text-on-surface-variant">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                type="button"
                key={notification.id}
                onClick={() => void handleMarkOneRead(notification.id)}
                className={`bg-surface-container border border-outline-variant rounded-lg p-5 flex gap-4 relative transition-colors hover:bg-surface-variant/30 border-l-4 text-left ${
                  notification.type === 'REMINDER'
                    ? 'border-l-error'
                    : notification.type === 'PROJECT_ADDED'
                      ? 'border-l-secondary'
                      : 'border-l-outline-variant'
                } ${!notification.unread ? 'opacity-70' : ''}`}
              >
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                  notification.type === 'REMINDER'
                    ? 'bg-error/20 text-error'
                    : notification.type === 'PROJECT_ADDED'
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-white/10 text-on-surface-variant'
                }`}>
                  {notification.type === 'REMINDER' && <Clock size={16} />}
                  {notification.type === 'PROJECT_ADDED' && <User size={16} />}
                  {notification.type === 'PROJECT_REMOVED' && <UserMinus size={16} />}
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold m-0 ${notification.unread ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-on-surface-variant font-mono mr-8">{formatRelativeTime(notification.createdAt)}</span>
                    {notification.unread ? (
                      <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-error"></div>
                    ) : null}
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed m-0">
                    {notification.message}
                  </p>

                  {notification.type === 'REMINDER' ? (
                    <div className="flex gap-3 mt-3">
                      <span
                        className="bg-primary text-[#000] px-4 py-2 rounded text-xs font-bold tracking-widest hover:bg-primary/90"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate('/time-logs');
                        }}
                      >
                        Open Log
                      </span>
                    </div>
                  ) : null}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
