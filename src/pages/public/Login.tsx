import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, Chrome, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { seedDemoData } from '../../utils/seed';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDemoData();
      toast.success('System seeded! You can now login with admin credentials.');
    } catch (error: any) {
      toast.error('Seeding failed: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in database
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || 'Member',
          email: user.email,
          photoURL: user.photoURL || '',
          role: 'marketing_member', // Default role
          department: 'Marketing', // Default department
          isActive: true,
          bio: 'New member joining via strategic integration.',
          createdAt: serverTimestamp()
        });
        toast.success('Account created successfully!');
      } else {
        toast.success('Welcome back!');
      }

      navigate('/dashboard');
    } catch (error: any) {
      console.error("Google Login error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Panel - Brand */}
      <div className="md:w-1/2 bg-bg-dark text-white p-12 flex flex-col justify-between relative">
        <Link to="/" className="flex items-center space-x-2 text-brand-gold hover:opacity-80 transition-all z-10">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium underline underline-offset-4">Back to Website</span>
        </Link>
        
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-6xl font-serif font-bold mb-6"
          >
            Welcome to the <br /> <span className="text-brand-gold">Berrionaire</span> Portal.
          </motion.h1>
          <p className="text-purple-200 text-lg max-w-md">
            The exclusive workspace for the world's most innovative teams. 
            Sign in to manage your meetings, collaborate with your department, 
            and track organizational growth.
          </p>
        </div>
        
        <div className="text-sm text-purple-400 z-10">
          &copy; {new Date().getFullYear()} Berrionaire Official.
        </div>

        {/* Abstract background elements */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand-purple/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Right Panel - Form */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-8 md:p-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-12">
            <h2 className="text-3xl font-serif font-bold text-bg-dark">Sign In</h2>
            <p className="text-text-muted mt-2">Access your personalized member dashboard</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-[8px] border border-gray-200 bg-bg-light focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all outline-none"
                  placeholder="name@berrionaire.com"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-[8px] border border-gray-200 bg-bg-light focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all outline-none"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-brand-purple text-white py-4 rounded-[8px] font-bold text-sm uppercase tracking-widest hover:bg-opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand-purple/20"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Enter Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 uppercase tracking-widest font-medium">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full border-2 border-gray-100 py-4 rounded-[8px] font-bold text-gray-700 transition-all flex items-center justify-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-200'}`}
          >
            <Chrome className="w-5 h-5 text-red-500" />
            <span>Sign in with Google</span>
          </button>

          <p className="mt-10 text-center text-text-muted">
            Don't have an account? <span className="text-brand-purple font-bold">Contact your Department Manager</span>
          </p>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400 mb-4 uppercase tracking-widest font-bold">Developer Tools</p>
            <button 
              onClick={handleSeed}
              disabled={seeding}
              className="w-full bg-gray-50 border border-gray-200 text-gray-500 py-3 rounded-[8px] text-xs font-bold hover:bg-gray-100 transition-all flex items-center justify-center space-x-2"
            >
              {seeding ? 'Seeding...' : 'Seed Initial System Data (First Run)'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
