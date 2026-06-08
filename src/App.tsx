/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Smartphone,
  Globe,
  FileText,
  Clock,
  Github,
  Award,
  BookOpen,
  Info,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import OwnerDashboard from './components/OwnerDashboard';
import EmployeeConsole from './components/EmployeeConsole';
import CustomerTracking from './components/CustomerTracking';
import PRDDocument from './components/PRDDocument';
import { LaughDryDatabase } from './data/mockDatabase';

export default function App() {
  const [isAndroidApp] = useState<boolean>(() => {
    return Capacitor.isNativePlatform() || window.location.search.includes('platform=android');
  });
  const [activeConsole, setActiveConsole] = useState<'owner' | 'karyawan' | 'pelanggan'>(() => {
    const isApp = Capacitor.isNativePlatform() || window.location.search.includes('platform=android');
    return isApp ? 'karyawan' : 'owner';
  });
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('laughdry_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    async function syncData() {
      setIsSyncing(true);
      await LaughDryDatabase.syncFromFirestore();
      setIsSyncing(false);
    }
    syncData();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('laughdry_theme', theme);
  }, [theme]);

  // Login management
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(() => {
    return localStorage.getItem('laughdry_owner_logged_in') === 'true';
  });
  
  const [loggedInCashier, setLoggedInCashier] = useState<any | null>(() => {
    const stored = localStorage.getItem('laughdry_logged_in_cashier');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [ownerPasswordInput, setOwnerPasswordInput] = useState('');
  const [cashierUsernameInput, setCashierUsernameInput] = useState('');
  const [cashierPasswordInput, setCashierPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleOwnerLogin = (e: FormEvent) => {
    e.preventDefault();
    if (ownerPasswordInput === 'owner') {
      setIsOwnerLoggedIn(true);
      localStorage.setItem('laughdry_owner_logged_in', 'true');
      setLoginError(null);
      setOwnerPasswordInput('');
    } else {
      setLoginError('Password Owner salah! (Petunjuk: password adalah "owner")');
    }
  };

  const handleCashierLogin = (e: FormEvent) => {
    e.preventDefault();
    const users = LaughDryDatabase.getUsers();
    const found = users.find(u => 
      u.role === 'karyawan' && 
      u.username.toLowerCase() === cashierUsernameInput.trim().toLowerCase()
    );

    if (found && found.password === cashierPasswordInput) {
      setLoggedInCashier(found);
      localStorage.setItem('laughdry_logged_in_cashier', JSON.stringify(found));
      setLoginError(null);
      setCashierUsernameInput('');
      setCashierPasswordInput('');
    } else {
      setLoginError('Username atau Password kasir salah! (Petunjuk: gunakan "rian" / "rian123")');
    }
  };

  const handleOwnerLogout = () => {
    setIsOwnerLoggedIn(false);
    localStorage.removeItem('laughdry_owner_logged_in');
  };

  const handleCashierLogout = () => {
    setLoggedInCashier(null);
    localStorage.removeItem('laughdry_logged_in_cashier');
  };

  useEffect(() => {
    // Clear login error when changing tabs
    setLoginError(null);
  }, [activeConsole]);

  useEffect(() => {
    // Standard visual Clock ticking
    const updateTime = () => {
      const date = new Date();
      setCurrentTime(date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans" id="laughdry-application-shell">
      
      {/* Universal Workspace Header bar */}
      <header className="bg-[#0F172A] text-white border-b border-slate-800 sticky top-0 z-40 px-4 md:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#38BDF8] to-blue-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shadow-sky-500/10">
              LD
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
                  LaughDry
                </span>
                <span className="text-[10px] bg-slate-500/20 text-[#38BDF8] font-bold px-1.5 py-0.5 rounded uppercase border border-slate-500/30">
                  {isAndroidApp ? 'Android App v2.0' : 'Kita v2.0'}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 font-medium">
                {isAndroidApp ? 'Aplikasi POS Layanan & Absensi Toko' : 'Sistem POS & Analitik Laundry Kelas Dunia'}
              </p>
            </div>
          </div>

          {/* Real-time system log details */}
          <div className="flex items-center gap-5 text-xs text-slate-400">
            <div className="hidden lg:flex items-center gap-1.5 font-mono">
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-green-400 animate-ping'}`}></span>
              <span className="text-[11px] font-bold uppercase text-slate-200">
                {isSyncing ? 'Firestore: Menyelaraskan...' : 'Firestore: Aktif & Sinkron'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/50">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-mono text-[10.5px] font-bold text-white tracking-widest">{currentTime}</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/50 transition-all text-[#38BDF8] hover:bg-slate-700 cursor-pointer flex items-center justify-center gap-1 w-9 h-9"
              title={theme === 'light' ? 'Ganti ke Mode Gelap' : 'Ganti ke Mode Terang'}
              id="theme-toggler"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Navigation Portal Switcher Strip */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <strong className="text-slate-800 text-xs font-black uppercase tracking-wider block">Pilih Portal Akses:</strong>
            <p className="text-[11px] text-slate-400 select-none">
              {isAndroidApp 
                ? 'Portal Android aktif. Kelola pesanan baru, catat pengeluaran, lakukan absensi, atau pantau performa bisnis sebagai owner.'
                : 'Pilih menu layanan di bawah ini untuk mengakses Dasbor Owner, Aplikasi POS Karyawan Kasir, atau Portal Pelacakan Mandiri Pelanggan.'}
            </p>
          </div>

          {/* Action Selector Grid Tab */}
          <div className={`grid ${isAndroidApp ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'} gap-2 w-full lg:w-auto`}>
            {/* Owner Button */}
            <button
              onClick={() => setActiveConsole('owner')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                activeConsole === 'owner'
                  ? 'bg-[#1E293B] text-[#38BDF8] shadow-md shadow-[#38BDF8]/10 scale-[1.02]'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
              id="role-switch-owner"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dasbor Owner
            </button>

            {/* Employee/Kasir Button */}
            <button
              onClick={() => setActiveConsole('karyawan')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all ${
                activeConsole === 'karyawan'
                  ? 'bg-[#1E293B] text-[#38BDF8] shadow-md shadow-[#38BDF8]/10 scale-[1.02]'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
              id="role-switch-employee"
            >
              <Smartphone className="w-4 h-4" />
              POS Karyawan
            </button>

            {/* Customer Tracking Button - Web only */}
            {!isAndroidApp && (
              <button
                onClick={() => setActiveConsole('pelanggan')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all md:col-span-1 col-span-2 ${
                  activeConsole === 'pelanggan'
                    ? 'bg-[#1E293B] text-[#38BDF8] shadow-md shadow-[#38BDF8]/10 scale-[1.02]'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
                id="role-switch-customer"
              >
                <Globe className="w-4 h-4" />
                Situs Tracking
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6">

        {/* Dynamic viewport renderer switch */}
        <AnimatePresence mode="wait">
          {activeConsole === 'owner' && (
            <motion.div
              key="owner-console"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full"
            >
              {isOwnerLoggedIn ? (
                <OwnerDashboard 
                  onLogout={handleOwnerLogout} 
                  onSwitchConsole={(consoleType) => setActiveConsole(consoleType)} 
                />
              ) : (
                <div className="max-w-md mx-auto my-8 bg-white p-8 rounded-3xl border border-slate-200/85 shadow-xl space-y-6 animate-scaleIn font-sans">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center">
                      <LayoutDashboard className="w-6 h-6 text-slate-800" />
                    </div>
                    <h3 className="font-extrabold text-[#0D1B2A] text-xl">Login Owner</h3>
                    <span className="text-xs text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-100 block max-w-max mx-auto font-bold uppercase tracking-wider">Akses Terlarang</span>
                    <p className="text-xs text-slate-500">Silakan masukkan password akun owner untuk masuk ke dasbor analitik bisnis LaughDry.</p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-650 rounded-xl text-xs font-semibold leading-relaxed animate-shake">
                      ⚠️ {loginError}
                    </div>
                  )}

                  <form onSubmit={handleOwnerLogin} className="space-y-4">
                    <div className="space-y-1.5 text-xs">
                      <label className="text-slate-500 font-bold block">Password Owner:</label>
                      <input
                        type="password"
                        required
                        value={ownerPasswordInput}
                        onChange={(e) => setOwnerPasswordInput(e.target.value)}
                        placeholder="Masukkan password Anda..."
                        className="w-full bg-slate-50 border border-slate-200 focus:border-slate-800 focus:bg-white rounded-xl p-3 focus:outline-none font-bold text-slate-800 tracking-widest text-center"
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-extrabold hover:bg-slate-800 transition shadow-lg active:scale-[0.98]"
                    >
                      Log In Sebagai Owner ➔
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {activeConsole === 'karyawan' && (
            <motion.div
              key="karyawan-console"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full"
            >
              {loggedInCashier ? (
                <EmployeeConsole loggedInUser={loggedInCashier} onLogout={handleCashierLogout} />
              ) : (
                <div className="max-w-md mx-auto my-8 bg-white p-8 rounded-3xl border border-slate-200/85 shadow-xl space-y-6 animate-scaleIn font-sans">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto bg-sky-50 rounded-2xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-sky-600" />
                    </div>
                    <h3 className="font-extrabold text-[#0D1B2A] text-xl">Login Kasir</h3>
                    <span className="text-xs text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded border border-sky-100 block max-w-max mx-auto font-bold uppercase tracking-wider">Operator POS</span>
                    <p className="text-xs text-slate-500">Masukkan username dan password kasir yang bertugas di mesin POS cabang aktif.</p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-650 rounded-xl text-xs font-semibold leading-relaxed animate-shake">
                      ⚠️ {loginError}
                    </div>
                  )}

                  <form onSubmit={handleCashierLogin} className="space-y-4 text-xs font-sans">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold block">Username Kasir:</label>
                      <input
                        type="text"
                        required
                        value={cashierUsernameInput}
                        onChange={(e) => setCashierUsernameInput(e.target.value.toLowerCase().replace(/\s/g, ''))}
                        placeholder="Contoh: rian"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl p-3 focus:outline-none text-slate-800 font-bold"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 font-bold block">Password:</label>
                      <input
                        type="password"
                        required
                        value={cashierPasswordInput}
                        onChange={(e) => setCashierPasswordInput(e.target.value)}
                        placeholder="Masukkan password kasir..."
                        className="w-full bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl p-3 focus:outline-none text-slate-800 font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-extrabold hover:bg-slate-800 transition shadow-lg active:scale-[0.98]"
                    >
                      Log In Sebagai Kasir ➔
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {activeConsole === 'pelanggan' && (
            <motion.div
              key="pelanggan-console"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full"
            >
              <CustomerTracking />
            </motion.div>
          )}

          {/* End of consoles */}
        </AnimatePresence>

      </main>

      {/* Clean Footer Bar */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-400 font-sans mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <strong>LaughDry &copy; 2026</strong> &mdash; Sistem Manajemen Laundry Terintegrasi Premium.
          </div>
          <div className="flex gap-4">
            <span className="font-semibold text-slate-600">SaaS POS, CRM, ERP, & Business Intelligence</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400 font-mono">PostgreSQL DDL & REST API Compliant</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
