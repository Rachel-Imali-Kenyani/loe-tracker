import React, { useState } from 'react';
import { Clock, User, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type NotificationType = 'REMINDER' | 'PROJECT_ADDED' | 'PROJECT_REMOVED';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  time: string;
  message: React.ReactNode;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'REMINDER',
    title: 'LoE submission deadline tomorrow',
    time: '09:42 AM',
    message: 'System-generated reminder: Your Level of Effort log for Week 42 is due within 24 hours. Failure to submit will result in variance escalation.',
    unread: true
  },
  {
    id: '2',
    type: 'PROJECT_ADDED',
    title: 'New project allocation: ERM Assess',
    time: 'Yesterday',
    message: <>Resource Management has allocated you to the <span className="text-primary font-mono">#PROJ-ERM-009</span> assessment track effective immediately.</>,
    unread: true
  },
  {
    id: '3',
    type: 'PROJECT_ADDED',
    title: 'New project allocation: ERM: Net Zero Compass',
    time: '2d ago',
    message: <>Resource Management has allocated you to the <span className="text-primary font-mono">#PROJ-ERM-012</span> assessment track effective immediately.</>,
    unread: true
  },
  {
    id: '4',
    type: 'PROJECT_ADDED',
    title: 'New project allocation: Fintech: BDC',
    time: '3d ago',
    message: <>Resource Management has allocated you to the <span className="text-primary font-mono">#PROJ-FIN-104</span> assessment track effective immediately.</>,
    unread: false
  },
  {
    id: '5',
    type: 'PROJECT_ADDED',
    title: 'New project allocation: ERM COMPASS',
    time: '1w ago',
    message: <>Resource Management has allocated you to the <span className="text-primary font-mono">#PROJ-ERM-015</span> assessment track effective immediately.</>,
    unread: false
  },
  {
    id: '6',
    type: 'PROJECT_REMOVED',
    title: 'Project allocation removed: PixelEdge',
    time: '1w ago',
    message: <>You have been rolled off the <span className="text-primary font-mono">#PROJ-PXL-001</span> track. You no longer need to log hours for this project.</>,
    unread: false
  }
];

export function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const navigate = useNavigate();

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

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
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            style={{ opacity: unreadCount === 0 ? 0.5 : 1 }}
          >
            MARK ALL READ
          </button>
        </div>
      </header>

      <div className="pt-0">
        <h3 className="text-[0.65rem] text-on-surface-variant tracking-widest mb-4 font-bold uppercase">ALERTS</h3>
        
        <div className="flex flex-col gap-3 mb-8">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`bg-surface-container border border-outline-variant rounded-lg p-5 flex gap-4 relative transition-colors hover:bg-surface-variant/30 border-l-4 ${
                notification.type === 'REMINDER' ? 'border-l-error' 
                : notification.type === 'PROJECT_ADDED' ? 'border-l-secondary' 
                : 'border-l-outline-variant'
              } ${!notification.unread ? 'opacity-70' : ''}`}
            >
              
              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                notification.type === 'REMINDER' ? 'bg-error/20 text-error' 
                : notification.type === 'PROJECT_ADDED' ? 'bg-secondary/20 text-secondary' 
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
                  <span className="text-xs text-on-surface-variant font-mono mr-8">{notification.time}</span>
                   {notification.unread && (
                <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-error"></div>
              )}
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed m-0">
                  {notification.message}
                </p>
                
                {notification.type === 'REMINDER' && (
                  <div className="flex gap-3 mt-3">
                    <button 
                      className="bg-primary text-[#000] px-4 py-2 rounded text-xs font-bold tracking-widest hover:bg-primary/90"
                      onClick={() => navigate('/time-logs')}
                    >
                      Open Log
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
