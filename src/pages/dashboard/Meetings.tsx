import { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Calendar, 
  Clock, 
  Video, 
  ExternalLink, 
  Copy, 
  MapPin,
  XCircle, 
  CheckCircle,
  MoreVertical,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useSettings } from '../../context/SettingsContext';

export default function MyMeetings() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    
    let q = query(
      collection(db, 'meetings'),
      where('memberId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setMeetings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const updateStatus = async (meeting: any, status: string) => {
    try {
      const updates: any = {
        status,
        updatedAt: serverTimestamp()
      };
      
      if (!meeting.meetingLink || meeting.meetingLink === '#') {
        if (meeting.platform === 'gmeet') {
          if (settings?.gmeetPersonalLink) {
            updates.meetingLink = settings.gmeetPersonalLink;
          } else {
            updates.meetingLink = `https://meet.google.com/new`;
          }
        } else if (meeting.platform === 'onsite') {
          updates.meetingLink = settings?.hqAddress || 'HQ Office, Meeting Room A';
        }
      }

      await updateDoc(doc(db, 'meetings', meeting.id), updates);
      toast.success(`Meeting ${status}`);
    } catch (error: any) {
      toast.error('Operation failed');
    }
  };

  const filteredMeetings = meetings.filter(m => filter === 'all' || m.status === filter);

  return (
    <div className="flex min-h-screen bg-bg-light">
      <Sidebar />
      <main className="flex-1 ml-[280px] h-full flex flex-col">
        <header className="h-20 flex items-center justify-between px-10 border-b border-gray-100 bg-white">
          <div>
            <h1 className="text-3xl font-serif font-bold text-bg-dark">My Meetings</h1>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-bold">Tactical Coordination Hub</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="bg-bg-light border border-gray-100 rounded-full px-4 py-2 flex items-center space-x-2 text-sm font-bold shadow-sm">
                <Filter className="w-4 h-4 text-brand-purple" />
                <select 
                  className="bg-transparent focus:outline-none cursor-pointer"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
             </div>
          </div>
        </header>

        <section className="p-10 flex-1 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
            <AnimatePresence mode="popLayout">
              {filteredMeetings.map((meeting, idx) => (
                <motion.div 
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-[16px] shadow-sm border border-gray-100 overflow-hidden border-l-4 ${
                    meeting.status === 'confirmed' ? 'border-l-green-500 shadow-green-500/5' : 
                    meeting.status === 'pending' ? 'border-l-brand-gold shadow-brand-gold/5' : 
                    meeting.status === 'cancelled' ? 'border-l-brand-red opacity-80' : 'border-l-gray-400 opacity-60'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${meeting.platform === 'onsite' ? 'bg-pink-100' : 'bg-green-100'}`}>
                          {meeting.platform === 'onsite' ? 
                            <MapPin className="w-5 h-5 text-brand-purple" /> :
                            <Video className="w-5 h-5 text-green-600" />
                          }
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-bg-dark">{meeting.guestName}</h3>
                          <div className="flex items-center text-[10px] font-bold text-text-muted uppercase tracking-widest mt-0.5">
                            <span className="text-brand-purple">{meeting.purpose || 'Strategic sync'}</span>
                            <span className="mx-2 opacity-50">•</span>
                            <span>{meeting.platform}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        meeting.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' : 
                        meeting.status === 'pending' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' : 
                        meeting.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {meeting.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-3 text-sm font-medium text-text-main bg-bg-light p-3 rounded-xl border border-gray-100/50">
                        <Calendar className="w-4 h-4 text-brand-purple" />
                        <span className="truncate">{meeting.date}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm font-medium text-text-main bg-bg-light p-3 rounded-xl border border-gray-100/50">
                        <Clock className="w-4 h-4 text-brand-purple" />
                        <span className="truncate">{meeting.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="flex space-x-2">
                        {meeting.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(meeting, 'confirmed')}
                            className="bg-green-600 text-white p-2.5 rounded-lg hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/20 transition-all active:scale-95"
                            title="Confirm Meeting"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {meeting.status !== 'cancelled' && meeting.status !== 'completed' && (
                          <button 
                            onClick={() => updateStatus(meeting, 'cancelled')}
                            className="bg-red-50 text-red-600 p-2.5 rounded-lg hover:bg-red-100 transition-all active:scale-95"
                            title="Cancel Meeting"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        {(!meeting.meetingLink || meeting.meetingLink === '#') ? (
                          <button 
                            onClick={() => updateStatus(meeting, meeting.status)}
                            className="bg-brand-purple text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-fuchsia-700 transition-all flex items-center space-x-2 shadow-lg shadow-fuchsia-500/20 active:scale-95"
                            title="Generate Meeting Link"
                          >
                            <Video className="w-4 h-4" />
                            <span>Generate Link</span>
                          </button>
                        ) : (
                          <>
                            <button 
                              className="p-2.5 text-text-muted hover:text-brand-purple transition-all bg-bg-light rounded-lg border border-gray-100"
                              onClick={() => {
                                navigator.clipboard.writeText(meeting.meetingLink);
                                toast.success('Link copied!');
                              }}
                              title="Copy Meeting Link"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <a 
                              href={meeting.platform === 'onsite' ? '#' : meeting.meetingLink}
                              target={meeting.platform === 'onsite' ? '_self' : '_blank'}
                              rel="noreferrer"
                              className={`text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 shadow-lg active:scale-95 ${meeting.platform === 'onsite' ? 'bg-brand-purple hover:bg-fuchsia-700 shadow-fuchsia-500/20 px-8 cursor-default' : 'bg-bg-dark hover:bg-black shadow-bg-dark/10'}`}
                            >
                              <span>{meeting.platform === 'onsite' ? 'Location' : 'Open Link'}</span>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {!loading && filteredMeetings.length === 0 && (
              <div className="xl:col-span-2 py-24 text-center bg-white rounded-[16px] border border-dashed border-gray-200">
                <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold text-bg-dark">Ambience Clear</h3>
                <p className="text-text-muted text-sm px-12">No meetings found reflecting this status in your current tactical timeline.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
