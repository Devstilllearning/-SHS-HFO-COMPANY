import { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { motion } from 'motion/react';
import { Mail, Linkedin, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Team() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('role', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getRoleColor = (role: string) => {
    if (role.includes('ceo')) return 'text-brand-gold bg-brand-gold/10 border-brand-gold/30';
    if (role.includes('manager')) return 'text-brand-purple bg-brand-purple/10 border-brand-purple/30';
    return 'text-text-muted bg-gray-100 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-bg-light">
      <Navbar />
      
      <section className="pt-40 pb-24 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 bg-brand-purple/10 text-brand-purple text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-6"
            >
              Foundational Leaders
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-serif font-bold text-bg-dark mb-6 leading-tight"
            >
              The Orchestrators of <span className="text-brand-gold italic">Success</span>.
            </motion.h1>
            <p className="text-xl text-text-muted font-light leading-relaxed">
              Meet the strategic visionaries behind the Berrionaire mission, dedicated to curating absolute digital excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white h-96 rounded-[16px] animate-pulse shadow-sm border border-gray-100" />
              ))
            ) : users.map((member, idx) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-brand-purple flex items-center justify-center text-3xl font-bold text-white shadow-xl transform group-hover:scale-105 transition-transform duration-500 border-4 border-white">
                    {member.photoURL ? (
                      <img src={member.photoURL} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.role?.replace('_', ' ') || 'Member')}&background=random&color=fff&size=128`} alt={member.role} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-md ${member.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>

                <div className="mb-6 flex-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-2 mb-4 ${getRoleColor(member.role)}`}>
                    {member.role?.replace('_', ' ')}
                  </span>
                  <h3 className="text-3xl font-serif font-bold text-bg-dark mb-2 leading-tight">{member.name}</h3>
                  
                  <div className="mt-8 pt-8 border-t border-gray-50">
                    <p className="text-sm text-text-muted mb-8 line-clamp-3 leading-relaxed italic opacity-80">
                      "{member.bio || "Bringing excellence and innovation to every project at Berrionaire."}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex space-x-3">
                    <a href={`mailto:${member.email}`} className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-brand-purple transition-all bg-bg-light hover:bg-brand-purple/5 rounded-xl border border-gray-100">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                  <Link 
                    to="/schedule" 
                    className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-brand-purple hover:text-brand-gold transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Coordinate Session</span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
