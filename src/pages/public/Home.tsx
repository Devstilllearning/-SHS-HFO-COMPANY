import { motion } from 'motion/react';
import Navbar from '../../components/layout/Navbar';
import { useSettings } from '../../context/SettingsContext';
import { ArrowRight, Users, Lightbulb, ShieldCheck, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../../components/ui/Logo';

export default function Home() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-bg-light overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-bg-dark text-white min-h-screen flex items-center relative overflow-hidden pt-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-brand-purple/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[140px] animate-pulse [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-10 relative z-10 w-full">
          <div className="lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1 bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-bold uppercase tracking-[0.4em] rounded-full mb-8 shadow-xl"
            >
              The Pinnacle of Coordination
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-serif font-bold leading-[1.1] mb-8"
            >
              Where Diversity Meets <span className="text-brand-gold italic">Absolute</span> Precision.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl text-purple-100/70 max-w-2xl font-light leading-relaxed mb-12"
            >
              Orchestrating global talent through a premium architectural ecosystem 
              designed for the strategic elite.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-6"
            >
              <Link to="/schedule" className="group relative bg-brand-gold text-bg-dark px-10 py-5 rounded-[8px] font-bold text-sm uppercase tracking-widest flex items-center space-x-3 overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-brand-gold/20">
                <span className="relative z-10">Start Coordination</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </Link>
              <Link to="/about" className="bg-white/5 backdrop-blur-xl text-white border border-white/10 px-10 py-5 rounded-[8px] font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
                The Heritage
              </Link>
            </motion.div>
            
            <div className="mt-20 flex flex-wrap items-center gap-8 opacity-40">
              <div className="flex items-center space-x-3 grayscale hover:grayscale-0 transition-all">
                <Video className="w-5 h-5 text-green-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Google Strategic Partner</span>
              </div>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <div className="flex items-center space-x-3 grayscale hover:grayscale-0 transition-all">
                <Video className="w-5 h-5 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Zoom Enterprise Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-40 px-10 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <p className="text-brand-purple font-bold text-xs uppercase tracking-[0.4em] mb-6">Our North Star</p>
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-bg-dark mb-8">The Architectural Vision</h2>
            <p className="text-xl text-text-muted leading-relaxed font-light italic">
              {settings?.vision || "We aim to redefine organizational management by blending diverse perspectives with architecturally sound technological solutions."}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Users, title: "Infinite Diversity", color: "brand-purple", desc: "Celebrating the spectrum of human perspective as our core engine of growth." },
              { icon: Lightbulb, title: "Absolute Innovation", color: "brand-gold", desc: "Pushing the boundaries of the possible with radical, strategic engineering." },
              { icon: ShieldCheck, title: "Elite Integrity", color: "brand-red", desc: "Uncompromising commitment to excellence in every digital interaction." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-bg-light p-12 rounded-[32px] border border-gray-100 transition-all group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-4"
              >
                <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 border border-gray-50">
                  <item.icon className="w-10 h-10 text-bg-dark" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-bg-dark mb-4">{item.title}</h3>
                <p className="text-text-muted leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* Mission Section */}
      <section className="py-40 bg-bg-dark text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            {[
              { title: "Strategic Mission", content: settings?.mission1 },
              { title: "Tactical Growth", content: settings?.mission2 },
              { title: "Global Mandate", content: settings?.mission3 }
            ].map((mission, idx) => (
              <div key={idx} className="space-y-6 group">
                <div className="w-12 h-0.5 bg-brand-gold group-hover:w-24 transition-all duration-700" />
                <h4 className="text-[10px] font-bold text-brand-gold uppercase tracking-[0.4em]">{mission.title}</h4>
                <p className="text-3xl font-serif font-light leading-snug italic opacity-80 group-hover:opacity-100 transition-opacity">
                  "{mission.content || "Empower every strategic node with tools that inspire absolute efficiency."}"
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(190,18,60,0.05),transparent_50%)]" />
      </section>

      {/* Footer */}
      <footer className="bg-bg-dark text-white py-24 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
            <div className="col-span-2 space-y-10">
              <Link to="/">
                <Logo showText size="lg" />
              </Link>
              <p className="text-purple-100/50 max-w-sm text-lg font-light leading-relaxed">
                The definitive platform for organizational architecture and strategic global coordination.
              </p>
              <div className="flex space-x-6">
                 {['Instagram', 'LinkedIn', 'Twitter'].map(link => (
                   <a key={link} href="#" className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:text-white transition-colors">{link}</a>
                 ))}
              </div>
            </div>
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-10 text-white/40">Navigation</h5>
              <ul className="space-y-6 text-sm font-bold uppercase tracking-widest text-purple-100/60">
                <li><Link to="/about" className="hover:text-brand-gold transition-colors">Our Heritage</Link></li>
                <li><Link to="/team" className="hover:text-brand-gold transition-colors">The Orchestrators</Link></li>
                <li><Link to="/schedule" className="hover:text-brand-gold transition-colors">Schedule Access</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-10 text-white/40">Executive</h5>
              <ul className="space-y-6 text-sm font-bold uppercase tracking-widest text-purple-100/60">
                <li><Link to="/login" className="hover:text-brand-gold transition-colors">Member Portal</Link></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Legal Briefings</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Strategic Support</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              &copy; {new Date().getFullYear()} Berrionaire International. All rights reserved.
            </p>
            <div className="flex space-x-8 text-[10px] font-bold uppercase tracking-widest text-white/20">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
