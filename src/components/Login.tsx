import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, db, doc, getDoc, setDoc, createUserWithEmailAndPassword, signInWithEmailAndPassword, collection, query, where, getDocs } from '../firebase';
import { LogIn, ShieldCheck, UserPlus, User as UserIcon, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        const username = user.displayName?.split(' ')[0] || 'Member';
        const role = user.email === 'r2.70xz@gmail.com' ? 'admin' : 'member';
        
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          username,
          role,
          email: user.email
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        // Check if username is taken
        const q = query(collection(db, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          throw new Error('Username already taken');
        }

        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        const role = email === 'r2.70xz@gmail.com' ? 'admin' : 'member';

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          username,
          role,
          email: user.email
        });
      } else {
        // Sign In
        // If they entered a username instead of email, we need to look it up
        let loginEmail = email;
        if (!email.includes('@')) {
          const q = query(collection(db, 'users'), where('username', '==', email));
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) {
            throw new Error('Username not found');
          }
          loginEmail = querySnapshot.docs[0].data().email;
        }
        await signInWithEmailAndPassword(auth, loginEmail, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">RealTalk</h1>
            <p className="text-zinc-400 text-sm">Welcome RealTalk</p>
          </div>

          {error && (
            <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="w-full space-y-4">
            <AnimatePresence mode="wait">
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="space-y-2 w-full text-left">
                    <label className="text-zinc-500 text-xs font-medium ml-1">Username</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        required
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2 w-full text-left">
              <label className="text-zinc-500 text-xs font-medium ml-1">Gmail or Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  required
                  type={isRegistering ? "email" : "text"}
                  placeholder={isRegistering ? "Gmail" : "Gmail or Username"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 w-full text-left">
              <label className="text-zinc-500 text-xs font-medium ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-12 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-zinc-100 text-zinc-950 font-semibold py-3.5 rounded-2xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-zinc-100/10"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isRegistering ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div className="w-full flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold py-3.5 rounded-2xl hover:bg-zinc-800 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            Sign in with Google
          </button>

          <div className="pt-4">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-emerald-500 text-sm font-medium hover:underline"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Create Account"}
            </button>
          </div>

          <p className="text-zinc-500 text-xs">
            Authorized team members only. Access is monitored.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
