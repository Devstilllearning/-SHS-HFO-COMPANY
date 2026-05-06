import { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Users, 
  Calendar, 
  Activity as ActivityIcon, 
  TrendingUp, 
  PieChart as PieIcon,
  Clock,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMeetings: 0,
    pendingMeetings: 0,
    activeUsers: 0
  });
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Basic stats
    const fetchStats = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const meetingsSnap = await getDocs(collection(db, 'meetings'));
      const pendingSnap = await getDocs(query(collection(db, 'meetings'), orderBy('status'), limit(100))); // Rough estimate
      
      const pending = meetingsSnap.docs.filter(d => d.data().status === 'pending').length;
      const active = usersSnap.docs.filter(d => d.data().isActive).length;

      setStats({
        totalUsers: usersSnap.size,
        totalMeetings: meetingsSnap.size,
        pendingMeetings: pending,
        activeUsers: active
      });

      // Prepare chart data (dummy for now)
      setChartData([
        { name: 'Mon', count: 12 },
        { name: 'Tue', count: 19 },
        { name: 'Wed', count: 15 },
        { name: 'Thu', count: 22 },
        { name: 'Fri', count: 30 },
        { name: 'Sat', count: 10 },
        { name: 'Sun', count: 8 },
      ]);
    };
    fetchStats();

    // Recent meetings
    const q = query(collection(db, 'meetings'), orderBy('createdAt', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      setRecentMeetings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  const COLORS = ['#6B21A8', '#D97706', '#BE123C', '#22C55E'];

  return (
    <div className="flex min-h-screen bg-bg-light">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-10">
        <header className="mb-10">
          <h1 className="text-3xl font-serif font-bold text-bg-dark">Admin Insight</h1>
          <p className="text-text-muted mt-1">Global performance and platform activity oversight.</p>
        </header>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'brand-purple' },
            { label: 'All Meetings', value: stats.totalMeetings, icon: Calendar, color: 'brand-gold' },
            { label: 'Pending Approval', value: stats.pendingMeetings, icon: Clock, color: 'brand-red' },
            { label: 'Active Retention', value: `${Math.round((stats.activeUsers/stats.totalUsers)*100 || 0)}%`, icon: TrendingUp, color: 'green-600' }
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="premium-card"
            >
              <div className="flex justify-between items-center mb-4">
                <div className={`p-2 rounded-lg bg-white shadow-sm border border-purple-50`}>
                  <stat.icon className={`w-5 h-5 text-brand-purple`} />
                </div>
                <span className="text-xs font-bold text-green-500 flex items-center bg-green-50 px-2 py-0.5 rounded-full">
                  +12.5% <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-serif font-bold mt-2">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Chart */}
          <div className="lg:col-span-2 premium-card">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-bold flex items-center">
                <ActivityIcon className="w-5 h-5 mr-3 text-brand-purple" />
                <span>Weekly Appointment Volume</span>
              </h3>
              <div className="flex bg-purple-50 rounded-lg p-1">
                 <button className="px-3 py-1 text-xs font-bold bg-white text-brand-purple rounded-md shadow-sm">Sales</button>
                 <button className="px-3 py-1 text-xs font-bold text-text-muted">Users</button>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#FAF5FF'}} contentStyle={{borderRadius: '12px', border: 'none', shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="count" fill="#6B21A8" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="premium-card">
            <h3 className="font-bold mb-10 flex items-center">
              <PieIcon className="w-5 h-5 mr-3 text-brand-gold" />
              <span>Platform Preference</span>
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Google Meet', value: 65 },
                      { name: 'Zoom', value: 35 }
                    ]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[0, 1].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
               <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center"><div className="w-3 h-3 bg-brand-purple rounded-full mr-2" /> Google Meet</div>
                  <span className="font-bold">65%</span>
               </div>
               <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center"><div className="w-3 h-3 bg-brand-gold rounded-full mr-2" /> Zoom Video</div>
                  <span className="font-bold">35%</span>
               </div>
            </div>
          </div>
        </div>

        {/* Recent Meetings Table */}
        <div className="premium-card">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg">Live Bookings</h3>
            <button className="text-sm font-bold text-brand-purple hover:underline">Full Log</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-purple-50 text-xs font-bold text-text-muted uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Guest</th>
                    <th className="px-6 py-4">With Member</th>
                    <th className="px-6 py-4">Scheduled</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-purple-50">
                  {recentMeetings.map((m) => (
                    <tr key={m.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold">{m.guestName}</p>
                        <p className="text-xs text-text-muted">{m.guestEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{m.memberId === 'admin123' ? 'Alex Berrionaire' : 'Sarah Chief'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">
                           <p>{m.date}</p>
                           <p className="text-xs text-text-muted">{m.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                          m.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-brand-gold/10 text-brand-gold'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function ArrowUpRight({className}: {className?: string}) { return <TrendingUp className={className} />; }
