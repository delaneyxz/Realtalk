import React, { useState, useEffect } from 'react';
import { auth, db, collection, onSnapshot, query, orderBy, setDoc, doc, updateDoc, deleteDoc, Timestamp, signOut } from '../firebase';
import { UserProfile, Account } from '../types';
import AlienAnimation from './AlienAnimation';
import AccountTable from './AccountTable';
import { LogOut, User as UserIcon, Plus, X, ShieldCheck, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    gmail: '',
    password: '',
    twoFactor: '',
    status: 'Pending' as 'Ok' | 'Pending'
  });

  useEffect(() => {
    const q = query(collection(db, 'accounts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Account[];
      setAccounts(accData);
      setLoading(false);
    }, (error) => {
      console.error('Firestore Error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        gmail: account.gmail,
        password: account.password,
        twoFactor: account.twoFactor || '',
        status: account.status
      });
    } else {
      setEditingAccount(null);
      setFormData({
        gmail: '',
        password: '',
        twoFactor: '',
        status: 'Pending'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await updateDoc(doc(db, 'accounts', editingAccount.id), {
          ...formData,
          updatedAt: Timestamp.now()
        });
      } else {
        const newDocRef = doc(collection(db, 'accounts'));
        await setDoc(newDocRef, {
          ...formData,
          createdBy: user.username,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving account:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteDoc(doc(db, 'accounts', id));
      } catch (err) {
        console.error('Error deleting account:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-100">RealTalk</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
              <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <span className="text-sm font-medium text-zinc-300">{user.username}</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                {user.role}
              </span>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section with 3D Alien */}
        <section className="relative bg-zinc-900/30 rounded-3xl border border-zinc-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          <AlienAnimation />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500/50">System Core Active</h2>
          </div>
        </section>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Account Management</h1>
            <p className="text-sm text-zinc-500">Real-time team data synchronization</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-emerald-500 text-emerald-950 font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            Add Account
          </button>
        </div>

        {/* Table Section */}
        <AccountTable 
          accounts={accounts} 
          onEdit={handleOpenModal} 
          isAdmin={user.role === 'admin'} 
        />
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">{editingAccount ? 'Edit Account' : 'New Account'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Gmail Address</label>
                    <input
                      required
                      type="email"
                      value={formData.gmail}
                      onChange={(e) => setFormData({ ...formData, gmail: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                      placeholder="example@gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Password</label>
                    <input
                      required
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">2FA Code / Secret</label>
                    <input
                      type="text"
                      value={formData.twoFactor}
                      onChange={(e) => setFormData({ ...formData, twoFactor: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'Ok' })}
                        className={cn(
                          "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all font-medium text-sm",
                          formData.status === 'Ok' 
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" 
                            : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Ok
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'Pending' })}
                        className={cn(
                          "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all font-medium text-sm",
                          formData.status === 'Pending' 
                            ? "bg-amber-500/10 border-amber-500/50 text-amber-500" 
                            : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                        )}
                      >
                        <Clock className="w-4 h-4" />
                        Pending
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  {editingAccount && user.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingAccount.id)}
                      className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-zinc-100 text-zinc-950 font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-100/10"
                  >
                    {editingAccount ? 'Update Account' : 'Create Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
