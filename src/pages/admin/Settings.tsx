import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useSettings } from '../../context/SettingsContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Save, 
  Globe, 
  Mail, 
  Settings as SettingsIcon, 
  Shield, 
  Eye, 
  Video,
  Database,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { settings, loading } = useSettings();
  const [localSettings, setLocalSettings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings({
      ...localSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'settings', 'core'), {
        ...localSettings,
        updatedAt: serverTimestamp()
      });
      toast.success('Settings updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !localSettings) return <div className="p-10 flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div></div>;

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'meetings', name: 'Meeting Platforms', icon: Video },
    { id: 'email', name: 'Email Config', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'backup', name: 'Backup & Export', icon: Database },
  ];

  return (
    <div className="flex min-h-screen bg-bg-light">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-bg-dark">System Settings</h1>
            <p className="text-text-muted mt-1">Manage global configuration for the Berrionaire platform.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="premium-button bg-brand-purple text-white flex items-center space-x-2 shadow-lg shadow-brand-purple/20"
          >
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" /> : <Save className="w-4 h-4" />}
            <span>Save All Changes</span>
          </button>
        </header>

        <div className="flex gap-10">
          {/* Side Tabs */}
          <div className="w-64 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[12px] transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-brand-purple shadow-sm border border-purple-100 font-bold' 
                    : 'text-text-muted hover:bg-white/50'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-brand-purple' : 'text-gray-400'}`} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 premium-card">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xl font-bold border-b border-purple-50 pb-4 mb-6">General Configuration</h3>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold mb-2">Site Name</label>
                    <input 
                      name="siteName"
                      value={localSettings.siteName || ''}
                      onChange={handleChange}
                      className="w-full premium-input p-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Contact Email</label>
                    <input 
                      name="contactEmail"
                      value={localSettings.contactEmail || ''}
                      onChange={handleChange}
                      className="w-full premium-input p-4"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Platform Vision</label>
                  <textarea 
                    name="vision"
                    value={localSettings.vision || ''}
                    onChange={handleChange}
                    className="w-full premium-input p-4 min-h-[100px]"
                  />
                </div>
                <div className="flex items-center justify-between p-6 bg-purple-50 rounded-[16px] border border-purple-100">
                  <div>
                    <p className="font-bold text-bg-dark">Allow Public Registration</p>
                    <p className="text-sm text-text-muted">Allow non-members to sign up from the website.</p>
                  </div>
                  <input 
                    type="checkbox"
                    name="allowRegistration"
                    checked={localSettings.allowRegistration || false}
                    onChange={handleChange}
                    className="w-6 h-6 text-brand-purple focus:ring-brand-purple rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-6 bg-red-50 rounded-[16px] border border-red-100">
                  <div>
                    <p className="font-bold text-red-900">Maintenance Mode</p>
                    <p className="text-sm text-red-700">Puts the site into maintenance mode for all users except admins.</p>
                  </div>
                  <input 
                    type="checkbox"
                    name="maintenanceMode"
                    checked={localSettings.maintenanceMode || false}
                    onChange={handleChange}
                    className="w-6 h-6 text-red-600 focus:ring-red-600 rounded"
                  />
                </div>
              </div>
            )}

            {activeTab === 'meetings' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-xl font-bold border-b border-purple-50 pb-4 mb-6">Meeting Platform Integration</h3>
                <div className="space-y-6">
                  <div className="p-6 border border-green-100 rounded-[16px] bg-green-50/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Video className="w-6 h-6 text-green-600" />
                        <span className="font-bold text-green-900">Google Meet</span>
                      </div>
                      <input 
                        type="checkbox"
                        name="gmeetEnabled"
                        checked={localSettings.gmeetEnabled || false}
                        onChange={handleChange}
                        className="w-6 h-6 text-green-600 focus:ring-green-600 rounded"
                      />
                    </div>
                    <p className="text-sm text-green-700 mb-4">Provide your Personal Google Meet link to be used for all automatic 'gmeet' scheduling.</p>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-green-700 mb-2">Personal Meeting Link (URL)</label>
                        <input 
                          type="url"
                          name="gmeetPersonalLink"
                          value={localSettings.gmeetPersonalLink || ''}
                          onChange={handleChange}
                          placeholder="https://meet.google.com/xxx-xxxx-xxx"
                          className="w-full premium-input p-3 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border border-pink-100 rounded-[16px] bg-pink-50/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-6 h-6 text-brand-purple" />
                        <span className="font-bold text-pink-900">On-Site Integration</span>
                      </div>
                      <input 
                        type="checkbox"
                        name="onsiteEnabled"
                        checked={localSettings.onsiteEnabled || false}
                        onChange={handleChange}
                        className="w-6 h-6 text-brand-purple focus:ring-pink-600 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-pink-700 mb-2">HQ Address</label>
                        <input 
                          type="text"
                          name="hqAddress"
                          value={localSettings.hqAddress || 'HQ Office, Meeting Room A'}
                          onChange={handleChange}
                          className="w-full premium-input p-3 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold border-b border-purple-50 pb-4 mb-6">Email SMTP & Templates</h3>
                <div className="p-12 text-center text-text-muted italic bg-purple-50/50 rounded-[16px] border border-dashed border-purple-200">
                  <Mail className="w-12 h-12 text-purple-200 mx-auto mb-4" />
                  <p>Advanced email configuration and templates are available in the Cloud Functions console.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
