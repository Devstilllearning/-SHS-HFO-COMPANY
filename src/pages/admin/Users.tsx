import { useEffect, useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  UserX, 
  CheckCircle, 
  Shield,
  Mail,
  Edit2
} from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const ROLES = [
    { value: 'superadmin', label: 'Superadmin' },
    { value: 'ceo', label: 'CEO' },
    { value: 'marketing_manager', label: 'Marketing Manager' },
    { value: 'marketing_member', label: 'Marketing Member' },
    { value: 'secretary_manager', label: 'Secretary Manager' },
    { value: 'secretary_member', label: 'Secretary Member' },
    { value: 'treasurer_manager', label: 'Treasurer Manager' },
    { value: 'treasurer_member', label: 'Treasurer Member' },
    { value: 'souvenir_manager', label: 'Souvenir Manager' },
    { value: 'souvenir_member', label: 'Souvenir Member' },
    { value: 'fb_manager', label: 'F&B Manager' },
    { value: 'fb_member', label: 'F&B Member' },
    { value: 'member', label: 'Member' },
  ];

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleStatus = async (user: any) => {
    try {
      await updateDoc(doc(db, 'users', user.id), {
        isActive: !user.isActive
      });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      setEditingUser(null);
      toast.success('Role updated successfully');
    } catch (error: any) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || 
                          u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex min-h-screen bg-bg-light">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-bg-dark">User Management</h1>
            <p className="text-text-muted mt-1">Control access, roles, and department assignments.</p>
          </div>
          <button className="premium-button bg-brand-purple text-white flex items-center space-x-2 shadow-lg shadow-brand-purple/20">
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-purple-100 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple" />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white border border-purple-100 rounded-[12px] focus:outline-none font-bold text-sm text-bg-dark appearance-none cursor-pointer hover:bg-purple-50 transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="superadmin">Superadmin</option>
                <option value="ceo">CEO</option>
                <option value="marketing_manager">Marketing Manager</option>
                <option value="marketing_member">Marketing Member</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="premium-card overflow-hidden p-0 border-none shadow-md">
          <table className="w-full text-left">
            <thead className="bg-purple-50 border-b border-purple-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">Role & Dept</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 bg-white">
              {loading ? (
                <tr>
                   <td colSpan={4} className="px-6 py-10 text-center text-text-muted">Loading users...</td>
                </tr>
              ) : filteredUsers.map((user, idx) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-purple-50/30 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple font-bold border border-brand-purple/20">
                        {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover rounded-full" /> : user.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-bg-dark">{user.name}</p>
                        <p className="text-xs text-text-muted flex items-center mt-1">
                          <Mail className="w-3 h-3 mr-1" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {editingUser === user.id ? (
                      <select 
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        onBlur={() => setEditingUser(null)}
                        autoFocus
                        className="text-xs font-bold bg-white border border-brand-purple rounded-md px-2 py-1 focus:outline-none ring-2 ring-brand-purple/20"
                      >
                        {ROLES.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex flex-col">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-purple/10 text-brand-purple uppercase tracking-tight w-fit">
                          {user.role?.replace('_', ' ')}
                        </span>
                        <p className="text-xs text-text-muted mt-1 font-medium">{user.department || 'Unassigned'}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => toggleStatus(user)}
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        user.isActive 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {user.isActive ? <CheckCircle className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      <span>{user.isActive ? 'Active' : 'Suspended'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end space-x-2">
                       <button 
                         onClick={() => setEditingUser(user.id)}
                         className="p-2 text-text-muted hover:text-brand-purple hover:bg-purple-50 rounded-lg transition-all" 
                         title="Edit Role"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button className="p-2 text-text-muted hover:text-brand-red hover:bg-red-50 rounded-lg transition-all" title="Delete User">
                         <UserX className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredUsers.length === 0 && (
            <div className="p-12 text-center text-text-muted">
              No users found matching your criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
