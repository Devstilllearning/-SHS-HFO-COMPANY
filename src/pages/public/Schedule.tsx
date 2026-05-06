import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../../components/layout/Navbar';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Users, 
  Video, 
  Calendar, 
  Info, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Smartphone,
  Globe,
  MapPin,
  Clock
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null, // Public page, no auth context readily available without adding more hooks
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}

export default function Schedule() {
  const { settings } = useSettings();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  
  const TIMEZONES = [
    { label: 'UTC', value: 'UTC' },
    { label: 'Jakarta (GMT+7)', value: 'Asia/Jakarta' },
    { label: 'Singapore (GMT+8)', value: 'Asia/Singapore' },
    { label: 'London (GMT+0)', value: 'Europe/London' },
    { label: 'New York (GMT-5)', value: 'America/New_York' },
    { label: 'Los Angeles (GMT-8)', value: 'America/Los_Angeles' },
    { label: 'Tokyo (GMT+9)', value: 'Asia/Tokyo' },
    { label: 'Sydney (GMT+11)', value: 'Australia/Sydney' },
    { label: 'Dubai (GMT+4)', value: 'Asia/Dubai' },
  ];
  
  // Form State
  const [formData, setFormData] = useState({
    memberId: '',
    memberData: null as any,
    departments: [] as string[],
    platform: 'gmeet',
    date: '',
    time: '',
    timezone: (typeof Intl !== 'undefined' && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    duration: 30,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    purpose: '',
    notes: ''
  });

  const DEPARTMENTS = [
    { id: 'mktg', name: 'Marketing', icon: 'Layers' },
    { id: 'exec', name: 'Executive', icon: 'ShieldCheck' },
    { id: 'secr', name: 'Secretary', icon: 'FileText' },
    { id: 'trea', name: 'Treasurer', icon: 'Wallet' },
    { id: 'souv', name: 'Souvenir', icon: 'Gift' },
    { id: 'fb', name: 'F&B', icon: 'Coffee' },
    { id: 'strat', name: 'Strategic Unit', icon: 'Target' }
  ];

  const toggleDepartment = (deptName: string) => {
    setFormData(prev => {
      const depts = prev.departments.includes(deptName)
        ? prev.departments.filter(d => d !== deptName)
        : [...prev.departments, deptName];
      return { ...prev, departments: depts };
    });
  };

  useEffect(() => {
    const fetchMembers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      setMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchMembers();
  }, []);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let generatedLink = '#';
      // Link generation removed from here to be performed by admin in dashboard
      
      const meetingData = {
        ...formData,
        memberId: 'unassigned',
        memberRole: 'Multiple Departments',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        meetingLink: generatedLink,
        date: formData.date,
        time: formData.time,
        targetDepartments: formData.departments
      };

      try {
        await addDoc(collection(db, 'meetings'), meetingData);
      } catch (error) {
        throw handleFirestoreError(error, OperationType.WRITE, 'meetings');
      }
      
      try {
        await addDoc(collection(db, 'activity'), {
          userId: 'system',
          userName: formData.guestName,
          action: `requested a new booking with ${formData.departments.join(', ')}`,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        // Log but don't fail the whole booking if activity fails
        console.error('Failed to log activity', error);
      }

      // Send notification to all users
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const notificationPromises = usersSnap.docs.map(userDoc => {
          return addDoc(collection(db, 'notifications'), {
            userId: userDoc.id,
            title: 'New Meeting Request',
            message: `${formData.guestName} wants to schedule a ${formData.platform} meeting with ${formData.departments.join(', ')} on ${formData.date} at ${formData.time}.`,
            type: 'info',
            read: false,
            createdAt: serverTimestamp(),
            link: '/dashboard/meetings'
          });
        });
        await Promise.all(notificationPromises);
      } catch (error) {
        console.error('Failed to send notifications', error);
      }

      nextStep(); // Step 5: Confirmation
      toast.success('Meeting booked successfully!');
    } catch (error: any) {
      const displayMessage = error.message.startsWith('{') ? 'Permission Denied' : error.message;
      toast.error('Booking failed: ' + displayMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1">
            {/* Step Indicator */}
            <div className="mb-16 flex items-center justify-between max-w-2xl mx-auto">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1 flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all shadow-lg ${
                    step >= s ? 'bg-brand-gold text-bg-dark scale-110' : 'bg-white text-gray-300 border border-gray-100'
                  }`}>
                    {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded-full ${
                      step > s ? 'bg-brand-gold' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-bg-dark">Select Target Departments</h2>
                    <p className="text-text-muted mt-2">Choose one or more departments for your coordination session.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DEPARTMENTS.map(dept => (
                      <div 
                        key={dept.id}
                        onClick={() => toggleDepartment(dept.name)}
                        className={`bg-white p-6 rounded-[16px] shadow-sm border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center space-x-4 ${
                          formData.departments.includes(dept.name) ? 'border-brand-gold bg-brand-gold/5 shadow-brand-gold/10' : 'border-transparent hover:border-brand-gold/20'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center text-xl font-bold shadow-sm transition-colors ${
                          formData.departments.includes(dept.name) ? 'bg-brand-gold text-bg-dark' : 'bg-bg-light text-brand-purple'
                        }`}>
                          {dept.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-bg-dark">{dept.name}</h4>
                          <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">Division</p>
                        </div>
                        {formData.departments.includes(dept.name) && (
                          <CheckCircle2 className="w-5 h-5 text-brand-gold" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 flex justify-center">
                    <button 
                      onClick={nextStep}
                      disabled={formData.departments.length === 0}
                      className="bg-brand-purple text-white px-16 py-4 rounded-[8px] font-bold text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-bg-dark">Choose Your Arena</h2>
                    <p className="text-text-muted mt-2">Select the platform for this tactical engagement.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { id: 'gmeet', name: 'Google Meet', icon: Video, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', tag: 'Recommended' },
                      { id: 'onsite', name: 'On-Site', icon: MapPin, color: 'text-brand-purple', bg: 'bg-pink-50', border: 'border-pink-200', tag: 'HQ Office' }
                    ].map(platform => (
                      <div 
                        key={platform.id}
                        onClick={() => { setFormData({ ...formData, platform: platform.id }); }}
                        className={`bg-white rounded-[16px] border-2 cursor-pointer group transition-all p-10 text-center flex flex-col items-center hover:scale-[1.02] active:scale-95 ${
                          formData.platform === platform.id ? `border-brand-gold shadow-xl shadow-brand-gold/5` : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className={`w-20 h-20 ${platform.bg} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                          <platform.icon className={`w-10 h-10 ${platform.color}`} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-bg-dark mb-2">{platform.name}</h3>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 flex justify-between max-w-2xl mx-auto">
                    <button onClick={prevStep} className="flex items-center text-xs font-bold uppercase tracking-widest text-text-muted hover:text-brand-purple transition-all">
                      <ChevronLeft className="w-5 h-5 mr-1" />
                      <span>Back</span>
                    </button>
                    <button onClick={nextStep} className="bg-brand-purple text-white px-12 py-4 rounded-[8px] font-bold text-sm uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-bg-dark">Synchronization Time</h2>
                    <p className="text-text-muted mt-2">Define the temporal window for this meeting.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-white p-8 rounded-[16px] shadow-sm border border-gray-100">
                      <label className="block text-[10px] font-bold mb-4 uppercase tracking-widest text-gray-400">Target Date</label>
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-bg-light p-4 rounded-[12px] border border-gray-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all font-bold text-bg-dark"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>

                    <div className="bg-white p-8 rounded-[16px] shadow-sm border border-gray-100">
                      <label className="block text-[10px] font-bold mb-4 uppercase tracking-widest text-gray-400">Communication Timezone</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gold" />
                        <select
                          className="w-full bg-bg-light p-4 pl-12 rounded-[12px] border border-gray-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/10 outline-none transition-all font-bold text-bg-dark appearance-none cursor-pointer"
                          value={formData.timezone}
                          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        >
                          <optgroup label="System Default">
                            {(typeof Intl !== 'undefined' && Intl.DateTimeFormat) && (
                              <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                                Local: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                              </option>
                            )}
                          </optgroup>
                          <optgroup label="Common Timezones">
                            {TIMEZONES.map(tz => (
                              <option key={tz.value} value={tz.value}>{tz.label}</option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    <div className="md:col-span-2 bg-white p-8 rounded-[16px] shadow-sm border border-gray-100">
                      <label className="block text-[10px] font-bold mb-4 uppercase tracking-widest text-gray-400">Tactical Slots</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-3">
                        {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(t => (
                          <button
                            key={t}
                            onClick={() => setFormData({ ...formData, time: t })}
                            className={`py-3 rounded-[12px] border font-bold text-xs transition-all ${
                              formData.time === t 
                                ? 'bg-brand-gold text-bg-dark border-brand-gold shadow-lg shadow-brand-gold/20' 
                                : 'bg-bg-light border-transparent text-text-muted hover:border-brand-gold/30'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 flex justify-between max-w-2xl mx-auto">
                    <button onClick={prevStep} className="flex items-center text-xs font-bold uppercase tracking-widest text-text-muted hover:text-brand-purple">
                      <ChevronLeft className="w-5 h-5 mr-1" />
                      <span>Back</span>
                    </button>
                    <button 
                      onClick={nextStep} 
                      disabled={!formData.date || !formData.time}
                      className="bg-brand-purple text-white px-12 py-4 rounded-[8px] font-bold text-sm uppercase tracking-widest flex items-center space-x-2 disabled:opacity-50 shadow-xl shadow-brand-purple/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-bold text-bg-dark">Finalizing Credentials</h2>
                    <p className="text-text-muted mt-2">Submit your details to establish a secure connection.</p>
                  </div>
                  <div className="bg-white p-10 rounded-[16px] shadow-sm border border-gray-100 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Identity Representation</label>
                        <input 
                          type="text" 
                          className="w-full bg-bg-light p-4 rounded-[12px] border border-gray-200 focus:border-brand-gold outline-none transition-all"
                          placeholder="Your full name"
                          value={formData.guestName}
                          onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Communication Node (Email)</label>
                        <input 
                          type="email" 
                          className="w-full bg-bg-light p-4 rounded-[12px] border border-gray-200 focus:border-brand-gold outline-none transition-all"
                          placeholder="name@organization.com"
                          value={formData.guestEmail}
                          onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">Strategic Intent</label>
                      <textarea 
                        className="w-full bg-bg-light p-4 rounded-[12px] border border-gray-200 focus:border-brand-gold outline-none transition-all min-h-[140px]"
                        placeholder="Briefly describe the objectives for this session..."
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-12 flex justify-between max-w-2xl mx-auto">
                    <button onClick={prevStep} className="flex items-center text-xs font-bold uppercase tracking-widest text-text-muted hover:text-brand-purple">
                      <ChevronLeft className="w-5 h-5 mr-1" />
                      <span>Back</span>
                    </button>
                    <button 
                      onClick={handleSubmit} 
                      disabled={loading || !formData.guestName || !formData.guestEmail}
                      className="bg-brand-gold text-bg-dark px-14 py-4 rounded-[8px] font-bold text-sm uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-brand-gold/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      {loading ? 'Transmitting...' : 'Establish Session'}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div 
                  key="step5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-24 h-24 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <CheckCircle2 className="w-16 h-16" />
                  </div>
                  <h2 className="text-4xl font-serif font-bold text-bg-dark mb-4 italic">Synchronization Initiated!</h2>
                  <p className="text-xl text-text-muted max-w-xl mx-auto mb-10 leading-relaxed">
                    Your request to coordinate with <strong>{formData.departments.join(', ')}</strong> has been transmitted. Global notifications triggered.
                  </p>
                  
                  <div className="max-w-md mx-auto bg-white rounded-[24px] shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full -mr-16 -mt-16" />
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center space-x-4 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-bg-light rounded-xl"><Calendar className="w-6 h-6 text-brand-purple" /></div>
                        <div className="text-left">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Date</p>
                          <p className="font-bold text-bg-dark">{formData.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 border-b border-gray-50 pb-4">
                        <div className="p-3 bg-bg-light rounded-xl"><Clock className="w-6 h-6 text-brand-purple" /></div>
                        <div className="text-left">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Time</p>
                          <p className="font-bold text-bg-dark">{formData.time} ({formData.timezone})</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-bg-light rounded-xl"><Video className="w-6 h-6 text-brand-purple" /></div>
                        <div className="text-left">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Platform</p>
                          <p className="font-bold text-bg-dark uppercase">{formData.platform === 'gmeet' ? 'Google Meet' : 'On-Site'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-16 flex justify-center space-x-6">
                    <button className="bg-bg-dark text-white px-10 py-4 rounded-[8px] font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">Add to Calendar</button>
                    <button onClick={() => window.location.href = '/'} className="border border-gray-200 text-bg-dark px-10 py-4 rounded-[8px] font-bold text-sm uppercase tracking-widest hover:bg-white hover:border-gray-300 transition-all active:scale-95">Website Portal</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Summary Sidebar */}
          {step < 5 && (
            <div className="lg:w-[380px]">
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 sticky top-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full -mr-12 -mt-12" />
                <h3 className="text-xs font-bold border-b border-gray-100 pb-4 mb-8 uppercase tracking-widest text-brand-gold flex items-center">
                  <span className="w-2 h-2 bg-brand-gold rounded-full mr-2 animate-pulse" />
                  Tactical Summary
                </h3>
                
                <div className="space-y-8 relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-bg-light rounded-xl flex items-center justify-center font-bold text-brand-purple text-lg">
                      {formData.departments.length > 0 ? formData.departments[0].charAt(0) : <Users className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Target Units</label>
                      <p className="font-bold text-xs text-bg-dark truncate max-w-[180px]">
                        {formData.departments.length > 0 ? formData.departments.join(', ') : '---'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Schedule</label>
                      <p className="font-bold text-xs text-bg-dark">{formData.date || '---'}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Time Slot</label>
                      <p className="font-bold text-xs text-bg-dark">{formData.time || '---'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Selected Platform</label>
                    <p className="font-bold text-xs text-bg-dark uppercase tracking-widest">{formData.platform === 'gmeet' ? 'Google Meet' : 'On-Site'}</p>
                  </div>

                  <div className="bg-bg-light rounded-[16px] p-5 flex items-start space-x-3 border border-gray-100 shadow-inner">
                    <Info className="w-4 h-4 text-brand-purple flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-text-muted leading-relaxed font-medium uppercase tracking-tighter">
                      A secured invitation will be dispatched upon transmission. Real-time encryption active.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
