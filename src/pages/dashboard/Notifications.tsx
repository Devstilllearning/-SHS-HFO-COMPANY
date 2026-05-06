import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useNotifications } from '../../context/useNotifications';
import { Bell, CheckCircle2, Info, Check, Trash2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { notifications, unreadCount } = useNotifications();
  const [loading, setLoading] = useState(false);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error("Error marking as read", error);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    setLoading(true);
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all as read", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error("Error deleting notification", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-light">
      <Sidebar />
      <main className="flex-1 ml-[280px] h-full flex flex-col">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-gray-100 bg-white">
          <div>
            <h1 className="text-3xl font-serif font-bold text-bg-dark">Notifications</h1>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-bold">Alerts & System Messages</p>
          </div>
          <div className="flex flex-col items-end">
            <button
              onClick={markAllAsRead}
              disabled={loading || unreadCount === 0}
              className="text-xs font-bold uppercase tracking-widest text-brand-purple hover:text-brand-gold disabled:opacity-50 transition-colors"
            >
              Mark all as read
            </button>
          </div>
        </header>

        <section className="p-10 flex-1 overflow-y-auto">
          <div className="max-w-4xl bg-white rounded-[16px] shadow-sm border border-gray-100 p-8 min-h-[60vh]">
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <Link 
                    key={notif.id}
                    to={notif.link || '#'}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif.id);
                    }}
                    className={`flex items-start p-5 rounded-[12px] border transition-all hover:scale-[1.01] ${
                      notif.read ? 'bg-bg-light border-transparent' : 'bg-brand-gold/5 border-brand-gold/30 shadow-sm'
                    }`}
                  >
                    <div className="flex-shrink-0 mr-4">
                       {notif.type === 'success' ? (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                             <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                       ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                             <Info className="w-5 h-5 text-blue-600" />
                          </div>
                       )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-bold ${!notif.read ? 'text-bg-dark' : 'text-text-muted'}`}>
                          {notif.title}
                        </h4>
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            {notif.createdAt ? format(notif.createdAt.toDate(), 'MMM d, h:mm a') : 'Just now'}
                          </span>
                          <button 
                            onClick={(e) => deleteNotification(notif.id, e)}
                            className="text-gray-300 hover:text-brand-red transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-xs ${!notif.read ? 'text-text-main font-medium' : 'text-text-muted'}`}>
                        {notif.message}
                      </p>
                    </div>
                    
                    {!notif.read && (
                      <div className="ml-4 flex flex-col justify-center h-full pt-1">
                         <div className="w-2 h-2 bg-brand-red rounded-full"></div>
                      </div>
                    )}
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                  <div className="w-20 h-20 bg-bg-light rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-bg-dark mb-2">Caught Up!</h3>
                  <p className="text-sm">You have no new notifications.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
