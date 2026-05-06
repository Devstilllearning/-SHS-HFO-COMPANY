import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  User, 
  Camera, 
  Save, 
  Shield, 
  Mail, 
  Briefcase,
  MapPin,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    department: profile?.department || '',
    role: profile?.role || 'marketing_member'
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        updatedAt: serverTimestamp()
      });
      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `users/${user.uid}/avatar`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url });
      toast.success('Avatar updated!');
    } catch (error: any) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-light">
      <Sidebar />
      <main className="flex-1 ml-[280px] h-full flex flex-col">
        <header className="h-20 flex items-center justify-between px-10 border-b border-gray-100 bg-white">
          <div>
            <h1 className="text-3xl font-serif font-bold text-bg-dark">My Profile</h1>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-bold">Personal Management Hub</p>
          </div>
        </header>

        <section className="p-10 flex-1 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Panel: Profile Visual */}
            <div className="space-y-6">
              <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 text-center py-10 px-6">
                <div className="relative inline-block group mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-brand-purple border-4 border-white shadow-xl flex items-center justify-center text-4xl font-bold text-white">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      profile?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-brand-purple text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white">
                    <Camera className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                </div>
                <h3 className="text-2xl font-serif font-bold text-bg-dark">{profile?.name}</h3>
                <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mt-1">
                  {profile?.role?.replace('_', ' ')}
                </p>
                
                <div className="mt-8 pt-8 border-t border-gray-100 space-y-4 text-left">
                  <div className="flex items-center space-x-3 text-text-muted">
                    <Mail className="w-4 h-4 text-brand-purple" />
                    <span className="text-xs font-medium truncate">{profile?.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-text-muted">
                    <Briefcase className="w-4 h-4 text-brand-purple" />
                    <span className="text-xs font-medium">{profile?.department || 'General Department'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-bg-dark rounded-[16px] text-white p-8 border border-white/10 shadow-xl shadow-bg-dark/20">
                <div className="flex items-center space-x-3 mb-6 font-serif">
                  <Shield className="w-6 h-6 text-brand-gold" />
                  <h4 className="font-bold text-lg">Identity Guard</h4>
                </div>
                <p className="text-xs text-brand-purple/80 font-bold uppercase tracking-tighter mb-4">Account Integrity</p>
                <p className="text-sm text-purple-200 mb-6 leading-relaxed opacity-80 italic">
                  Protocols active. Your digital identity is secured with enterprise-grade encryption.
                </p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-white/10">
                  Update Password
                </button>
              </div>
            </div>

            {/* Right Panel: Edit Form */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-8">
                <h3 className="text-xl font-serif font-bold text-bg-dark border-b border-gray-100 pb-6 mb-8">Professional Dossier</h3>
                <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Public Representative Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 rounded-[8px] bg-bg-light border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all outline-none"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Role Assignment</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 rounded-[8px] bg-bg-light border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all outline-none appearance-none"
                      >
                        <option value="marketing_member">Marketing Member</option>
                        <option value="marketing_manager">Marketing Manager</option>
                        <option value="secretary_member">Secretary Member</option>
                        <option value="secretary_manager">Secretary Manager</option>
                        <option value="fb_member">F&B Member</option>
                        <option value="fb_manager">F&B Manager</option>
                        <option value="souvenir_member">Souvenir Member</option>
                        <option value="souvenir_manager">Souvenir Manager</option>
                        <option value="treasurer_member">Treasurer Member</option>
                        <option value="treasurer_manager">Treasurer Manager</option>
                        <option value="ceo">CEO</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Executive Bio</label>
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full p-4 rounded-[8px] bg-bg-light border border-gray-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 transition-all outline-none min-h-[160px]"
                      placeholder="Brief overview of your professional trajectory..."
                    />
                    <p className="mt-2 text-[10px] text-text-muted font-bold uppercase tracking-tighter opacity-60">Visible to team leads and strategic partners.</p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      disabled={loading}
                      className="px-8 py-4 bg-brand-purple text-white rounded-[8px] font-bold text-sm uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-brand-purple/20 hover:bg-opacity-90 active:scale-[0.98] transition-all"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Commit Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
