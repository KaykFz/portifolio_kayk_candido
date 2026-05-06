/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, RefreshCw, Layers, Maximize, Square, Circle, Sliders, Palette, Download, Upload, Github, User, LogIn, Heart, LogOut, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  Timestamp,
  User as FirebaseUser
} from './firebase';

// Error handling for Firestore
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Utility to lighten/darken colors for neumorphic shadows
const adjustColor = (color: string, amount: number) => {
  const clamp = (val: number) => Math.min(Math.max(val, 0), 255);
  
  // Simple hex to rgb
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);

  r = clamp(r + amount);
  g = clamp(g + amount);
  b = clamp(b + amount);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export default function App() {
  const [color, setColor] = useState('#e0e0e0');
  const [size, setSize] = useState(200);
  const [radius, setRadius] = useState(40);
  const [distance, setDistance] = useState(20);
  const [intensity, setIntensity] = useState(0.15);
  const [blur, setBlur] = useState(40);
  const [shape, setShape] = useState<'flat' | 'concave' | 'convex' | 'pressed'>('flat');
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Firebase State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [communityDesigns, setCommunityDesigns] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        // Sync user to Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          createdAt: serverTimestamp()
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    
    // Real-time community designs
    const q = query(
      collection(db, 'designs'), 
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(8)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const designs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommunityDesigns(designs);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'designs'));

    return () => unsubscribe();
  }, [isAuthReady]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
    } catch (err) {
      console.error("Login Error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const handleSaveDesign = async (isPublic: boolean = false) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const designName = prompt("Dê um nome ao seu design:", "Meu Design SoftDepth") || "Sem Nome";
      const designData = {
        uid: user.uid,
        name: designName,
        color,
        size,
        radius,
        distance,
        intensity,
        blur,
        shape,
        isPublic,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'designs'), designData);
      alert(isPublic ? "Design compartilhado com a comunidade!" : "Design salvo com sucesso!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'designs');
    } finally {
      setIsSaving(false);
    }
  };

  const siteBgColor = isDarkMode ? '#1a1a1a' : '#ffffff';
  const siteTextColor = isDarkMode ? '#f3f4f6' : '#111827';
  const siteSubTextColor = isDarkMode ? '#9ca3af' : '#4b5563';

  // Calculate shadows based on intensity and color
  const shadows = useMemo(() => {
    const darkIntensity = -Math.round(intensity * 255);
    const lightIntensity = Math.round(intensity * 255);
    
    const darkShadow = adjustColor(color, darkIntensity);
    const lightShadow = adjustColor(color, lightIntensity);

    return {
      dark: darkShadow,
      light: lightShadow
    };
  }, [color, intensity]);

  const neumorphicStyle = useMemo(() => {
    const { dark, light } = shadows;
    
    let background = color;
    if (shape === 'concave') {
      background = `linear-gradient(145deg, ${dark}, ${light})`;
    } else if (shape === 'convex') {
      background = `linear-gradient(145deg, ${light}, ${dark})`;
    }

    const boxShadow = shape === 'pressed' 
      ? `inset ${distance}px ${distance}px ${blur}px ${dark}, inset -${distance}px -${distance}px ${blur}px ${light}`
      : `${distance}px ${distance}px ${blur}px ${dark}, -${distance}px -${distance}px ${blur}px ${light}`;

    return {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${radius}px`,
      background,
      boxShadow,
      transition: 'all 0.3s ease'
    };
  }, [color, size, radius, distance, blur, shape, shadows]);

  const cssCode = `
background: ${neumorphicStyle.background};
border-radius: ${neumorphicStyle.borderRadius};
box-shadow: ${neumorphicStyle.boxShadow};
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const config = {
      color,
      size,
      radius,
      distance,
      intensity,
      blur,
      shape
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `softdepth-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        if (config.color) setColor(config.color);
        if (config.size) setSize(config.size);
        if (config.radius) setRadius(config.radius);
        if (config.distance) setDistance(config.distance);
        if (config.intensity) setIntensity(config.intensity);
        if (config.blur) setBlur(config.blur);
        if (config.shape) setShape(config.shape);
      } catch (err) {
        console.error("Erro ao importar arquivo:", err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center p-4 md:p-8 transition-all duration-500"
      style={{ backgroundColor: siteBgColor, color: siteTextColor }}
    >
      {/* Top Navigation */}
      <nav className="w-full max-w-6xl flex justify-between items-center mb-8 py-4 border-b border-gray-100/10">
        <div className="flex items-center gap-6">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
          >
            <Github size={16} />
            GitHub
          </a>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                  {user.photoURL ? <img src={user.photoURL} alt={user.displayName || ''} referrerPolicy="no-referrer" /> : <User size={16} className="m-auto mt-1" />}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest hidden md:block">{user.displayName || 'User'}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                <LogIn size={16} />
                Login
              </button>
              <button 
                onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  isDarkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
                }`}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      <header className="mb-12 text-center flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-4"
        >
          <SoftDepthLogo />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-2"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
          SoftDepth
        </motion.h1>
        <p className="font-medium mb-6" style={{ color: siteSubTextColor }}>Generate Soft-UI CSS code</p>
        
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 ${
            isDarkMode 
              ? 'bg-white text-gray-900 hover:bg-gray-200' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Preview Section */}
        <section className="flex items-center justify-center min-h-[400px] relative">
          <motion.div
            layout
            style={neumorphicStyle}
            className="flex items-center justify-center text-gray-400 font-bold text-xl"
          >
            <Layers size={48} opacity={0.2} />
          </motion.div>
        </section>

        {/* Controls Section */}
        <section className={`backdrop-blur-lg rounded-2xl p-6 shadow-2xl border max-w-md mx-auto lg:mx-0 transition-all duration-500 ${
          isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white/40 border-white/30'
        }`}>
          <div className="space-y-6">
            {/* Color Picker */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <Palette size={14} /> Background Color
              </label>
              <div className="flex gap-3 items-center">
                <div className="relative group">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className={`w-10 h-10 rounded-full cursor-pointer border-2 shadow-sm appearance-none overflow-hidden ${
                      isDarkMode ? 'border-gray-700' : 'border-white'
                    }`}
                  />
                </div>
                <input 
                  type="text" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={`flex-1 border rounded-xl px-3 py-1.5 font-mono text-xs focus:outline-none focus:ring-2 transition-all ${
                    isDarkMode 
                      ? 'bg-gray-800/60 border-gray-700 text-gray-300 focus:ring-gray-600' 
                      : 'bg-white/60 border-gray-100 text-gray-600 focus:ring-gray-400/50'
                  }`}
                />
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <ControlSlider 
                label="Size" 
                icon={<Maximize size={12} />}
                value={size} 
                min={50} 
                max={400} 
                onChange={setSize}
                isDarkMode={isDarkMode}
              />
              <ControlSlider 
                label="Radius" 
                icon={<Square size={12} />}
                value={radius} 
                min={0} 
                max={200} 
                onChange={setRadius}
                isDarkMode={isDarkMode}
              />
              <ControlSlider 
                label="Distance" 
                icon={<RefreshCw size={12} />}
                value={distance} 
                min={5} 
                max={50} 
                onChange={setDistance}
                isDarkMode={isDarkMode}
              />
              <ControlSlider 
                label="Intensity" 
                icon={<Sliders size={12} />}
                value={intensity} 
                min={0.05} 
                max={0.3} 
                step={0.01}
                onChange={setIntensity}
                isDarkMode={isDarkMode}
              />
              <div className="col-span-2">
                <ControlSlider 
                  label="Blur" 
                  icon={<RefreshCw size={12} className="rotate-45" />}
                  value={blur} 
                  min={0} 
                  max={100} 
                  onChange={setBlur}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* Shape Selection */}
            <div className="space-y-3">
              <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>Surface Shape</label>
              <div className={`flex justify-between items-center gap-2 p-1.5 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'
              }`}>
                {(['flat', 'concave', 'convex', 'pressed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setShape(s)}
                    title={s.charAt(0).toUpperCase() + s.slice(1)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all ${
                      shape === s 
                        ? (isDarkMode ? 'bg-gray-700 shadow-md scale-105' : 'bg-white shadow-md scale-105')
                        : (isDarkMode ? 'hover:bg-gray-700/40' : 'hover:bg-white/40')
                    }`}
                  >
                    <ShapePreview shape={s} color={color} shadows={shadows} />
                    <span className={`text-[9px] font-bold uppercase tracking-tighter ${
                      shape === s 
                        ? (isDarkMode ? 'text-white' : 'text-gray-900') 
                        : (isDarkMode ? 'text-gray-500' : 'text-gray-400')
                    }`}>
                      {s}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Output */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>CSS Snippet</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSaveDesign(false)}
                    disabled={isSaving}
                    title="Salvar Design"
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full transition-all active:scale-95 ${
                      isDarkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Save size={10} />
                    Save
                  </button>
                  <button 
                    onClick={() => handleSaveDesign(true)}
                    disabled={isSaving}
                    title="Compartilhar com a Comunidade"
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full transition-all active:scale-95 ${
                      isDarkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart size={10} />
                    Share
                  </button>
                  <button 
                    onClick={handleExport}
                    title="Exportar Configurações"
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full transition-all active:scale-95 ${
                      isDarkMode 
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Download size={10} />
                    Export
                  </button>
                  <label className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    <Upload size={10} />
                    Import
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                  </label>
                  <button 
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full transition-all active:scale-95 ${
                      isDarkMode 
                        ? 'bg-white text-gray-900 hover:bg-gray-200' 
                        : 'bg-gray-900 text-white hover:bg-black'
                    }`}
                  >
                    {copied ? <Check size={10} /> : <Copy size={10} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="relative group">
                <pre className={`p-3 rounded-xl text-[10px] font-mono overflow-x-auto border leading-relaxed ${
                  isDarkMode 
                    ? 'bg-gray-800/80 text-gray-400 border-gray-700' 
                    : 'bg-gray-50 text-gray-600 border-gray-100'
                }`}>
                  {cssCode}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-24 max-w-4xl text-center space-y-8 pb-20">
        <div className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: siteSubTextColor }}>
          SoftDepth &copy; 2026
        </div>
        <div className={`p-10 md:p-16 rounded-[40px] border shadow-sm backdrop-blur-sm transition-colors duration-500 ${
          isDarkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-gray-50/80 border-gray-100'
        }`}>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
            O que é <span style={{ color: isDarkMode ? '#9ca3af' : '#9ca3af' }}>SoftDepth</span>?
          </h2>
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-8 ${
            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            A Revolução da Soft UI
          </div>
          <p className="text-xl md:text-2xl leading-relaxed font-medium" style={{ color: siteSubTextColor }}>
            O SoftDepth (baseado em Soft UI) é uma tendência de design que combina o realismo do Esqueuomorfismo com o minimalismo do Flat Design. 
            Ele utiliza sombras claras e escuras para criar a ilusão de que os elementos estão "saindo" ou "entrando" na superfície do fundo, 
            proporcionando uma interface tátil, suave e futurista.
          </p>
        </div>
      </footer>

      {/* Community Templates Section */}
      <section className="w-full max-w-6xl mt-24 mb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Comunidade SoftDepth</h2>
            <p className="text-sm font-medium" style={{ color: siteSubTextColor }}>Explore templates criados pela comunidade</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50">
            <Heart size={14} className="text-red-500 fill-red-500" />
            Trending Now
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {communityDesigns.length > 0 ? communityDesigns.map((design) => (
            <TemplateCard 
              key={design.id}
              name={design.name} 
              config={design}
              onApply={(cfg) => {
                setColor(cfg.color); setSize(cfg.size); setRadius(cfg.radius);
                setDistance(cfg.distance); setIntensity(cfg.intensity); setBlur(cfg.blur); setShape(cfg.shape as any);
              }}
              isDarkMode={isDarkMode}
            />
          )) : (
            <>
              <TemplateCard 
                name="Deep Ocean" 
                config={{ color: '#2c3e50', size: 150, radius: 30, distance: 15, intensity: 0.15, blur: 30, shape: 'flat' }}
                onApply={(cfg) => {
                  setColor(cfg.color); setSize(cfg.size); setRadius(cfg.radius);
                  setDistance(cfg.distance); setIntensity(cfg.intensity); setBlur(cfg.blur); setShape(cfg.shape as any);
                }}
                isDarkMode={isDarkMode}
              />
              <TemplateCard 
                name="Soft Peach" 
                config={{ color: '#ffecd2', size: 150, radius: 50, distance: 10, intensity: 0.1, blur: 20, shape: 'concave' }}
                onApply={(cfg) => {
                  setColor(cfg.color); setSize(cfg.size); setRadius(cfg.radius);
                  setDistance(cfg.distance); setIntensity(cfg.intensity); setBlur(cfg.blur); setShape(cfg.shape as any);
                }}
                isDarkMode={isDarkMode}
              />
              <TemplateCard 
                name="Cyber Neon" 
                config={{ color: '#0f172a', size: 150, radius: 20, distance: 12, intensity: 0.25, blur: 25, shape: 'convex' }}
                onApply={(cfg) => {
                  setColor(cfg.color); setSize(cfg.size); setRadius(cfg.radius);
                  setDistance(cfg.distance); setIntensity(cfg.intensity); setBlur(cfg.blur); setShape(cfg.shape as any);
                }}
                isDarkMode={isDarkMode}
              />
              <TemplateCard 
                name="Minimal Clay" 
                config={{ color: '#f8fafc', size: 150, radius: 40, distance: 8, intensity: 0.08, blur: 15, shape: 'pressed' }}
                onApply={(cfg) => {
                  setColor(cfg.color); setSize(cfg.size); setRadius(cfg.radius);
                  setDistance(cfg.distance); setIntensity(cfg.intensity); setBlur(cfg.blur); setShape(cfg.shape as any);
                }}
                isDarkMode={isDarkMode}
              />
            </>
          )}
        </div>
      </section>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-md p-8 rounded-[40px] shadow-2xl border transition-colors duration-500 ${
                isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
              }`}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{authMode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h3>
                <p className="text-sm font-medium" style={{ color: siteSubTextColor }}>
                  {authMode === 'login' ? 'Entre para salvar seus designs' : 'Junte-se à comunidade SoftDepth'}
                </p>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={handleLogin}
                  className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 ${
                    isDarkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'
                  }`}
                >
                  <LogIn size={18} />
                  Entrar com Google
                </button>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100/10"></div></div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest opacity-30"><span>Ou</span></div>
                </div>
                <input 
                  type="email" 
                  placeholder="E-mail" 
                  className={`w-full px-6 py-4 rounded-2xl border focus:outline-none transition-all ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'
                  }`}
                />
                <input 
                  type="password" 
                  placeholder="Senha" 
                  className={`w-full px-6 py-4 rounded-2xl border focus:outline-none transition-all ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'
                  }`}
                />
                <button 
                  onClick={() => alert("Funcionalidade de e-mail em breve! Use o Google por enquanto.")}
                  className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                    isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
                </button>
              </div>
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-xs font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                >
                  {authMode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TemplateCard({ name, config, onApply, isDarkMode }: { name: string, config: any, onApply: (cfg: any) => void, isDarkMode: boolean, key?: string }) {
  const intensity = config.intensity;
  const color = config.color;
  const darkIntensity = -Math.round(intensity * 255);
  const lightIntensity = Math.round(intensity * 255);
  const dark = adjustColor(color, darkIntensity);
  const light = adjustColor(color, lightIntensity);

  let background = color;
  if (config.shape === 'concave') background = `linear-gradient(145deg, ${dark}, ${light})`;
  else if (config.shape === 'convex') background = `linear-gradient(145deg, ${light}, ${dark})`;

  const boxShadow = config.shape === 'pressed'
    ? `inset 4px 4px 8px ${dark}, inset -4px -4px 8px ${light}`
    : `4px 4px 8px ${dark}, -4px -4px 8px ${light}`;

  return (
    <motion.button
      whileHover={{ y: -5 }}
      onClick={() => onApply(config)}
      className={`p-6 rounded-[32px] border transition-all text-left group ${
        isDarkMode ? 'bg-gray-900/40 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex justify-center mb-6">
        <div 
          className="w-24 h-24 rounded-2xl transition-transform group-hover:scale-110"
          style={{ background, boxShadow, borderRadius: `${config.radius / 2}px` }}
        />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-bold tracking-tight">{name}</h4>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
          <span className="text-[10px] font-mono text-gray-400 uppercase">{color}</span>
        </div>
      </div>
    </motion.button>
  );
}

function SoftDepthLogo() {
  const dark = '#bebebe';
  const light = '#ffffff';
  const mainColor = '#e0e0e0';

  return (
    <div 
      className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
      style={{ 
        background: mainColor,
        boxShadow: `8px 8px 16px ${dark}, -8px -8px 16px ${light}`
      }}
    >
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-8 h-1.5 bg-gray-400 rounded-full mb-1 shadow-sm" />
        <div className="w-10 h-1.5 bg-gray-500 rounded-full mb-1 shadow-md" />
        <div className="w-8 h-1.5 bg-gray-600 rounded-full shadow-lg" />
      </div>
      {/* Inner depth effect */}
      <div 
        className="absolute inset-2 rounded-xl opacity-50"
        style={{ 
          boxShadow: `inset 4px 4px 8px ${dark}, inset -4px -4px 8px ${light}`
        }}
      />
    </div>
  );
}

function ShapePreview({ shape, color, shadows }: { shape: string, color: string, shadows: any }) {
  const { dark, light } = shadows;
  let background = color;
  if (shape === 'concave') background = `linear-gradient(145deg, ${dark}, ${light})`;
  else if (shape === 'convex') background = `linear-gradient(145deg, ${light}, ${dark})`;

  const boxShadow = shape === 'pressed'
    ? `inset 2px 2px 4px ${dark}, inset -2px -2px 4px ${light}`
    : `2px 2px 4px ${dark}, -2px -2px 4px ${light}`;

  return (
    <div 
      className="w-6 h-6 rounded-md"
      style={{ background, boxShadow }}
    />
  );
}

function ControlSlider({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  onChange,
  icon,
  isDarkMode
}: { 
  label: string, 
  value: number, 
  min: number, 
  max: number, 
  step?: number, 
  onChange: (val: number) => void,
  icon?: React.ReactNode,
  isDarkMode: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center px-0.5">
        <label className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${
          isDarkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {icon} {label}
        </label>
        <span className={`text-[9px] font-mono font-black ${
          isDarkMode ? 'text-gray-300' : 'text-gray-900'
        }`}>{value}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-1 rounded-full appearance-none cursor-pointer transition-all ${
          isDarkMode 
            ? 'bg-gray-800 accent-gray-400 hover:accent-white' 
            : 'bg-gray-200 accent-gray-900 hover:accent-gray-600'
        }`}
      />
    </div>
  );
}
