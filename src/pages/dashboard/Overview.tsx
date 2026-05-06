import { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/useNotifications';
import { Link } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Users, 
  Calendar, 
  Clock, 
  ArrowUpRight,
  Video,
  ExternalLink,
  Bell,
  MapPin,
  UserCircle,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export default function DashboardOverview() {
  const { profile, user, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [stats, setStats] = useState({
    totalLeaders: 0,
    totalMembers: 0,
    myMeetings: 0,
    deptMembers: 0
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !profile) return;

    // Fetch Stats
    const fetchStats = async () => {
      const leadersSnap = await getDocs(query(collection(db, 'users'), where('role', 'in', ['superadmin', 'ceo', 'marketing_manager', 'secretary_manager', 'treasurer_manager', 'souvenir_manager', 'fb_manager'])));
      const membersSnap = await getDocs(collection(db, 'users'));
      
      let meetingsQuery;
      if (isAdmin) {
        meetingsQuery = query(collection(db, 'meetings'));
      } else {
        meetingsQuery = query(collection(db, 'meetings'), where('memberId', '==', user.uid));
      }
      const myMeetingsSnap = await getDocs(meetingsQuery);
      
      const deptSnap = await getDocs(query(collection(db, 'users'), where('department', '==', profile.department)));

      setStats({
        totalLeaders: leadersSnap.size,
        totalMembers: membersSnap.size,
        myMeetings: myMeetingsSnap.size,
        deptMembers: deptSnap.size
      });
    };
    fetchStats();

    // Upcoming Meetings Real-time
    let qMeetings;
    if (isAdmin) {
      qMeetings = query(
        collection(db, 'meetings'),
        where('status', '==', 'confirmed'),
        orderBy('date', 'asc'),
        limit(5)
      );
    } else {
      qMeetings = query(
        collection(db, 'meetings'),
        where('memberId', '==', user.uid),
        where('status', '==', 'confirmed'),
        orderBy('date', 'asc'),
        limit(5)
      );
    }
    const unsubMeetings = onSnapshot(qMeetings, (snap) => {
      const meetings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpcomingMeetings(meetings);
    });

    // Recent Activity Real-time
    const qActivity = query(
      collection(db, 'activity'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubActivity = onSnapshot(qActivity, (snap) => {
      const activities = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentActivity(activities);
    });

    return () => {
      unsubMeetings();
      unsubActivity();
    };
  }, [user, profile]);

  return (
    <div className="flex min-h-screen bg-bg-light">
      <Sidebar />
      <main className="flex-1 ml-[280px] h-full flex flex-col">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-gray-100 bg-white">
          <h2 className="text-3xl font-serif font-bold text-bg-dark">Overview</h2>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-bg-light pl-10 pr-4 py-2 rounded-[8px] border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20 w-64"
              />
              <Clock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            </div>
            <Link to="/dashboard/notifications" className="relative flex items-center cursor-pointer">
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red text-[10px] flex items-center justify-center rounded-full text-white font-bold border-2 border-white">
                  {unreadCount}
                </div>
              )}
              <Bell className="w-6 h-6 text-text-muted hover:text-brand-purple transition-colors" />
            </Link>
            <div className="text-right border-l pl-6 border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                {format(new Date(), 'MMM dd, yyyy')}
              </p>
              <p className="text-sm font-bold text-text-main mt-1">
                {format(new Date(), 'hh:mm a')}
              </p>
            </div>
          </div>
        </header>

        <section className="p-10 flex-1 space-y-8 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Leaders', value: stats.totalLeaders, border: 'border-brand-gold' },
              { label: 'Total Members', value: stats.totalMembers, border: 'border-brand-purple' },
              { label: 'Upcoming Calls', value: stats.myMeetings, border: 'border-brand-red' },
              { label: 'Department Peers', value: stats.deptMembers, border: 'border-teal-500' }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white p-6 rounded-[16px] shadow-sm border-l-4 ${stat.border}`}
              >
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-serif font-bold mt-1 text-bg-dark">{stat.value.toString().padStart(2, '0')}</p>
                <div className="mt-2 text-[10px] font-bold text-gray-400 opacity-80 uppercase tracking-tighter">
                  Real-time sync active
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Meetings */}
            <div className="lg:col-span-2 bg-white rounded-[16px] shadow-sm p-6 overflow-hidden flex flex-col min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl font-bold text-bg-dark">Upcoming Meetings</h3>
                <button className="text-brand-purple text-xs font-bold border-b border-brand-purple hover:opacity-70 transition-opacity">
                  View Full Calendar
                </button>
              </div>
              
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {upcomingMeetings.length > 0 ? (
                  upcomingMeetings.map((meeting) => (
                    <div 
                      key={meeting.id}
                      className={`flex items-center justify-between p-4 bg-bg-light rounded-[12px] border-l-4 ${meeting.platform === 'onsite' ? 'border-brand-purple' : 'border-green-500'}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meeting.platform === 'onsite' ? 'bg-pink-100' : 'bg-green-100'}`}>
                          {meeting.platform === 'onsite' ? 
                            <MapPin className="w-5 h-5 text-brand-purple" /> :
                            <Video className="w-5 h-5 text-green-600" />
                          }
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-bg-dark">{meeting.guestName}</h4>
                          <p className="text-xs text-text-muted">Strategic sync session</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-bg-dark">{meeting.time}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">{meeting.date}</p>
                      </div>
                      <a 
                        href={meeting.platform === 'onsite' ? '#' : meeting.meetingLink}
                        target={meeting.platform === 'onsite' ? '_self' : '_blank'}
                        rel="noreferrer"
                        className={`px-4 py-1.5 rounded-[8px] text-xs font-bold text-white transition-all active:scale-95 ${meeting.platform === 'onsite' ? 'bg-brand-purple hover:bg-fuchsia-700 shadow-lg shadow-fuchsia-500/20 cursor-default' : 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20'}`}
                      >
                        {meeting.platform === 'onsite' ? 'Location' : 'Join'}
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-text-muted italic space-y-2 opacity-50">
                    <Calendar className="w-12 h-12 mb-2" />
                    <p>No confirmed meetings on the immediate horizon.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white rounded-[16px] shadow-sm p-6 flex flex-col h-full">
              <h3 className="font-serif text-xl font-bold mb-4 text-bg-dark">Live Activity</h3>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-bg-light border border-brand-gold/10 rounded-[12px] transition-all hover:border-brand-gold/30">
                    <p className="text-xs">
                      <span className="font-bold text-bg-dark">{activity.userName}</span>
                      <span className="text-text-muted px-1">{activity.action}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">
                      {activity.timestamp ? format(activity.timestamp.toDate(), 'h:mm a') : 'Just now'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-bg-light border border-brand-gold/20 rounded-[12px]">
                <p className="text-[10px] uppercase font-bold text-gray-400">Tactical Update</p>
                <div className="mt-2 text-xs text-text-muted italic">
                  Systems are operational. Global leadership dashboard ready.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
