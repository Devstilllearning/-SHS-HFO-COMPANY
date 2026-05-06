import Navbar from '../../components/layout/Navbar';
import { useSettings } from '../../context/SettingsContext';
import { motion } from 'motion/react';
import { Target, Heart, Zap, Globe } from 'lucide-react';

export default function About() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-bg-light">
      <Navbar />
      
      {/* Header */}
      <section className="bg-bg-dark text-white pt-48 pb-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 bg-brand-gold text-bg-dark text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-8 shadow-lg shadow-brand-gold/10"
          >
            Institutional Heritage
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-6xl md:text-8xl font-serif font-bold mb-10 leading-tight"
          >
            The Berrionaire <span className="text-brand-gold italic">Legacy</span>.
          </motion.h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto italic opacity-80 leading-relaxed font-serif">
            "We do not merely create solutions; we curate architectural symphonies of human potential and absolute digital precision."
          </p>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-purple/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Vision & Mission Deep Dive */}
      <section className="py-32 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-brand-gold font-bold text-xs uppercase tracking-widest">Our North Star</p>
                <h2 className="text-5xl font-serif font-bold text-bg-dark leading-tight">Mastering Global <br/><span className="italic">Synergies</span>.</h2>
              </div>
              <p className="text-xl text-text-muted leading-relaxed font-light">
                {settings?.vision || "Berrionaire was founded on the belief that the world's most complex problems require multifaceted perspectives. We don't just manage teams; we orchestrate high-fidelity strategic alignment."}
              </p>
              <div className="flex items-center space-x-6 p-8 bg-white rounded-[24px] shadow-xl shadow-gray-100 border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-2 h-full bg-brand-gold" />
                <div className="w-14 h-14 bg-bg-light rounded-[16px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Target className="w-7 h-7 text-brand-purple" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Strategic Objective</p>
                  <p className="font-bold text-bg-dark text-lg leading-tight">100% Efficiency through absolute inclusive coordination.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-12">
              {[
                { icon: Heart, title: "Noble Mission", text: settings?.mission1, color: 'text-brand-red' },
                { icon: Zap, title: "Technological Apex", text: settings?.mission2, color: 'text-brand-gold' },
                { icon: Globe, title: "Infinite Reach", text: settings?.mission3, color: 'text-brand-purple' }
              ].map((item, idx) => (
                <div key={idx} className="flex space-x-8 group">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <item.icon className={`w-7 h-7 ${item.color}`} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-serif font-bold text-bg-dark">{item.title}</h4>
                    <p className="text-text-muted leading-relaxed">{item.text || "Committed to driving excellence through state-of-the-art technological tools and emotional intelligence."}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-32 bg-bg-dark relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-10 relative z-10">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <p className="text-brand-gold font-bold text-xs uppercase tracking-[0.4em] mb-4">Core Philosophy</p>
            <h2 className="text-5xl font-serif font-bold text-white mb-6">The Platinum Principles</h2>
            <div className="w-24 h-1 bg-brand-gold/30 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Transparency', 'Resilience', 'Empathy', 'Excellence', 'Speed', 'Synergy', 'Impact', 'Diversity'].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -8, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                className="p-10 border border-white/10 rounded-[24px] bg-white/5 text-center transition-all duration-300 backdrop-blur-sm shadow-xl shadow-black/20"
              >
                <div className="text-brand-gold font-serif text-4xl mb-4 italic font-light opacity-60">0{idx + 1}</div>
                <h4 className="font-bold tracking-[0.2em] uppercase text-[10px] text-white/90">{item}</h4>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(107,33,168,0.1),transparent_70%)]" />
      </section>
    </div>
  );
}
