import React, { useState, useEffect, useRef } from 'react';
import { 
  auth, db, handleFirestoreError, OperationType 
} from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  BookOpen, 
  LogOut, 
  Plus, 
  Users as UsersIcon, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  CheckCircle,
  AlertTriangle,
  ClipboardList,
  Sprout,
  Menu,
  X,
  Book,
  BarChart as BarChartIcon,
  ShoppingBag,
  Package,
  History,
  ShoppingCart,
  Eye,
  EyeOff,
  Info,
  Smartphone,
  Bird,
  Fish,
  Waves,
  PawPrint,
  Grid as GridIcon,
  MapPin,
  Search,
  Globe,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit3,
  Recycle,
  Truck,
  ArrowRight,
  Utensils,
  Heart,
  UserPlus,
  ExternalLink,
  ShieldCheck,
  Baby,
  Activity,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserProfile, 
  UserRole, 
  Land, 
  SensorData, 
  OperationalLog,
  CropGuide,
  LivestockGuide,
  InventoryItem,
  Product,
  Buyer,
  Transaction,
  Livestock,
  ShopProduct,
  WasteManagement
} from './types';
import { CROP_GUIDES, LIVESTOCK_GUIDES } from './constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet marker fix
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// App Parts
type View = 'dashboard' | 'mapping' | 'guide' | 'livestockGuide' | 'auth' | 'team' | 'sales' | 'inventory' | 'livestock' | 'shops' | 'customerApps';

import { Language, translations } from './translations';

// Language Context
const LanguageContext = React.createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}>({
  lang: 'id',
  setLang: () => {},
  t: () => ''
});

const useLanguage = () => React.useContext(LanguageContext);

export default function App() {
  const [lang, setLang] = useState<Language>('id');
  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <MainApp />
    </LanguageContext.Provider>
  );
}

function MainApp() {
  const { lang, setLang, t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarMinimized, setSidebarMinimized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u) {
          const docRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setActiveView('auth');
          }
        } else {
          setProfile(null);
          setActiveView('auth');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  if (loading) return (
    <div className="min-h-screen bg-lime-cream flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-hunter-green"
      >
        <Sprout size={48} />
      </motion.div>
    </div>
  );

  if (!user || (!profile && activeView !== 'auth')) {
    if (user && !profile && !loading) {
      return (
        <div className="min-h-screen bg-evergreen flex flex-col items-center justify-center p-8 text-center">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6 max-w-md">
            <h2 className="text-xl font-black text-white mb-2 italic">Connection Error</h2>
            <p className="text-palm-leaf text-sm mb-4">We're having trouble connecting to the database. You might be offline or the connection is slow.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-lime-cream text-evergreen rounded-xl font-black uppercase tracking-widest text-[10px]"
            >
              Retry Connection
            </button>
          </div>
          <button onClick={handleLogout} className="text-palm-leaf text-xs underline uppercase tracking-widest">Logout</button>
        </div>
      );
    }
    return <AuthScreen setProfile={setProfile} />;
  }

  return (
    <div className="min-h-screen bg-evergreen text-lime-cream flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 ${isSidebarMinimized ? 'w-20' : 'w-64'} bg-gradient-to-b from-evergreen to-hunter-green text-lime-cream transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-fern/30 shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className={`p-4 flex flex-col h-full ${isSidebarMinimized ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 mb-10 transition-all duration-300 ${isSidebarMinimized ? 'justify-center' : ''}`}>
            <div className="p-2 bg-fern rounded-xl shadow-lg shadow-fern/20 shrink-0">
              <Sprout className="text-white" />
            </div>
            {!isSidebarMinimized && (
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-black tracking-tighter text-white italic whitespace-nowrap"
              >
                E-Farmania <span className="text-xs font-medium opacity-50 not-italic">by Sepuh</span>
              </motion.h1>
            )}
          </div>

          <nav className="space-y-1 flex-1 w-full">
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label={t('navDashboard')} 
              active={activeView === 'dashboard'} 
              minimized={isSidebarMinimized}
              onClick={() => { setActiveView('dashboard'); setSidebarOpen(false); }} 
            />
            {profile?.role !== 'Customer' && (
              <>
                <NavItem 
                  icon={<MapIcon size={20} />} 
                  label={t('navMapping')} 
                  active={activeView === 'mapping'} 
                  minimized={isSidebarMinimized}
                  onClick={() => { setActiveView('mapping'); setSidebarOpen(false); }} 
                />
                <NavItem 
                  icon={<PawPrint size={20} />} 
                  label={t('navLivestock')} 
                  active={activeView === 'livestock'} 
                  minimized={isSidebarMinimized}
                  onClick={() => { setActiveView('livestock'); setSidebarOpen(false); }} 
                />
                <NavItem 
                  icon={<BookOpen size={20} />} 
                  label={t('navGuide')} 
                  active={activeView === 'guide'} 
                  minimized={isSidebarMinimized}
                  onClick={() => { setActiveView('guide'); setSidebarOpen(false); }} 
                />
                <NavItem 
                  icon={<Book size={20} />} 
                  label={t('navLivestockGuide')} 
                  active={activeView === 'livestockGuide'} 
                  minimized={isSidebarMinimized}
                  onClick={() => { setActiveView('livestockGuide'); setSidebarOpen(false); }} 
                />
                <NavItem 
                  icon={<Package size={20} />} 
                  label={t('navInventory')} 
                  active={activeView === 'inventory'} 
                  minimized={isSidebarMinimized}
                  onClick={() => { setActiveView('inventory'); setSidebarOpen(false); }} 
                />
                <NavItem 
                  icon={<ShoppingBag size={20} />} 
                  label={t('navSales')} 
                  active={activeView === 'sales'} 
                  minimized={isSidebarMinimized}
                  onClick={() => { setActiveView('sales'); setSidebarOpen(false); }} 
                />
              </>
            )}
            <NavItem 
              icon={<ShoppingCart size={20} />} 
              label={t('navShops')} 
              active={activeView === 'shops'} 
              minimized={isSidebarMinimized}
              onClick={() => { setActiveView('shops'); setSidebarOpen(false); }} 
            />
            {profile?.role === 'Pemilik' && (
              <NavItem 
                icon={<UsersIcon size={20} />} 
                label={t('navTeam')} 
                active={activeView === 'team'} 
                minimized={isSidebarMinimized}
                onClick={() => { setActiveView('team'); setSidebarOpen(false); }} 
              />
            )}
            <NavItem 
              icon={<Smartphone size={20} />} 
              label={t('navCustomerApps')} 
              active={activeView === 'customerApps'} 
              minimized={isSidebarMinimized}
              onClick={() => { setActiveView('customerApps'); setSidebarOpen(false); }} 
            />
          </nav>

          <div className={`mt-auto space-y-4 pt-6 w-full ${isSidebarMinimized ? 'flex flex-col items-center' : ''}`}>
            {/* Collapse Toggle Button */}
            <button 
              onClick={() => setSidebarMinimized(!isSidebarMinimized)}
              className="hidden lg:flex items-center justify-center w-full py-2 hover:bg-white/5 rounded-xl transition-all text-palm-leaf hover:text-white"
              title={isSidebarMinimized ? "Expand" : "Minimize"}
            >
              {isSidebarMinimized ? <ChevronRight size={20} /> : <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest"><ChevronLeft size={16} /> Minimize</div>}
            </button>

            {/* Language Selector in Sidebar */}
            {!isSidebarMinimized ? (
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Languages size={14} className="text-palm-leaf" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-palm-leaf">Language</span>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {(['id', 'en', 'ms', 'vi', 'th', 'ja'] as Language[]).map(l => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-[9px] font-black transition-all ${lang === l ? 'bg-lime-cream text-evergreen shadow-lg scale-110' : 'bg-white/5 text-palm-leaf hover:bg-white/10'}`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 scale-75">
                <Languages size={16} className="text-palm-leaf mb-1" />
              </div>
            )}

            {!isSidebarMinimized && profile?.role === 'Pemilik' && (
              <div className="bg-white/5 p-4 rounded-2xl border border-palm-leaf/20 border-dashed">
                <div className="text-[10px] text-palm-leaf font-black uppercase mb-2 tracking-widest">{t('fixReferralCode')}</div>
                <div className="text-xl font-mono font-bold text-white text-center py-2 bg-black/20 rounded-lg">{profile.referralCode}</div>
                <div className="text-[8px] text-palm-leaf mt-2 text-center leading-tight">{t('shareToTeam')}</div>
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className={`flex items-center gap-2 text-xs font-bold text-palm-leaf hover:text-white transition-all w-full group pt-4 ${isSidebarMinimized ? 'justify-center' : ''}`}
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
              {!isSidebarMinimized && t('navSignOut')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-evergreen bg-[radial-gradient(circle_at_top_right,_var(--color-hunter-green)_0%,_transparent_50%)]">
        <header className="bg-transparent border-b border-hunter-green/30 p-4 flex items-center justify-between lg:hidden relative z-20">
          <div className="flex items-center gap-2">
            <Sprout className="text-palm-leaf" />
            <span className="font-black text-white italic tracking-tighter">E-Farmania <span className="text-[10px] font-medium opacity-50 not-italic">by Sepuh</span></span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-palm-leaf hover:text-white transition-all">
            <Menu />
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-4 lg:p-8 xl:p-12 relative z-10 pb-24 lg:pb-10 transition-all duration-500">
          <div className="mx-auto w-full max-w-[1600px] 2xl:max-w-[1800px]">
            <AnimatePresence mode="wait">
              {activeView === 'dashboard' && <DashboardView profile={profile!} />}
              {activeView === 'mapping' && <MappingView profile={profile!} />}
              {activeView === 'guide' && <GuideView />}
              {activeView === 'livestockGuide' && <LivestockGuideView />}
              {activeView === 'team' && <TeamView profile={profile!} />}
              {activeView === 'customerApps' && <CustomerAppsView />}
              {activeView === 'sales' && <SalesView profile={profile!} />}
              {activeView === 'inventory' && <InventoryView profile={profile!} />}
              {activeView === 'livestock' && <LivestockView profile={profile!} />}
              {activeView === 'shops' && <ShopsView profile={profile!} />}
            </AnimatePresence>
          </div>
        </section>

        {/* Mobile Floating Shortucts */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] lg:hidden">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center gap-1 p-2 bg-hunter-green/80 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl shadow-black/50"
          >
            <ShortcutButton 
              id="dashboard"
              icon={<LayoutDashboard size={20} />} 
              active={activeView === 'dashboard'} 
              onClick={() => setActiveView('dashboard')} 
            />
            <ShortcutButton 
              id="mapping"
              icon={<MapIcon size={20} />} 
              active={activeView === 'mapping'} 
              onClick={() => setActiveView('mapping')} 
            />
            <ShortcutButton 
              id="livestock"
              icon={<PawPrint size={20} />} 
              active={activeView === 'livestock'} 
              onClick={() => setActiveView('livestock')} 
            />
            <ShortcutButton 
              id="sales"
              icon={<ShoppingBag size={20} />} 
              active={activeView === 'sales'} 
              onClick={() => setActiveView('sales')} 
            />
            <ShortcutButton 
              id="shops"
              icon={<ShoppingCart size={20} />} 
              active={activeView === 'shops'} 
              onClick={() => setActiveView('shops')} 
            />
            <div className="w-[1px] h-8 bg-white/10 mx-2" />
            <button 
              onClick={handleLogout}
              className="w-12 h-12 flex items-center justify-center rounded-full text-red-400 hover:bg-white/10 transition-all"
            >
              <LogOut size={20} />
            </button>
          </motion.div>
        </div>

        <footer className="bg-black/20 border-t border-white/5 p-4 text-center lg:pb-4 pb-20">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-palm-leaf/40">© PT. Sepuh Trismatek Nusa | Sistem Terintegrasi Firestore</p>
        </footer>
      </main>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function ShopsView({ profile }: { profile?: UserProfile }) {
  const { t } = useLanguage();
  const [activeStore, setActiveStore] = useState<'Peternakan' | 'Pertanian' | 'Makanan' | 'My'>('Peternakan');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [dbProducts, setDbProducts] = useState<ShopProduct[]>([]);
  const [showProductDetails, setShowProductDetails] = useState<ShopProduct | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'shop_products'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setDbProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as ShopProduct)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'shop_products'));
  }, []);

  const livestockCategories = ['all', 'pakan', 'peralatan', 'obatObatan', 'suplemen'];
  const agricultureCategories = ['all', 'insektisida', 'herbisida', 'alatPertanian', 'bibit', 'produkPertanian'];
  const foodCategories = ['all', 'sayuran', 'buah', 'daging', 'susu', 'olahan'];

  const allProducts: any[] = [...dbProducts];
  
  const staticItems = [
    { id: 'lp1', name: 'BR-1 Starter Chicken', category: 'pakan', price: 450000, image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=200', storeType: 'Peternakan' },
    { id: 'lp2', name: 'BR-2 Grower Chicken', category: 'pakan', price: 435000, image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=200', storeType: 'Peternakan' },
    { id: 'le1', name: 'Nipple Drinker 360', category: 'peralatan', price: 15000, image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=200', storeType: 'Peternakan' },
    { id: 'ai1', name: 'Fastac 15EC', category: 'insektisida', price: 75000, image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=200', storeType: 'Pertanian' },
    { id: 'at1', name: 'Hand Tractor G1000', category: 'alatPertanian', price: 24000000, image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=200', storeType: 'Pertanian' },
  ];

  const filteredProducts = allProducts.filter(p => {
    if (activeStore === 'My') {
      return p.ownerId === profile?.uid;
    }
    return p.storeType === activeStore && (activeCategory === 'all' || p.category === activeCategory);
  });
  
  const displayProducts = activeStore === 'My' ? filteredProducts : [...filteredProducts, ...staticItems.filter(s => s.storeType === activeStore && (activeCategory === 'all' || s.category === activeCategory))];

  const handleBuy = async (product: any) => {
    if (!profile) return alert(t('pleaseLogin') || 'Silakan login terlebih dahulu');
    if (product.ownerId === profile.uid) return alert(t('cannotBuySelf') || 'Anda tidak bisa membeli produk sendiri');
    
    if (confirm(`${t('confirmPurchase') || 'Beli'} ${product.name}?`)) {
      try {
        await addDoc(collection(db, 'transactions'), {
          ownerId: product.ownerId || 'system',
          buyerId: profile.uid,
          productId: product.id,
          quantity: 1,
          totalPrice: product.price,
          timestamp: serverTimestamp(),
          status: 'pending'
        });
        alert(t('purchaseSuccess') || 'Pesanan berhasil dibuat!');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{t('navShops')}</h2>
          <p className="text-palm-leaf font-bold uppercase tracking-widest text-xs mt-1">{t('commerceHubDesc')}</p>
        </div>
        
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-full no-scrollbar">
          {(['Peternakan', 'Pertanian', 'Makanan', 'My'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setActiveStore(s); setActiveCategory('all'); }}
              className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shrink-0 ${activeStore === s ? 'bg-lime-cream text-evergreen shadow-lg' : 'text-palm-leaf hover:bg-white/5'}`}
            >
              {s === 'Peternakan' ? t('livestock') : s === 'Pertanian' ? t('agriculture') : s === 'Makanan' ? t('foods') : t('navMyShop')}
            </button>
          ))}
        </div>
      </div>

      {activeStore !== 'My' && (
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {(activeStore === 'Peternakan' ? livestockCategories : activeStore === 'Pertanian' ? agricultureCategories : foodCategories).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0 ${activeCategory === cat ? 'bg-fern text-white border-fern shadow-lg' : 'bg-white/5 text-palm-leaf border-white/10 hover:border-white/30'}`}
            >
              {cat === 'all' ? 'All Products' : t(cat)}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        {displayProducts.map((p, idx) => (
          <motion.div 
            layout
            key={p.id || idx} 
            className="glass-card flex flex-col group hover:translate-y-[-4px] transition-all overflow-hidden border-white/5"
          >
            <div className="aspect-square bg-gray-900 relative overflow-hidden" onClick={() => setShowProductDetails(p)}>
              <img src={p.image || 'https://images.unsplash.com/photo-1582213708055-6677f59595a5?auto=format&fit=crop&q=80&w=200'} referrerPolicy="no-referrer" alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[8px] font-black text-lime-cream uppercase tracking-widest z-10">
                <span className="hidden sm:inline">{t(p.category)}</span>
                <span className="sm:hidden">{t(p.category).substring(0, 3)}..</span>
              </div>
              {p.isWaste && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/80 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-1 z-10">
                  <Recycle size={8} /> <span className="hidden sm:inline">{t('wasteManagement')}</span>
                </div>
              )}
              <div className="absolute bottom-2 right-2 flex flex-col gap-1 items-end z-10">
                {p.isSafeForKids && (
                  <div className="px-1.5 py-1 bg-blue-500/80 backdrop-blur-md rounded-md text-[7px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                    <Baby size={8} /> <span className="hidden sm:inline">KiDS SAFE</span>
                  </div>
                )}
                {p.isSafeForPregnancy && (
                  <div className="px-1.5 py-1 bg-pink-500/80 backdrop-blur-md rounded-md text-[7px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                    <Heart size={8} /> <span className="hidden sm:inline">PREG SAFE</span>
                  </div>
                )}
              </div>
              {p.ownerId === profile?.uid && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-orange-500/80 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase tracking-widest z-10">
                  <span className="hidden sm:inline">{t('myProduct')}</span>
                  <span className="sm:hidden">ME</span>
                </div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div onClick={() => setShowProductDetails(p)} className="cursor-pointer">
                <h4 className="text-[11px] font-black text-white uppercase tracking-tight line-clamp-2 leading-tight">{p.name}</h4>
                <p className="text-[12px] font-mono font-bold text-lime-cream mt-1 italic">Rp {p.price.toLocaleString('id-ID')}</p>
                {p.deliveryOptions && p.deliveryOptions.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {p.deliveryOptions.map((opt: string) => (
                      <div key={opt} className="p-1 bg-white/5 rounded-md text-palm-leaf" title={t(opt)}>
                        <Truck size={10} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleBuy(p)}
                className="w-full py-2.5 bg-fern hover:bg-lime-cream text-white hover:text-evergreen rounded-xl text-[9px] font-black uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingCart size={12} />
                {t('buyFromFarmer')}
              </button>
            </div>
          </motion.div>
        ))}
        {displayProducts.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-30 italic text-xs">
            {t('noProductsFound')}
          </div>
        )}
      </div>

      {showProductDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-hunter-green w-full max-w-2xl rounded-[2.5rem] border border-white/10 p-0 shadow-2xl relative overflow-hidden flex flex-col md:flex-row shadow-lime-cream/20">
            <button onClick={() => setShowProductDetails(null)} className="absolute top-6 right-6 text-white/50 hover:text-white z-10 bg-black/20 rounded-full p-2"><X size={20} /></button>
            
            <div className="w-full md:w-1/2 aspect-square relative">
              <img src={showProductDetails.image || 'https://images.unsplash.com/photo-1582213708055-6677f59595a5?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                {showProductDetails.isSafeForKids && <div className="px-3 py-1 bg-blue-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2"><Baby size={12} /> {t('safeForKids')}</div>}
                {showProductDetails.isSafeForPregnancy && <div className="px-3 py-1 bg-pink-500 rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2"><Heart size={12} /> {t('safeForPregnancy')}</div>}
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col overflow-y-auto max-h-[70vh] md:max-h-none">
              <span className="text-[10px] font-black text-palm-leaf uppercase tracking-widest mb-1 italic">Product Detail</span>
              <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none mb-4">{showProductDetails.name}</h3>
              <div className="text-2xl font-mono font-bold text-lime-cream mb-6">Rp {showProductDetails.price.toLocaleString('id-ID')}</div>
              
              <div className="space-y-6">
                {showProductDetails.description && (
                  <div>
                    <h4 className="text-[10px] font-black text-palm-leaf uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldCheck size={12} /> {t('description')}</h4>
                    <p className="text-white/70 text-sm leading-relaxed">{showProductDetails.description}</p>
                  </div>
                )}

                {showProductDetails.nutritionDetails ? (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <h4 className="text-[10px] font-black text-lime-cream uppercase tracking-widest mb-3 flex items-center gap-2"><Activity size={12} /> {t('nutritionInfo')}</h4>
                    <p className="text-white/80 text-xs whitespace-pre-wrap leading-relaxed">{showProductDetails.nutritionDetails}</p>
                  </div>
                ) : (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 opacity-50 italic text-[10px] text-palm-leaf">
                    No nutrition details available.
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <button 
                  onClick={() => { handleBuy(showProductDetails); setShowProductDetails(null); }}
                  className="w-full py-4 bg-lime-cream text-evergreen rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-lime-cream/10 hover:brightness-110 active:scale-95 transition-all"
                >
                  {t('buyFromFarmer')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function CustomerAppsView() {
  const { t } = useLanguage();
  
  const apps = [
    {
      id: 'lapaq',
      name: 'Lapaq',
      desc: 'Nutrition intake monitoring for kids.',
      url: 'https://lapaq.app:3000',
      icon: <Baby size={32} />,
      color: 'bg-blue-500'
    },
    {
      id: 'pregna',
      name: 'Pregna',
      desc: 'Nutrition intake monitoring for pregnancy.',
      url: 'https://pregna-app.vercel.app/',
      icon: <Heart size={32} />,
      color: 'bg-pink-500'
    },
    {
      id: 'fellas',
      name: 'Fellas',
      desc: 'Mom assist app for your daily needs.',
      url: 'https://fellas.id',
      icon: <Smartphone size={32} />,
      color: 'bg-purple-500'
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-white tracking-tighter italic">{t('navCustomerApps')}</h2>
        <p className="text-palm-leaf text-sm font-medium">Connect with our specialized partner applications for a healthier life.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {apps.map(app => (
          <a 
            key={app.id}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card group flex flex-col p-8 hover:translate-y-[-8px] transition-all duration-500 shadow-2xl hover:shadow-lime-cream/10"
          >
            <div className={`w-16 h-16 rounded-[2rem] ${app.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
              {app.icon}
            </div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 group-hover:text-lime-cream transition-colors">{app.name}</h3>
            <p className="text-palm-leaf text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
              {app.desc}
            </p>
            <div className="mt-auto pt-8 flex items-center gap-2 text-lime-cream font-black uppercase tracking-widest text-[10px]">
              {t('launchApp')} <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </a>
        ))}
      </div>

      <div className="glass-card p-6 md:p-12 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 md:top-0 md:right-0 opacity-5 pointer-events-none">
          <Sprout size={150} className="md:w-[200px] md:h-[200px]" />
        </div>
        <div className="max-w-2xl relative z-10">
          <div className="w-12 h-1 px-0 bg-lime-cream mb-4 md:mb-6"></div>
          <h4 className="text-xl md:text-2xl font-black text-white italic tracking-tighter mb-4">Integrated Ecosystem</h4>
          <p className="text-palm-leaf text-xs md:text-sm leading-relaxed mb-6 md:mb-8">
            E-Farmania acts as the primary food supply provider for these applications, ensuring high-quality, nutrition-verified products reach families who need them most.
          </p>
          <div className="flex flex-wrap gap-2 md:gap-4">
            <div className="px-3 md:px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-lime-cream flex items-center gap-2">
              <ShieldCheck size={12} className="md:w-3.5 md:h-3.5" /> Certified Supply
            </div>
            <div className="px-3 md:px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-lime-cream flex items-center gap-2">
               <Activity size={12} className="md:w-3.5 md:h-3.5" /> Nutrition Verified
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ShopProductForm({ ownerId, product, onClose }: { ownerId: string, product?: ShopProduct, onClose: () => void }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'pakan',
    price: product?.price || 0,
    storeType: product?.storeType || 'Peternakan',
    image: product?.image || '',
    description: product?.description || '',
    unit: product?.unit || 'kg',
    isWaste: product?.isWaste || false,
    isSafeForKids: product?.isSafeForKids || false,
    isSafeForPregnancy: product?.isSafeForPregnancy || false,
    nutritionDetails: product?.nutritionDetails || ''
  });

  const categories = formData.storeType === 'Peternakan' 
    ? ['pakan', 'peralatan', 'obatObatan', 'suplemen', 'Pupuk/Waste']
    : formData.storeType === 'Pertanian'
    ? ['insektisida', 'herbisida', 'alatPertanian', 'bibit', 'produkPertanian', 'Pupuk/Waste']
    : ['sayuran', 'buah', 'daging', 'susu', 'olahan'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        ownerId,
        updatedAt: serverTimestamp()
      };
      if (product) {
        await updateDoc(doc(db, 'shop_products', product.id), data);
      } else {
        await addDoc(collection(db, 'shop_products'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-hunter-green w-full max-w-lg rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 text-palm-leaf hover:text-white"><X size={24} /></button>
        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-6">{t('addProduct')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest">{t('itemName')}</label>
            <input type="text" required className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest">{t('storeType')}</label>
               <select className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white" value={formData.storeType} onChange={e => setFormData({ ...formData, storeType: e.target.value as any, category: e.target.value === 'Peternakan' ? 'pakan' : e.target.value === 'Pertanian' ? 'insektisida' : 'sayuran' })}>
                  <option value="Peternakan">{t('livestock')}</option>
                  <option value="Pertanian">{t('agriculture')}</option>
                  <option value="Makanan">{t('foods')}</option>
               </select>
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest">{t('category')}</label>
               <select className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  {categories.map(c => <option key={c} value={c}>{t(c)}</option>)}
               </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest">{t('price')}</label>
              <input type="number" required className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest">Unit</label>
              <input type="text" required className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} placeholder="kg/pcs/liter" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest">{t('imageUrl')}</label>
            <input type="text" className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest">{t('description')}</label>
            <textarea className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white h-24" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
          </div>

          {formData.storeType === 'Makanan' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, isSafeForKids: !formData.isSafeForKids })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${formData.isSafeForKids ? 'bg-blue-500 border-blue-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-palm-leaf'}`}
                >
                  <Baby size={12} /> {t('safeForKids')}
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, isSafeForPregnancy: !formData.isSafeForPregnancy })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${formData.isSafeForPregnancy ? 'bg-pink-500 border-pink-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-palm-leaf'}`}
                >
                  <Heart size={12} /> {t('safeForPregnancy')}
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('nutritionDetails')}</label>
                <textarea 
                  placeholder="Contoh: Kalori: 100kcal, Protein: 10g..."
                  className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white h-20 text-xs" 
                  value={formData.nutritionDetails} 
                  onChange={e => setFormData({ ...formData, nutritionDetails: e.target.value })} 
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <input type="checkbox" checked={formData.isWaste} onChange={e => setFormData({ ...formData, isWaste: e.target.checked })} className="w-5 h-5 rounded-md border-white/10" />
            <label className="text-[10px] font-black text-white uppercase tracking-widest">{t('sellAsWaste')}</label>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-lime-cream text-evergreen rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-lime-cream/10 hover:brightness-110 active:scale-95 transition-all mt-4">
            {loading ? '...' : t('save')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ShortcutButton({ id, icon, active, onClick }: { id: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 relative ${
        active 
          ? 'bg-lime-cream text-evergreen shadow-lg shadow-lime-cream/20 scale-110' 
          : 'text-palm-leaf hover:bg-white/5'
      }`}
    >
      {icon}
      {active && (
        <motion.div 
          layoutId="active-pill"
          className="absolute -bottom-1 w-1 h-1 bg-lime-cream rounded-full"
        />
      )}
    </button>
  );
}

function NavItem({ icon, label, active, minimized, onClick }: { icon: React.ReactNode, label: string, active: boolean, minimized?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center ${minimized ? 'justify-center px-0' : 'justify-start text-left gap-3 px-4'} py-3 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all duration-300 ${
        active 
          ? 'bg-fern text-white shadow-lg shadow-fern/40 border border-white/20 translate-x-1' 
          : 'text-palm-leaf hover:bg-white/5 hover:text-lime-cream'
      }`}
      title={minimized ? label : ''}
    >
      <span className={`${active ? 'text-white' : 'text-palm-leaf'} shrink-0`}>{icon}</span>
      {!minimized && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </button>
  );
}

// --- VIEWS ---

function AuthScreen({ setProfile }: { setProfile: (p: UserProfile) => void }) {
  const { lang, setLang, t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>('Pemilik');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [refCodeInput, setRefCodeInput] = useState('');
  const [error, setError] = useState('');
  const [showFloatingBtn, setShowFloatingBtn] = useState(true);
  
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!formRef.current) return;
      const rect = formRef.current.getBoundingClientRect();
      // Hide button if form is mostly in view
      setShowFloatingBtn(rect.top > window.innerHeight * 0.7);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const authOperation = isRegister ? OperationType.CREATE : OperationType.GET;
    try {
      if (isRegister) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        
        let invitedBy = '';
        if (role !== 'Pemilik') {
          if (!refCodeInput) {
            // If it's a customer, maybe it's optional? 
            // The prompt didn't specify, but usually customers are public.
            // However, the current logic requires it.
            // Let's make it optional for Customer if they don't provide it, 
            // but keep it required for Supervisor/Karyawan.
            if (role === 'Customer') {
              invitedBy = '';
            } else {
              throw new Error(t('referralRequired'));
            }
          } else {
            const q = query(collection(db, 'users'), where('referralCode', '==', refCodeInput));
            try {
              const snap = await getDocs(q);
              if (snap.empty) throw new Error(t('invalidReferral'));
              invitedBy = snap.docs[0].id;
            } catch (err: any) {
              handleFirestoreError(err, OperationType.LIST, 'users');
              throw err;
            }
          }
        }

        const referralCode = role === 'Pemilik' ? Math.random().toString(36).substring(2, 10).toUpperCase() : '';
        const profileData: UserProfile = {
          uid: res.user.uid,
          email,
          displayName,
          role,
          referralCode,
          invitedBy,
          createdAt: serverTimestamp()
        };
        try {
          await setDoc(doc(db, 'users', res.user.uid), profileData);
        } catch (err: any) {
          handleFirestoreError(err, OperationType.WRITE, `users/${res.user.uid}`);
          throw err;
        }
        setProfile(profileData);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-evergreen flex flex-col items-center justify-center p-4 lg:p-12 bg-[radial-gradient(circle_at_top_left,_var(--color-fern-green)_0%,_transparent_40%)] relative overflow-x-hidden pt-24 lg:pt-12">
      {/* Floating Scroll Button (Mobile Only) */}
      <AnimatePresence>
        {showFloatingBtn && (
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            onClick={scrollToForm}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] lg:hidden bg-lime-cream text-evergreen px-6 py-4 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl flex items-center gap-2 border border-white/20 active:scale-95 transition-transform"
          >
            {t('jumpToLogin')}
            <ChevronDown size={14} className="animate-bounce" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Background elements */}
      <div className="absolute top-6 lg:top-10 left-0 right-0 lg:left-auto lg:right-10 z-20 flex flex-wrap justify-center lg:justify-end gap-2 px-6">
        {(['id', 'en', 'ms', 'vi', 'th', 'ja'] as Language[]).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all border ${lang === l ? 'bg-lime-cream text-evergreen border-lime-cream shadow-lg scale-110' : 'bg-white/5 text-palm-leaf border-white/10 hover:bg-white/10'}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 relative z-10 py-12 lg:py-0">
        
        {/* Left Side: Marketing Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 flex flex-col justify-center space-y-8 text-center lg:text-left"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-fern/30 rounded-full border border-fern/50 mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-lime-cream animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{t('appTagline')}</span>
            </div>
            <h1 className="text-5xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter italic shadow-2xl">
              Precision <br />
              Agri & <br />
              Livestock <br />
              <span className="text-lime-cream">Platform.</span>
            </h1>
            <p className="text-palm-leaf max-w-md text-lg lg:text-xl font-medium leading-relaxed mx-auto lg:mx-0">
              {t('marketingDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 text-left">
            <MarketingFeature 
              icon={<Thermometer className="text-orange-400" size={20} />}
              title={t('iotMonitoring')}
              desc={t('iotMonitoringDesc')}
            />
            <MarketingFeature 
              icon={<PawPrint className="text-lime-cream" size={20} />}
              title={t('livestockMonitoring')}
              desc={t('livestockMonitoringDesc')}
            />
            <MarketingFeature 
              icon={<UsersIcon className="text-blue-400" size={20} />}
              title={t('teamSync')}
              desc={t('teamSyncDesc')}
            />
            <MarketingFeature 
              icon={<BarChartIcon className="text-purple-400" size={18} />}
              title={t('smartAnalysis')}
              desc={t('smartAnalysisDesc')}
            />
            <MarketingFeature 
              icon={<MapIcon className="text-emerald-400" size={20} />}
              title={t('globalMapping')}
              desc={t('globalMappingDesc')}
            />
            <MarketingFeature 
              icon={<ShoppingBag className="text-yellow-400" size={20} />}
              title={t('commerceHub')}
              desc={t('commerceHubDesc')}
            />
          </div>

          <div className="pt-6 border-t border-white/5">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-evergreen bg-fern flex items-center justify-center text-xs font-bold text-white shadow-xl">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-[10px] uppercase font-black tracking-widest text-palm-leaf">
                {t('joinedFarmers')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Auth Form */}
        <motion.div 
          ref={formRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full lg:w-1/2 flex items-center justify-center"
        >
          <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl p-6 lg:p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-fern/20 blur-3xl rounded-full" />
            
            <div className="flex flex-col items-center mb-10 relative z-10">
              <div className="p-5 bg-fern rounded-3xl mb-4 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Sprout size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter italic">E-Farmania <span className="text-sm font-medium opacity-30 not-italic">by Sepuh</span></h2>
              <p className="text-palm-leaf text-center mt-2 font-bold uppercase tracking-widest text-[10px] opacity-60">
                {isRegister ? t('authRegistration') : t('authAccess')}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 relative z-10">
              {isRegister && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('fullName')}</label>
                    <input 
                      type="text" required 
                      className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-white/5 text-white focus:ring-2 focus:ring-fern focus:bg-black/40 transition-all outline-none"
                      value={displayName} onChange={e => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('yourRole')}</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      {(['Pemilik', 'Supervisor', 'Karyawan', 'Customer'] as UserRole[]).map(r => (
                        <button
                          key={r} type="button"
                          onClick={() => setRole(r)}
                          className={`py-3 text-[9px] uppercase font-black rounded-xl border transition-all ${role === r ? 'bg-fern text-white border-fern shadow-lg' : 'bg-black/20 text-palm-leaf border-white/5 hover:bg-white/5'}`}
                        >
                          {t(`role${r}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                  {role !== 'Pemilik' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('referralCode')}</label>
                      <input 
                        type="text" required 
                        className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-white/5 text-white focus:ring-2 focus:ring-fern font-mono"
                        placeholder="REFERRAL-XXX"
                        value={refCodeInput} onChange={e => setRefCodeInput(e.target.value.toUpperCase())}
                      />
                    </div>
                  )}
                </>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('email')}</label>
                <input 
                  type="email" required 
                  className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-white/5 text-white focus:ring-2 focus:ring-fern outline-none"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('password')}</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} required 
                    className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-white/5 text-white focus:ring-2 focus:ring-fern outline-none pr-14"
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-palm-leaf hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-[10px] font-black text-red-400 text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

              <button className="w-full py-5 bg-lime-cream text-evergreen rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:brightness-110 active:scale-[0.98] transition-all shadow-2xl shadow-lime-cream/20 mt-4">
                {isRegister ? t('registerNow') : t('signInNow')}
              </button>
            </form>

            <p className="text-[10px] font-bold text-center mt-8 text-palm-leaf uppercase tracking-widest">
              {isRegister ? t('haveAccount') : t('noAccount')}
              <button onClick={() => setIsRegister(!isRegister)} className="ml-2 text-white hover:text-lime-cream underline transition-colors">
                {isRegister ? t('logIn') : t('createAccount')}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function MarketingFeature({ icon, title, desc }: any) {
  return (
    <div className="p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all group">
      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-white font-black text-xs uppercase tracking-widest mb-2">{title}</h3>
      <p className="text-palm-leaf text-[10px] leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function DashboardView({ profile }: { profile: UserProfile }) {
  const { lang, t } = useLanguage();
  const [lands, setLands] = useState<Land[]>([]);
  const [selectedLand, setSelectedLand] = useState<Land | null>(null);
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [logs, setLogs] = useState<OperationalLog[]>([]);
  const [isAddingLand, setIsAddingLand] = useState(false);
  
  // Real-time lands
  useEffect(() => {
    const ownerId = profile.role === 'Pemilik' ? profile.uid : profile.invitedBy;
    if (!ownerId) return;

    const q = query(collection(db, 'lands'), where('ownerId', '==', ownerId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Land));
      setLands(list);
      if (list.length > 0 && !selectedLand) setSelectedLand(list[0]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'lands'));
  }, [profile, selectedLand]);

  // Real-time sensors & logs for selected land
  useEffect(() => {
    if (!selectedLand) return;
    
    // Sensors
    const sQ = query(collection(db, `lands/${selectedLand.id}/sensors`), orderBy('timestamp', 'desc'), limit(10));
    const unsubSensors = onSnapshot(sQ, snap => {
      setSensors(snap.docs.map(d => ({ id: d.id, ...d.data() } as SensorData)).reverse());
    }, error => handleFirestoreError(error, OperationType.LIST, `lands/${selectedLand.id}/sensors`));

    // Logs
    const lQ = query(collection(db, `lands/${selectedLand.id}/logs`), orderBy('timestamp', 'desc'), limit(5));
    const unsubLogs = onSnapshot(lQ, snap => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as OperationalLog)));
    }, error => handleFirestoreError(error, OperationType.LIST, `lands/${selectedLand.id}/logs`));

    return () => { unsubSensors(); unsubLogs(); };
  }, [selectedLand]);

  // IoT Simulation
  useEffect(() => {
    if (!selectedLand || profile.role !== 'Pemilik') return;
    
    const interval = setInterval(async () => {
      try {
        await addDoc(collection(db, `lands/${selectedLand.id}/sensors`), {
          landId: selectedLand.id,
          temperature: 25 + Math.random() * 10,
          humidity: 40 + Math.random() * 40,
          rainfall: Math.random() * 5,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        console.error("Simulation error:", e);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedLand, profile.role]);

  const latestSensor = sensors[sensors.length - 1];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-6 lg:space-y-8"
    >
      {/* Upper Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter italic">
            {t('welcomeBack')}, {profile.displayName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="px-3 py-0.5 bg-hunter-green border border-palm-leaf/30 rounded-full text-[9px] uppercase font-black text-palm-leaf">Role: {t(`role${profile.role}`)}</div>
            <p className="text-palm-leaf text-xs lg:text-sm font-medium">{t('dashboardDesc')}</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center w-full md:w-auto">
          {profile.role === 'Pemilik' ? (
            <button 
              onClick={() => setIsAddingLand(true)}
              className="flex-1 md:flex-none bg-lime-cream text-evergreen px-6 lg:px-8 py-4 lg:py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] lg:text-xs hover:shadow-2xl hover:shadow-lime-cream/20 hover:-translate-y-1 active:translate-y-0 transition-all"
            >
              <Plus size={16} className="inline-block mr-2" /> {t('addLand')}
            </button>
          ) : (
             <div className="flex-1 md:flex-none px-4 py-3 bg-white/5 border border-palm-leaf/20 rounded-2xl flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-[10px] font-black text-palm-leaf tracking-widest">NETWORK ONLINE</span>
             </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          icon={<Thermometer className="text-orange-400" size={24} />} 
          label={t('soilTemp')} 
          value={latestSensor ? `${latestSensor.temperature.toFixed(1)}` : '0.0'} 
          unit="°C"
          trend={latestSensor ? (latestSensor.temperature > 30 ? 'Perlu Teduh' : 'Normal') : 'No Data'}
        />
        <StatCard 
          icon={<Droplets className="text-blue-400" size={24} />} 
          label={t('moisture')} 
          value={latestSensor ? `${latestSensor.humidity.toFixed(0)}` : '0'} 
          unit="%"
          trend={latestSensor ? (latestSensor.humidity < 50 ? 'Kering' : 'Optimum') : 'No Data'}
        />
        <StatCard 
          icon={<CloudRain className="text-indigo-400" size={24} />} 
          label={t('rainfall')} 
          value={latestSensor ? `${latestSensor.rainfall.toFixed(1)}` : '0.0'} 
          unit="mm"
          trend="Real-time"
        />
        <StatCard 
          icon={<AlertTriangle className="text-yellow-400" size={24} />} 
          label={t('weatherAlert')} 
          value="LOW" 
          unit=""
          trend="Safe Zone"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Land Selection & IoT Chart */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                   <LayoutDashboard className="text-lime-cream" size={20} />
                 </div>
                 <h3 className="font-black uppercase tracking-widest text-palm-leaf text-sm">Smart Farming IoT Sensors</h3>
              </div>
              <select 
                className="bg-black/40 text-white px-4 py-2 rounded-xl text-xs font-bold outline-none border border-palm-leaf/30 cursor-pointer hover:border-lime-cream transition-colors appearance-none"
                value={selectedLand?.id || ''}
                onChange={e => setSelectedLand(lands.find(l => l.id === e.target.value) || null)}
              >
                {lands.map(l => ( <option key={l.id} value={l.id} className="bg-hunter-green">{t('activeLand')}: {l.name}</option> ))}
              </select>
            </div>
            
            <div className="h-72 w-full mt-4">
              {sensors.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sensors} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="timestamp" hide />
                    <YAxis stroke="#90a955" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#132a13', border: '1px solid #90a955', borderRadius: '12px', fontSize: '12px', color: '#ecf39e' }} 
                      itemStyle={{ color: '#ecf39e' }}
                    />
                    <Line type="monotone" dataKey="temperature" stroke="#fb923c" strokeWidth={3} dot={{ r: 4, fill: '#fb923c', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-palm-leaf bg-black/20 rounded-2xl border border-white/5">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Info size={48} className="mb-4 opacity-20" />
                  </motion.div>
                  <p className="text-sm font-bold uppercase tracking-widest">System Synchronizing...</p>
                  <p className="text-[10px] mt-2 opacity-50 px-8 text-center">{t('iotMonitoringDesc')}</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
               <h4 className="text-[10px] font-black uppercase text-palm-leaf mb-4 tracking-widest">{t('weatherAlert')} Insight</h4>
               <div className="bg-black/20 p-4 rounded-2xl border border-white/5 text-sm flex items-start gap-4">
                  <div className="mt-1 p-2 bg-blue-500/20 rounded-lg text-blue-400"><CloudRain size={20} /></div>
                  <div>
                    <p className="font-bold text-white">{t('weatherAlert')}</p>
                    <p className="text-palm-leaf text-xs mt-1 leading-relaxed">{t('weatherAlertDesc')}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Perangkat */}
          <div className="glass-card p-6">
            <h3 className="font-black uppercase tracking-widest text-palm-leaf text-xs mb-6 flex items-center gap-2">
              <Thermometer size={16} /> Status Perangkat
            </h3>
            <div className="space-y-4">
              <DeviceStatus label="Gateway IoT Central" status="Online" battery="100%" />
              <DeviceStatus label="Probe Sensor A1" status="Online" battery="82%" />
              <DeviceStatus label="Smart Valve Controller" status="Offline" battery="--" />
            </div>
          </div>

          {/* Activity Log */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase tracking-widest text-palm-leaf text-xs flex items-center gap-2">
                <ClipboardList size={16} /> {t('activityHistory')}
              </h3>
              {(profile.role === 'Karyawan' || profile.role === 'Supervisor') && (
                <button 
                  onClick={() => selectedLand && addLog(selectedLand.id, 'observasi', profile.uid)}
                  className="bg-lime-cream text-evergreen p-1.5 rounded-lg shadow-lg hover:rotate-90 transition-all duration-300"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
            
            <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
              {logs.length > 0 ? logs.map(l => (
                <div key={l.id} className="flex gap-4 relative z-10 group">
                  <div className={`mt-2 w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center shrink-0 shadow-xl transition-all ${
                    l.type === 'pemupukan' ? 'bg-orange-500/20 text-orange-400' : 
                    l.type === 'pestisida' ? 'bg-red-500/20 text-red-400' : 
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {l.type === 'pemupukan' ? <Sprout size={12} /> : l.type === 'pestisida' ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                  </div>
                  <div className="flex-1 pb-4 border-b border-white/5">
                    <p className="text-[10px] font-black uppercase text-white tracking-widest leading-none mb-1">{l.type}</p>
                    <p className="text-xs text-palm-leaf line-clamp-2 leading-relaxed">{l.details || l.observation}</p>
                    <p className="text-[9px] text-palm-leaf/40 font-bold uppercase mt-2">Just Now • By Team</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 opacity-30 italic">
                   <p className="text-xs">No activity logged yet.</p>
                </div>
              )}
            </div>
            
            {(profile.role === 'Karyawan' || profile.role === 'Supervisor') && selectedLand && (
              <div className="mt-8 pt-6 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-palm-leaf mb-4 text-center">{t('workerOperationalLog')}</p>
                <div className="grid grid-cols-3 gap-2">
                  <LogButton label="PUPUK" onClick={() => addLog(selectedLand.id, 'pemupukan', profile.uid)} />
                  <LogButton label="OBAT" onClick={() => addLog(selectedLand.id, 'pestisida', profile.uid)} />
                  <LogButton label="CEK" onClick={() => addLog(selectedLand.id, 'observasi', profile.uid)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Land Form Modal */}
      {isAddingLand && (
        <LandForm 
          ownerId={profile.uid} 
          onClose={() => setIsAddingLand(false)} 
        />
      )}
    </motion.div>
  );
}

function StatCard({ icon, label, value, unit, trend }: any) {
  return (
    <div className="glass-card group p-4 md:p-6 hover:translate-y-[-4px] transition-all duration-300">
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div className="p-2 md:p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
          <div className="scale-75 md:scale-100">{icon}</div>
        </div>
        <div className="px-2 md:px-3 py-1 bg-black/40 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest text-palm-leaf border border-white/5 whitespace-nowrap">
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-palm-leaf leading-none mb-1 md:mb-2">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl md:text-4xl font-black text-white italic tracking-tighter leading-none">{value}</span>
          <span className="text-[10px] md:text-sm font-bold text-palm-leaf">{unit}</span>
        </div>
      </div>
    </div>
  );
}

function DeviceStatus({ label, status, battery }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-default">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${status === 'Online' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-gray-500 shadow-none'}`} />
        <span className="text-xs font-bold text-lime-cream uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className={`text-[9px] font-black uppercase tracking-widest ${status === 'Online' ? 'text-green-500' : 'text-gray-500'}`}>{status}</div>
        <div className="text-[10px] font-black text-palm-leaf bg-black/20 px-2 py-0.5 rounded-md">{battery}</div>
      </div>
    </div>
  );
}

function LogButton({ label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border border-palm-leaf/20 bg-white/5 text-palm-leaf hover:bg-lime-cream hover:text-evergreen hover:border-lime-cream active:scale-95 transition-all shadow-md"
    >
      {label}
    </button>
  );
}

async function addLog(landId: string, type: any, workerId: string) {
  const details = prompt(`Masukan detail untuk ${type}:`);
  if (!details) return;
  try {
    await addDoc(collection(db, `lands/${landId}/logs`), {
      landId,
      workerId,
      type,
      details,
      timestamp: serverTimestamp()
    });
  } catch(e) { console.error(e); }
}

function TeamView({ profile }: { profile: UserProfile }) {
  const { lang, t } = useLanguage();
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile.role !== 'Pemilik') return;
    const q = query(collection(db, 'users'), where('invitedBy', '==', profile.uid));
    return onSnapshot(q, snap => {
      setTeam(snap.docs.map(d => ({ ...d.data() } as UserProfile)));
      setLoading(false);
    });
  }, [profile]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-center pb-6 border-b border-white/10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic">{t('managementTeam')}</h2>
          <p className="text-palm-leaf text-sm font-medium">{t('teamDesc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full py-20 text-center text-palm-leaf italic opacity-50">{t('pullingTeamData')}</div>
        ) : team.length > 0 ? team.map(member => (
          <div key={member.uid} className="glass-card p-6 flex items-center gap-6 group hover:translate-x-2 transition-all">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl shadow-xl transition-all ${member.role === 'Supervisor' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
              {member.displayName?.[0] || member.email[0].toUpperCase()}
            </div>
            <div>
               <h4 className="text-white font-black text-xl tracking-tight">{member.displayName || 'Unnamed User'}</h4>
               <p className="text-palm-leaf text-xs font-bold uppercase tracking-widest mt-1">{t(`role${member.role}`)}</p>
               <div className="mt-3 flex items-center gap-2 text-[10px] text-palm-leaf/60 italic">
                 <ClipboardList size={12} /> {t('registeredAt')} {new Date(member.createdAt?.seconds * 1000).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')}
               </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center glass-card border-dashed">
             <UsersIcon size={48} className="mx-auto text-palm-leaf opacity-20 mb-4" />
             <p className="font-bold text-palm-leaf uppercase tracking-widest text-sm">{t('noTeamRegistered')}</p>
             <p className="text-[10px] text-palm-leaf/50 mt-2 px-10">{t('shareReferralToBuildTeam')}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LivestockView({ profile }: { profile: UserProfile }) {
  const { t } = useLanguage();
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [isAddingAnimal, setIsAddingAnimal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Livestock | null>(null);
  const [selectedWasteParent, setSelectedWasteParent] = useState<{id: string, name: string} | null>(null);
  const ownerId = profile.role === 'Pemilik' ? profile.uid : profile.invitedBy;

  useEffect(() => {
    if (!ownerId) return;
    const q = query(collection(db, 'livestock'), where('ownerId', '==', ownerId));
    return onSnapshot(q, snap => {
      setAnimals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Livestock)));
    });
  }, [ownerId]);

  const handleDeleteAnimal = async (id: string) => {
    if (confirm(t('confirmDelete') || 'Hapus data ini?')) {
      try {
        await deleteDoc(doc(db, 'livestock', id));
      } catch (e) { console.error(e); }
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'Ayam': return <Bird size={24} className="text-orange-400" />;
      case 'Sapi': return <PawPrint size={24} className="text-red-400" />;
      case 'Kambing': return <PawPrint size={24} className="text-stone-400" />;
      case 'Burung': return <Bird size={24} className="text-blue-400" />;
      case 'Ikan': return <Fish size={24} className="text-cyan-400" />;
      default: return <Waves size={24} className="text-palm-leaf" />;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic">{t('livestockManagement')}</h2>
          <p className="text-palm-leaf text-sm font-medium">{t('livestockDesc')}</p>
        </div>
        <button 
          onClick={() => setIsAddingAnimal(true)}
          className="bg-lime-cream text-evergreen px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-lime-cream/20"
        >
          <Plus size={16} className="inline-block mr-2" /> {t('addLivestock')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {animals.map(animal => (
          <div key={animal.id} className="glass-card p-6 group hover:translate-y-[-4px] transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all">
                {getIcon(animal.type)}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 ${
                  animal.healthStatus === 'Optimal' ? 'bg-green-500/20 text-green-400' :
                  animal.healthStatus === 'Warning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {t(`health${animal.healthStatus}`)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setSelectedWasteParent({ id: animal.id, name: animal.name })}
                    className="p-1.5 bg-green-500/20 text-green-400 rounded-lg border border-green-500/20 hover:bg-green-500/30 transition-all"
                    title={t('wasteManagement')}
                  >
                    <Recycle size={12} />
                  </button>
                  <button 
                    onClick={() => setEditingAnimal(animal)}
                    className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500/30 transition-all"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button 
                    onClick={() => handleDeleteAnimal(animal.id)}
                    className="p-1.5 bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/30 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-palm-leaf mb-1">{animal.type}</p>
              <h3 className="text-2xl font-black text-white tracking-tight italic mb-2">{animal.name}</h3>
              <div className="flex flex-col gap-1 mb-4 opacity-60">
                <p className="text-[10px] text-palm-leaf font-bold uppercase tracking-widest flex items-center gap-1.5 ">
                  <MapIcon size={12} /> {animal.location.name}
                </p>
                <p className="text-[10px] text-palm-leaf font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <GridIcon size={12} /> {animal.cageCapacity}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[8px] text-palm-leaf/60 font-black uppercase tracking-tighter mb-0.5">{t('quantity')}</p>
                    <p className="text-sm font-black text-white">{animal.quantity}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[8px] text-palm-leaf/60 font-black uppercase tracking-tighter mb-0.5">♂</p>
                    <p className="text-sm font-black text-blue-400">{animal.maleQuantity}</p>
                  </div>
                   <div className="bg-white/5 p-2 rounded-xl border border-white/5 text-center">
                    <p className="text-[8px] text-palm-leaf/60 font-black uppercase tracking-tighter mb-0.5">♀</p>
                    <p className="text-sm font-black text-pink-400">{animal.femaleQuantity}</p>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-palm-leaf/60">
                    <span>{t('feedLevel')}</span>
                    <span>{animal.feedLevel}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-lime-cream transition-all" style={{ width: `${animal.feedLevel}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {animals.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card border-dashed">
            <PawPrint size={48} className="mx-auto text-palm-leaf opacity-20 mb-4" />
            <p className="font-bold text-palm-leaf uppercase tracking-widest text-sm">{t('activeLivestock')}</p>
          </div>
        )}
      </div>

      {animals.length > 0 && (
        <div className="space-y-6 pt-10">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
               <Globe className="text-lime-cream" size={20} />
             </div>
             <div>
               <h3 className="text-xl font-black text-white italic tracking-tight">{t('livestockDistributionMap')}</h3>
               <p className="text-[10px] text-palm-leaf font-bold uppercase tracking-widest leading-none mt-1">{t('globalMonitoring')}</p>
             </div>
             <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          <div className="h-[400px] w-full rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative z-0 group">
            <MapContainer center={[animals[0].location.lat, animals[0].location.lng]} zoom={10} style={{ height: '100%', width: '100%' }}>
              <TileLayer 
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {animals.map(animal => (
                <Marker key={animal.id} position={[animal.location.lat, animal.location.lng]}>
                  <Popup className="custom-popup">
                    <div className="p-2 bg-hunter-green text-white rounded-lg min-w-[150px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-lime-cream shadow-[0_0_8px_rgba(236,243,158,0.6)]" />
                        <p className="font-black text-lime-cream uppercase tracking-widest text-[9px]">{animal.type}</p>
                      </div>
                      <p className="font-black text-white text-sm uppercase mb-1 tracking-tight">{animal.name}</p>
                      <div className="space-y-1 border-t border-white/10 pt-2">
                        <p className="text-[8px] text-palm-leaf font-bold flex items-center gap-1 uppercase"><MapPin size={8} /> {animal.location.name}</p>
                        <p className="text-[8px] text-palm-leaf font-bold flex items-center gap-1 uppercase"><GridIcon size={8} /> {animal.cageCapacity}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <div className="absolute top-6 right-6 z-[1000] bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
               <p className="text-[10px] font-black text-white uppercase tracking-widest">{animals.length} {t('totalLocations')}</p>
            </div>
          </div>
        </div>
      )}

      {isAddingAnimal && (
        <LivestockForm 
          ownerId={ownerId!} 
          onClose={() => setIsAddingAnimal(false)} 
        />
      )}

      {editingAnimal && (
        <LivestockForm 
          ownerId={ownerId!} 
          animal={editingAnimal}
          onClose={() => setEditingAnimal(null)} 
        />
      )}

      {selectedWasteParent && (
        <WastePanel 
          ownerId={ownerId!}
          parentId={selectedWasteParent.id}
          parentName={selectedWasteParent.name}
          onClose={() => setSelectedWasteParent(null)}
        />
      )}
    </motion.div>
  );
}

function WastePanel({ ownerId, parentId, parentName, onClose }: { ownerId: string, parentId: string, parentName: string, onClose: () => void }) {
  const { t } = useLanguage();
  const [wastes, setWastes] = useState<WasteManagement[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'waste_management'), where('parentId', '==', parentId));
    return onSnapshot(q, snap => {
      setWastes(snap.docs.map(d => ({ id: d.id, ...d.data() } as WasteManagement)));
    });
  }, [parentId]);

  const handleAddWaste = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as any;
    const quantity = Number(formData.get('quantity'));
    const unit = formData.get('unit') as string;
    const pricePerUnit = Number(formData.get('pricePerUnit'));
    const isForSale = formData.get('isForSale') === 'on';
    
    // Get delivery options
    const deliveryOptions: string[] = [];
    if (formData.get('pickup') === 'on') deliveryOptions.push('pickup');
    if (formData.get('localDelivery') === 'on') deliveryOptions.push('localDelivery');
    if (formData.get('courier') === 'on') deliveryOptions.push('courier');

    try {
      const wasteRef = await addDoc(collection(db, 'waste_management'), {
        ownerId,
        parentId,
        type,
        quantity,
        unit,
        pricePerUnit,
        isForSale,
        deliveryOptions,
        updatedAt: serverTimestamp()
      });

      if (isForSale) {
        // Automatically create shop product
        await addDoc(collection(db, 'shop_products'), {
          ownerId,
          name: `${t(`waste${type.charAt(0).toUpperCase() + type.slice(1)}`)} - ${parentName}`,
          price: pricePerUnit,
          unit,
          category: 'Pupuk/Waste',
          description: `Waste from ${parentName}. Type: ${t(`waste${type.charAt(0).toUpperCase() + type.slice(1)}`)}`,
          storeType: 'Pertanian',
          isWaste: true,
          deliveryOptions,
          createdAt: serverTimestamp()
        });
      }
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8 border-lime-cream/20">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
          <div>
            <h3 className="text-2xl font-black text-white italic tracking-tight uppercase leading-none">{t('wasteManagement')}</h3>
            <p className="text-[10px] text-palm-leaf font-bold uppercase tracking-widest mt-1">{parentName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all"><Plus size={20} className="rotate-45" /></button>
        </div>

        {!showAdd ? (
          <div className="space-y-6">
            <button onClick={() => setShowAdd(true)} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-palm-leaf hover:bg-white/5 transition-all font-black uppercase tracking-widest text-[10px]">
              <Plus size={14} /> Add Waste Data
            </button>
            <div className="grid grid-cols-1 gap-4">
              {wastes.map(w => (
                <div key={w.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-lime-cream/10 rounded-xl text-lime-cream"><Recycle size={18} /></div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">{t(`waste${w.type.charAt(0).toUpperCase() + w.type.slice(1)}`)}</p>
                      <p className="text-[10px] text-palm-leaf font-bold italic">{w.quantity} {w.unit} @ Rp {w.pricePerUnit.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     {w.isForSale && <div className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">Live in Shop</div>}
                     <div className="flex gap-2">
                       {w.deliveryOptions.map(opt => (
                         <div key={opt} className="text-lime-cream/60"><Truck size={12} /></div>
                       ))}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleAddWaste} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-palm-leaf ml-2">{t('wasteType')}</label>
                <select name="type" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-cream transition-all appearance-none">
                  <option value="raw" className="bg-evergreen">{t('wasteRaw')}</option>
                  <option value="cooked" className="bg-evergreen">{t('wasteCooked')}</option>
                  <option value="animalPoop" className="bg-evergreen">{t('wastePoop')}</option>
                  <option value="foliage" className="bg-evergreen">{t('wasteFoliage')}</option>
                  <option value="other" className="bg-evergreen">{t('wasteOther')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-palm-leaf ml-2">Quantity</label>
                <div className="flex gap-2">
                  <input type="number" name="quantity" required className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-cream transition-all" placeholder="0" />
                  <input type="text" name="unit" required className="w-20 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-cream transition-all" placeholder="kg" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-palm-leaf ml-2">{t('price')}</label>
              <input type="number" name="pricePerUnit" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-lime-cream transition-all" placeholder="Price per unit" />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-palm-leaf ml-2">{t('deliveryOptions')}</label>
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                  <input type="checkbox" name="pickup" className="accent-lime-cream" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{t('pickup')}</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                  <input type="checkbox" name="localDelivery" className="accent-lime-cream" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{t('localDelivery')}</span>
                </label>
                 <label className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                  <input type="checkbox" name="courier" className="accent-lime-cream" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{t('courier')}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-lime-cream/5 rounded-2xl border border-lime-cream/20">
               <input type="checkbox" name="isForSale" id="isForSale" className="w-4 h-4 accent-lime-cream" />
               <label htmlFor="isForSale" className="text-xs font-bold text-white uppercase tracking-widest cursor-pointer select-none">{t('sellAsWaste')}</label>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-palm-leaf hover:bg-white/5 rounded-2xl transition-all">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-lime-cream text-evergreen rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-lime-cream/20 hover:brightness-110 active:scale-95 transition-all">Save Waste Data</button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

function LivestockForm({ ownerId, animal, onClose }: { ownerId: string, animal?: Livestock, onClose: () => void }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(animal ? {
    name: animal.name,
    type: animal.type,
    location: animal.location,
    cageCapacity: animal.cageCapacity,
    maleQuantity: animal.maleQuantity,
    femaleQuantity: animal.femaleQuantity
  } : {
    name: '',
    type: 'Ayam',
    location: {
      name: '',
      lat: -6.200000,
      lng: 106.816666
    },
    cageCapacity: '1-100',
    maleQuantity: 0,
    femaleQuantity: 0
  });

  const capacities = [
    '1-100', '101-1000', '1001-5000', '5001-7000', '7001-10000',
    '10001-30000', '30001-50000', '50001-100000', '100000+'
  ];

  const MapPicker = () => {
    const map = useMapEvents({
      async click(e) {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, lat: e.latlng.lat, lng: e.latlng.lng }
        }));
        
        // Reverse Geocoding
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            setFormData(prev => ({
              ...prev,
              location: { ...prev.location, name: data.display_name }
            }));
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
        }
      },
    });
    
    useEffect(() => {
      map.flyTo([formData.location.lat, formData.location.lng], map.getZoom());
    }, [formData.location.lat, formData.location.lng, map]);

    return (
      <Marker position={[formData.location.lat, formData.location.lng]}>
        <Popup>{t('dropPin')}</Popup>
      </Marker>
    );
  };

  const handleAddressSearch = async () => {
    if (!formData.location.name) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location.name)}&limit=1`);
      const data = await res.json();
      if (data && data[0]) {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
        }));
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        ownerId,
        quantity: formData.maleQuantity + formData.femaleQuantity,
        healthStatus: animal ? animal.healthStatus : 'Optimal',
        feedLevel: animal ? animal.feedLevel : 100,
        updatedAt: serverTimestamp()
      };

      if (animal) {
        await updateDoc(doc(db, 'livestock', animal.id), data);
      } else {
        await addDoc(collection(db, 'livestock'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-hunter-green w-full max-w-2xl rounded-[2.5rem] border border-white/10 p-6 lg:p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]"
      >
        <div className="absolute top-0 right-0 p-6 lg:p-8">
          <button onClick={onClose} className="text-palm-leaf hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-6">{animal ? t('edit') : t('addLivestock')}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('livestockName')}</label>
              <input 
                type="text" required 
                className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white focus:ring-2 focus:ring-lime-cream outline-none"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('livestockType')}</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white focus:ring-2 focus:ring-lime-cream outline-none cursor-pointer appearance-none"
                value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              >
                {['Ayam', 'Sapi', 'Kambing', 'Burung', 'Ikan', 'Lainnya'].map(type => (
                  <option key={type} value={type} className="bg-hunter-green">{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('cageCapacity')}</label>
              <select 
                className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white focus:ring-2 focus:ring-lime-cream outline-none cursor-pointer appearance-none"
                value={formData.cageCapacity} onChange={e => setFormData({ ...formData, cageCapacity: e.target.value })}
              >
                {capacities.map(cap => (
                  <option key={cap} value={cap} className="bg-hunter-green">{cap}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('livestockLocation')}</label>
              <div className="relative">
                <input 
                  type="text" required 
                  className="w-full px-5 py-3 pr-12 rounded-2xl bg-black/20 border border-white/5 text-white focus:ring-2 focus:ring-lime-cream outline-none"
                  placeholder="Ketik alamat atau drop pin di peta..."
                  value={formData.location.name} 
                  onChange={e => setFormData({ ...formData, location: { ...formData.location, name: e.target.value } })}
                  onBlur={handleAddressSearch}
                />
                <button 
                  type="button"
                  onClick={handleAddressSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-palm-leaf hover:text-white transition-colors"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('dropPin')}</label>
            <div className="h-40 w-full rounded-2xl overflow-hidden border border-white/10">
              <MapContainer center={[formData.location.lat, formData.location.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapPicker />
              </MapContainer>
            </div>
            <p className="text-[8px] text-palm-leaf/60 mt-1 italic">Lat: {formData.location.lat.toFixed(6)}, Lng: {formData.location.lng.toFixed(6)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1 flex items-center gap-1.5"><span className="text-blue-400">♂</span> {t('maleQuantity')}</label>
              <input 
                type="number" required min="0" 
                className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white focus:ring-2 focus:ring-lime-cream outline-none font-mono text-sm"
                value={formData.maleQuantity} onChange={e => setFormData({ ...formData, maleQuantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1 flex items-center gap-1.5"><span className="text-pink-400">♀</span> {t('femaleQuantity')}</label>
              <input 
                type="number" required min="0" 
                className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white focus:ring-2 focus:ring-lime-cream outline-none font-mono text-sm"
                value={formData.femaleQuantity} onChange={e => setFormData({ ...formData, femaleQuantity: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
             <button 
              type="button" onClick={onClose}
              className="flex-1 py-4 bg-white/5 text-palm-leaf rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-white/5"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" disabled={loading}
              className="flex-2 py-4 bg-lime-cream text-evergreen rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-lime-cream/10 disabled:opacity-50"
            >
              {loading ? '...' : t('save')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function InventoryView({ profile }: { profile: UserProfile }) {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [wastes, setWastes] = useState<WasteManagement[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const ownerId = profile.role === 'Pemilik' ? profile.uid : profile.invitedBy;

  useEffect(() => {
    if (!ownerId) return;
    const qInv = query(collection(db, 'inventory'), where('ownerId', '==', ownerId));
    const qWaste = query(collection(db, 'waste_management'), where('ownerId', '==', ownerId));
    
    const unsubInv = onSnapshot(qInv, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'inventory'));
    
    const unsubWaste = onSnapshot(qWaste, snap => {
      setWastes(snap.docs.map(d => ({ id: d.id, ...d.data() } as WasteManagement)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'waste_management'));

    return () => { unsubInv(); unsubWaste(); };
  }, [ownerId]);

  const stats = {
    total: items.length + wastes.length,
    tools: items.filter(i => i.category === 'alat').length,
    materials: items.filter(i => i.category !== 'alat').length,
    organicWaste: wastes.length
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-center pb-6 border-b border-white/10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic">{t('logisticsInventory')}</h2>
          <p className="text-palm-leaf text-sm font-medium">{t('inventoryDesc')}</p>
        </div>
        <button 
          onClick={() => setShowItemForm(true)}
          className="bg-lime-cream text-evergreen px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-lime-cream/10"
        >
          <Plus size={14} className="inline-block mr-2" /> {t('newItem')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Package className="text-palm-leaf" />} label={t('totalItem')} value={stats.total.toString()} trend={t('inStock')} />
        <StatCard icon={<Info className="text-orange-400" />} label={t('workTools')} value={stats.tools.toString()} trend={t('maintenance')} />
        <StatCard icon={<Droplets className="text-blue-400" />} label={t('chemicals')} value={stats.materials.toString()} trend={t('storage')} />
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-palm-leaf">{t('itemName')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-palm-leaf">{t('category')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-palm-leaf text-center">{t('stock')}</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-palm-leaf text-right">{t('lastUpdate')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors cursor-default group">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-fern shadow-[0_0_8px_rgba(79,119,45,0.6)]" />
                     <span className="text-sm font-bold text-white uppercase tracking-wider">{item.name}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                   <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase text-palm-leaf">{item.category}</span>
                </td>
                <td className="px-6 py-4 text-center">
                   <span className="text-sm font-black text-lime-cream font-mono">{item.stock} {item.unit}</span>
                </td>
                <td className="px-6 py-4 text-right">
                   <span className="text-[10px] font-bold text-palm-leaf/50 italic">{new Date(item.updatedAt?.seconds * 1000).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')}</span>
                </td>
              </tr>
            ))}
            {wastes.map(w => (
              <tr key={w.id} className="hover:bg-green-500/5 transition-colors cursor-default group bg-green-500/5">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                     <span className="text-sm font-bold text-white uppercase tracking-wider">{t(`waste${w.type.charAt(0).toUpperCase() + w.type.slice(1)}`)}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-[9px] font-black uppercase text-green-400">{t('organicWaste')}</span>
                </td>
                <td className="px-6 py-4 text-center">
                   <span className="text-sm font-black text-green-400 font-mono">{w.quantity} {w.unit}</span>
                </td>
                <td className="px-6 py-4 text-right">
                   <span className="text-[10px] font-bold text-palm-leaf/50 italic">{new Date(w.updatedAt?.seconds * 1000).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')}</span>
                </td>
              </tr>
            ))}
            {items.length === 0 && wastes.length === 0 && (
              <tr><td colSpan={4} className="py-20 text-center text-palm-leaf opacity-30 italic">No inventory records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showItemForm && <InventoryItemForm ownerId={ownerId!} onClose={() => setShowItemForm(false)} />}
    </motion.div>
  );
}

function InventoryItemForm({ ownerId, onClose }: { ownerId: string, onClose: () => void }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await addDoc(collection(db, 'inventory'), {
        ownerId,
        name: formData.get('name'),
        category: formData.get('category'),
        stock: Number(formData.get('stock')),
        unit: formData.get('unit'),
        minimStock: Number(formData.get('minimStock')),
        updatedAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-hunter-green w-full max-w-lg rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-palm-leaf hover:text-white"><X size={24} /></button>
        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-6">{t('newItem')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('itemName')}</label>
            <input name="name" type="text" required className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white outline-none focus:border-lime-cream transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('category')}</label>
              <select name="category" required className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white outline-none focus:border-lime-cream transition-all appearance-none">
                <option value="alat" className="bg-hunter-green">{t('alat') || 'Tool'}</option>
                <option value="pupuk" className="bg-hunter-green">{t('pupuk') || 'Fertilizer'}</option>
                <option value="pestisida" className="bg-hunter-green">{t('pestisida') || 'Pesticide'}</option>
                <option value="herbisida" className="bg-hunter-green">{t('herbisida') || 'Herbicide'}</option>
                <option value="lainnya" className="bg-hunter-green">{t('lainnya') || 'Other'}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">Unit</label>
              <input name="unit" type="text" required className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white outline-none focus:border-lime-cream transition-all" placeholder="pcs/kg/liter" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">Stock</label>
              <input name="stock" type="number" required className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white outline-none focus:border-lime-cream transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">Min. Stock Alert</label>
              <input name="minimStock" type="number" defaultValue="5" className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white outline-none focus:border-lime-cream transition-all" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-lime-cream text-evergreen rounded-2xl font-black uppercase tracking-widest text-[10px] mt-4 shadow-xl shadow-lime-cream/10 hover:brightness-110 active:scale-95 transition-all">
            {loading ? '...' : t('save')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function SalesView({ profile }: { profile: UserProfile }) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'internal' | 'shop'>('internal');
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  
  const ownerId = profile.role === 'Pemilik' ? profile.uid : profile.invitedBy;

  useEffect(() => {
    if (!ownerId) return;
    const pQ = query(collection(db, 'products'), where('ownerId', '==', ownerId));
    const tQ = query(collection(db, 'transactions'), where('ownerId', '==', ownerId), orderBy('timestamp', 'desc'));
    const spQ = query(collection(db, 'shop_products'), where('ownerId', '==', ownerId));
    
    const unsubP = onSnapshot(pQ, 
      snap => setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product))),
      error => handleFirestoreError(error, OperationType.LIST, 'products')
    );
    const unsubT = onSnapshot(tQ, 
      snap => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction))),
      error => handleFirestoreError(error, OperationType.LIST, 'transactions')
    );
    const unsubSP = onSnapshot(spQ, 
      snap => setShopProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as ShopProduct))),
      error => handleFirestoreError(error, OperationType.LIST, 'shop_products')
    );
    
    return () => { unsubP(); unsubT(); unsubSP(); };
  }, [ownerId]);

  const totalSales = transactions.reduce((acc, curr) => acc + curr.totalPrice, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic">{t('commercialCenter')}</h2>
          <p className="text-palm-leaf text-sm font-medium">{t('salesDesc')}</p>
        </div>
        <div className="flex gap-4">
           {activeTab === 'internal' ? (
             <>
               <button onClick={() => setShowProductForm(true)} className="bg-lime-cream text-evergreen px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-lime-cream/10">
                 <Plus size={14} className="inline-block mr-2" /> {t('newProduct')}
               </button>
               <button onClick={() => setShowTransactionForm(true)} className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 active:scale-95 transition-all">
                 <ShoppingCart size={14} className="inline-block mr-2" /> {t('transaction')}
               </button>
             </>
           ) : (
             <button onClick={() => setShowShopForm(true)} className="bg-lime-cream text-evergreen px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-lime-cream/10">
               <Plus size={14} className="inline-block mr-2" /> {t('addProduct')}
             </button>
           )}
        </div>
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
        <button onClick={() => setActiveTab('internal')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'internal' ? 'bg-fern text-white shadow-lg' : 'text-palm-leaf hover:bg-white/5'}`}>Internal Sales</button>
        <button onClick={() => setActiveTab('shop')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'shop' ? 'bg-fern text-white shadow-lg' : 'text-palm-leaf hover:bg-white/5'}`}>{t('navMyShop')}</button>
      </div>

      {activeTab === 'internal' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<BarChartIcon className="text-green-400" />} label={t('totalRevenue')} value={`Rp ${totalSales.toLocaleString()}`} trend="+12.5% Growth" />
            <StatCard icon={<ShoppingBag className="text-orange-400" />} label={t('soldProducts')} value={transactions.length.toString()} trend="Transactions" />
            <StatCard icon={<Package className="text-blue-400" />} label={t('productVariants')} value={products.length.toString()} trend="Catalogue" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-8">
               <h3 className="font-black uppercase tracking-widest text-palm-leaf text-xs mb-6 flex items-center gap-2">
                 <Package size={16} /> {t('harvestStock')}
               </h3>
               <div className="space-y-4">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                       <div>
                         <p className="text-sm font-black text-white uppercase tracking-tight">{p.name}</p>
                         <p className="text-[10px] text-palm-leaf font-bold">Rp {p.price.toLocaleString()} / {p.unit}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] text-palm-leaf uppercase font-black tracking-widest">{t('remainingStock')}</p>
                         <p className="text-lg font-black text-lime-cream font-mono">{p.stock}</p>
                       </div>
                    </div>
                  ))}
                  {products.length === 0 && <p className="text-center py-10 italic opacity-30 text-xs">No products registered yet.</p>}
               </div>
            </div>

            <div className="glass-card p-8">
               <h3 className="font-black uppercase tracking-widest text-palm-leaf text-xs mb-6 flex items-center gap-2">
                 <History size={16} /> {t('transactionHistory')}
               </h3>
               <div className="space-y-4">
                  {transactions.map(t_item => {
                    const product = products.find(p => p.id === t_item.productId);
                    return (
                      <div key={t_item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                         <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-xl bg-fern/20 flex items-center justify-center text-fern">
                               <CheckCircle size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white uppercase tracking-tight">{product?.name || 'Deleted Item'}</p>
                              <p className="text-[10px] text-palm-leaf font-bold italic">{new Date(t_item.timestamp?.seconds * 1000).toLocaleString()}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black text-white">Rp {t_item.totalPrice.toLocaleString()}</p>
                            <p className="text-[9px] font-black text-palm-leaf uppercase tracking-widest">{t_item.quantity} {t('unitSold')}</p>
                         </div>
                      </div>
                    );
                  })}
                  {transactions.length === 0 && <p className="text-center py-10 italic opacity-30 text-xs">{t('noTransactions')}</p>}
               </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shopProducts.map(p => (
            <div key={p.id} className="glass-card overflow-hidden group">
               <div className="aspect-video relative overflow-hidden">
                 <img src={p.image || 'https://images.unsplash.com/photo-1582213708055-6677f59595a5?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-lime-cream uppercase tracking-widest">{t(p.category)}</div>
               </div>
               <div className="p-6">
                 <h4 className="text-lg font-black text-white uppercase tracking-tight mb-1">{p.name}</h4>
                 <p className="text-xs text-palm-leaf font-bold mb-4 line-clamp-2">{p.description || 'No description provided.'}</p>
                 <div className="flex justify-between items-center pt-4 border-t border-white/5">
                   <p className="text-sm font-black text-lime-cream font-mono">Rp {p.price.toLocaleString()}</p>
                   <p className="text-[10px] text-palm-leaf uppercase font-black tracking-widest">/ {p.unit}</p>
                 </div>
                 <div className="flex gap-2 mt-6">
                    <button onClick={() => handleDeleteShopProduct(p.id)} className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-all border border-red-500/20">Delete</button>
                    <button onClick={() => setShowShopForm(true)} className="flex-1 py-3 bg-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/30 transition-all border border-blue-500/20">Edit</button>
                 </div>
               </div>
            </div>
          ))}
          {shopProducts.length === 0 && (
             <div className="col-span-full py-20 text-center glass-card">
               <ShoppingBag size={48} className="mx-auto text-palm-leaf opacity-20 mb-4" />
               <p className="text-sm text-palm-leaf font-bold uppercase tracking-widest">{t('noProductsFound')}</p>
               <button onClick={() => setShowShopForm(true)} className="mt-4 text-lime-cream font-black uppercase tracking-widest text-[10px] underline underline-offset-4">{t('addProduct')}</button>
             </div>
          )}
        </div>
      )}

      {showShopForm && <ShopProductForm ownerId={ownerId!} onClose={() => setShowShopForm(false)} />}
      {showProductForm && <InternalProductForm ownerId={ownerId!} onClose={() => setShowProductForm(false)} />}
      {showTransactionForm && <InternalTransactionForm ownerId={ownerId!} products={products} onClose={() => setShowTransactionForm(false)} />}
    </motion.div>
  );
}

function InternalProductForm({ ownerId, onClose }: { ownerId: string, onClose: () => void }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const unit = formData.get('unit') as string;

    try {
      await addDoc(collection(db, 'products'), {
        ownerId, name, price, stock, unit, updatedAt: serverTimestamp()
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-hunter-green w-full max-w-lg rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-palm-leaf hover:text-white"><X size={24} /></button>
        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-6">{t('newProduct')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">Product Name</label>
            <input name="name" type="text" required className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white outline-none focus:border-lime-cream transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">{t('price')}</label>
              <input name="price" type="number" required className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white outline-none focus:border-lime-cream transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">Unit</label>
              <input name="unit" type="text" required className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white outline-none focus:border-lime-cream transition-all" placeholder="kg/pcs" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">Initial Stock</label>
            <input name="stock" type="number" required className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white outline-none focus:border-lime-cream transition-all" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-lime-cream text-evergreen rounded-2xl font-black uppercase tracking-widest text-[10px] mt-4 shadow-xl shadow-lime-cream/10 hover:brightness-110 active:scale-95 transition-all">
            {loading ? '...' : t('save')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function InternalTransactionForm({ ownerId, products, onClose }: { ownerId: string, products: Product[], onClose: () => void }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === selectedProductId);
  const totalPrice = product ? product.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (product.stock < quantity) return alert("Stok tidak mencukupi!");

    setLoading(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        ownerId,
        productId: product.id,
        buyerId: 'WALK_IN_CUSTOMER',
        quantity,
        totalPrice,
        status: 'completed',
        timestamp: serverTimestamp()
      });
      await updateDoc(doc(db, 'products', product.id), {
        stock: product.stock - quantity
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-hunter-green w-full max-w-lg rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-palm-leaf hover:text-white"><X size={24} /></button>
        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-6">{t('transaction')}</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">Select Product</label>
            <select 
              value={selectedProductId} 
              onChange={e => setSelectedProductId(e.target.value)} 
              className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-white/5 text-white outline-none focus:border-lime-cream transition-all appearance-none cursor-pointer"
            >
              {products.map(p => (
                <option key={p.id} value={p.id} className="bg-hunter-green">
                  {p.name} (Stock: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">Quantity</label>
              <input 
                type="number" required min="1" max={product?.stock} 
                value={quantity} onChange={e => setQuantity(Number(e.target.value))} 
                className="w-full px-5 py-3 rounded-2xl bg-black/20 border border-white/5 text-white outline-none focus:border-lime-cream transition-all" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-palm-leaf uppercase tracking-widest ml-1">Unit Price</label>
              <div className="w-full px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-white/50 text-sm">
                Rp {product?.price.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-6 bg-lime-cream/5 rounded-2xl border border-lime-cream/20 flex justify-between items-center">
            <span className="text-[10px] font-black text-palm-leaf uppercase tracking-widest">Total Price</span>
            <span className="text-xl font-black text-lime-cream font-mono">Rp {totalPrice.toLocaleString()}</span>
          </div>

          <button type="submit" disabled={loading || !product} className="w-full py-4 bg-lime-cream text-evergreen rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-lime-cream/10 hover:brightness-110 active:scale-95 transition-all">
            {loading ? '...' : 'Record Transaction'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

async function handleDeleteShopProduct(id: string) {
  if (confirm('Hapus produk ini dari toko?')) {
    await deleteDoc(doc(db, 'shop_products', id));
  }
}


function MappingView({ profile }: { profile: UserProfile }) {
  const { t } = useLanguage();
  const [lands, setLands] = useState<Land[]>([]);
  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [selectedWasteParent, setSelectedWasteParent] = useState<{id: string, name: string} | null>(null);
  const ownerId = profile.role === 'Pemilik' ? profile.uid : profile.invitedBy;

  useEffect(() => {
    if (!ownerId) return;
    const q = query(collection(db, 'lands'), where('ownerId', '==', ownerId));
    return onSnapshot(q, snap => {
      setLands(snap.docs.map(d => ({ id: d.id, ...d.data() } as Land)));
    });
  }, [ownerId]);

  const handleDeleteLand = async (id: string) => {
    if (confirm(t('confirmDelete') || 'Hapus lahan ini?')) {
      try {
        await deleteDoc(doc(db, 'lands', id));
      } catch (e) { console.error(e); }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex justify-between items-center pb-6 border-b border-white/10">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic">{t('mappingWeather')}</h2>
          <p className="text-palm-leaf text-sm font-medium">{t('mappingDesc')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-9 h-[400px] lg:h-[600px] glass-card overflow-hidden relative z-10 shadow-2xl">
          <MapContainer center={[-6.2088, 106.8456]} zoom={12} scrollWheelZoom={false}>
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {lands.map(l => (
              <Marker key={l.id} position={[l.location.lat, l.location.lng]}>
                <Popup className="custom-popup">
                  <div className="p-2 bg-evergreen text-white rounded-lg">
                    <p className="font-black uppercase tracking-widest text-[10px] text-lime-cream">{l.name}</p>
                    <p className="text-[10px] text-palm-leaf mt-1">{t('commodity')}: <span className="text-white">{l.cropType}</span></p>
                    <div className="mt-3 flex gap-3">
                       <span className="flex items-center gap-1 text-orange-400 font-bold text-[10px]"><Thermometer size={10} /> 28°C</span>
                       <span className="flex items-center gap-1 text-blue-400 font-bold text-[10px]"><Droplets size={10} /> 65%</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-black uppercase tracking-widest text-palm-leaf text-xs mb-6 flex items-center gap-2">
              <CloudRain size={16} /> {t('3DayForecast')}
            </h3>
            <div className="space-y-6">
              <WeatherDay day={t('today')} temp="28-31°C" condition="Cerah Berawan" icon={<Info size={14} className="text-yellow-400" />} />
              <WeatherDay day={t('tomorrow')} temp="27-30°C" condition="Hujan Ringan" icon={<CloudRain size={14} className="text-blue-400" />} />
              <WeatherDay day={t('afterTomorrow')} temp="26-29°C" condition="Berawan" icon={<CloudRain size={14} className="text-palm-leaf" />} />
            </div>
          </div>
          <div className="bg-orange-500/10 p-6 rounded-[2rem] border border-orange-500/20">
            <h3 className="text-orange-400 font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
              <AlertTriangle size={16} /> {t('weatherAlert')}
            </h3>
            <p className="text-xs leading-relaxed text-orange-200/70 font-medium">{t('weatherAlertDesc')}</p>
          </div>
        </div>
      </div>

      {/* Land List Section */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white/5 rounded-xl border border-white/10">
             <MapPin className="text-lime-cream" size={20} />
           </div>
           <h3 className="text-xl font-black text-white italic tracking-tight">{t('activeLand')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lands.map(l => (
            <div key={l.id} className="glass-card p-6 group hover:translate-y-[-4px] transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 flex gap-2 translate-y-[-10px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => setSelectedWasteParent({ id: l.id, name: l.name })}
                  className="p-2 bg-green-500/20 text-green-400 rounded-xl border border-green-500/20 hover:bg-green-500/30 transition-all"
                  title={t('wasteManagement')}
                >
                  <Recycle size={14} />
                </button>
                <button 
                  onClick={() => setEditingLand(l)}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/30 transition-all"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => handleDeleteLand(l.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 hover:bg-red-500/30 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-fern/20 rounded-xl text-fern"><Sprout size={20} /></div>
                  <div>
                    <h4 className="text-lg font-black text-white tracking-tight uppercase leading-none">{l.name}</h4>
                    <p className="text-[10px] text-palm-leaf font-bold uppercase tracking-widest mt-1">{t('commodity')}: {l.cropType}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-palm-leaf/60 uppercase tracking-widest">{t('location')}</p>
                    <p className="text-[10px] font-bold text-white line-clamp-1 mt-0.5">{l.location.lat.toFixed(4)}, {l.location.lng.toFixed(4)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-palm-leaf/60 uppercase tracking-widest">ID</p>
                    <p className="text-[10px] font-mono font-bold text-lime-cream mt-0.5">#{l.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {lands.length === 0 && (
            <div className="col-span-full py-12 text-center glass-card border-dashed">
              <p className="text-palm-leaf italic opacity-50">{t('noLandRegistered') || 'Belum ada lahan ditambahkan.'}</p>
            </div>
          )}
        </div>
      </div>

      {editingLand && (
        <LandForm 
          ownerId={ownerId!} 
          land={editingLand}
          onClose={() => setEditingLand(null)} 
        />
      )}

      {selectedWasteParent && (
        <WastePanel 
          ownerId={ownerId!}
          parentId={selectedWasteParent.id}
          parentName={selectedWasteParent.name}
          onClose={() => setSelectedWasteParent(null)}
        />
      )}
    </motion.div>
  );
}

function WeatherDay({ day, temp, condition, icon }: any) {
  return (
    <div className="flex items-center justify-between group cursor-default">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-all">{icon}</div>
        <div>
          <p className="text-[10px] font-black uppercase text-white tracking-widest leading-none mb-1">{day}</p>
          <p className="text-[9px] text-palm-leaf font-bold">{condition}</p>
        </div>
      </div>
      <p className="text-xs font-black text-lime-cream">{temp}</p>
    </div>
  );
}

function GuideView() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<CropGuide | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="pb-6 border-b border-white/10">
        <h2 className="text-4xl font-black text-white tracking-tighter italic">E-Farmania Knowledge Base</h2>
        <p className="text-palm-leaf text-sm font-medium">{t('guideDesc')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        {CROP_GUIDES.map(guide => (
          <div 
            key={guide.id} 
            onClick={() => setSelected(guide)}
            className="group glass-card overflow-hidden hover:translate-y-[-8px] transition-all duration-500 cursor-pointer shadow-xl hover:shadow-lime-cream/10"
          >
            <div className="h-40 relative overflow-hidden">
               <img src={guide.image} referrerPolicy="no-referrer" alt={guide.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-90" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
               <div className="absolute top-3 right-3 px-2 py-0.5 bg-fern border border-white/30 rounded-lg text-[9px] font-black uppercase text-white tracking-widest">{guide.category}</div>
               <div className="absolute bottom-3 left-3">
                 <h4 className="font-black text-white text-lg tracking-tight uppercase">{guide.name}</h4>
               </div>
            </div>
            <div className="p-4 border-t border-white/5">
                <p className="text-[10px] text-palm-leaf font-bold leading-relaxed line-clamp-2 italic opacity-70">Teknik budidaya presisi untuk optimasi hasil panen.</p>
               <button className="mt-4 w-full py-2 bg-white/5 border border-palm-leaf/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-lime-cream group-hover:bg-lime-cream group-hover:text-evergreen transition-all">
                 {t('openModule')}
               </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-evergreen/90 backdrop-blur-md"
              onClick={() => setSelected(null)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-5xl bg-hunter-green rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] border border-palm-leaf/30"
            >
              <div className="md:w-5/12 relative">
                <img src={selected.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-evergreen via-transparent to-transparent flex items-end p-10">
                  <div className="text-white">
                    <span className="px-4 py-1 bg-fern rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{selected.category}</span>
                    <h3 className="text-5xl font-black mt-4 tracking-tighter italic leading-none">{selected.name}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="md:w-7/12 p-10 overflow-y-auto bg-evergreen">
                <div className="space-y-6">
                  <DetailSection icon={<Sprout className="text-lime-cream" size={24} />} title={t('plantingProcedure')} content={selected.planting} />
                  <DetailSection icon={<Droplets className="text-blue-400" size={24} />} title={t('fertilizerOptimization')} content={selected.fertilization} />
                  <DetailSection icon={<ClipboardList className="text-orange-400" size={24} />} title={t('operational')} content={selected.operational} />
                  <DetailSection icon={<AlertTriangle className="text-red-400" size={24} />} title={t('pestsDisease')} content={selected.pestControl} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LivestockGuideView() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<LivestockGuide | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="pb-6 border-b border-white/10">
        <h2 className="text-4xl font-black text-white tracking-tighter italic">Livestock Academy</h2>
        <p className="text-palm-leaf text-sm font-medium">Panduan komprehensif untuk teknik peternakan modern dan berkelanjutan.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        {LIVESTOCK_GUIDES.map(guide => (
          <div 
            key={guide.id} 
            onClick={() => setSelected(guide)}
            className="group glass-card overflow-hidden hover:translate-y-[-8px] transition-all duration-500 cursor-pointer shadow-xl hover:shadow-lime-cream/10"
          >
            <div className="h-40 relative overflow-hidden">
               <img src={guide.image} referrerPolicy="no-referrer" alt={guide.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-90" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
               <div className="absolute top-3 right-3 px-2 py-0.5 bg-fern border border-white/30 rounded-lg text-[9px] font-black uppercase text-white tracking-widest">{guide.category}</div>
               <div className="absolute bottom-3 left-3">
                 <h4 className="font-black text-white text-lg tracking-tight uppercase">{guide.name}</h4>
               </div>
            </div>
            <div className="p-4 border-t border-white/5">
                <p className="text-[10px] text-palm-leaf font-bold leading-relaxed line-clamp-2 italic opacity-70">Manajemen kesehatan dan nutrisi untuk hasil ternak berkualitas.</p>
               <button className="mt-4 w-full py-2 bg-white/5 border border-palm-leaf/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-lime-cream group-hover:bg-lime-cream group-hover:text-evergreen transition-all">
                 {t('openModule')}
               </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-evergreen/90 backdrop-blur-md"
              onClick={() => setSelected(null)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-5xl bg-hunter-green rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] border border-palm-leaf/30"
            >
              <div className="md:w-5/12 relative">
                <img src={selected.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-evergreen via-transparent to-transparent flex items-end p-10">
                  <div className="text-white">
                    <span className="px-4 py-1 bg-fern rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{selected.category}</span>
                    <h3 className="text-5xl font-black mt-4 tracking-tighter italic leading-none">{selected.name}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelected(null)}
                  className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="md:w-7/12 p-10 overflow-y-auto bg-evergreen">
                <div className="space-y-6">
                  <DetailSection icon={<Sprout className="text-lime-cream" size={24} />} title="Bibit & Reproduksi" content={selected.breeding} />
                  <DetailSection icon={<Droplets className="text-blue-400" size={24} />} title="Nutrisi & Pakan" content={selected.feeding} />
                  <DetailSection icon={<ClipboardList className="text-orange-400" size={24} />} title={t('operational')} content={selected.operational} />
                  <DetailSection icon={<AlertTriangle className="text-red-400" size={24} />} title="Kesehatan & Penyakit" content={selected.diseaseControl} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailSection({ icon, title, content }: any) {
  return (
    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
        <h4 className="font-black text-white tracking-widest text-xs uppercase">{title}</h4>
      </div>
      <p className="text-sm text-palm-leaf/80 leading-relaxed font-medium">{content}</p>
    </div>
  );
}

function LandForm({ ownerId, land, onClose }: { ownerId: string, land?: Land, onClose: () => void }) {
  const { t } = useLanguage();
  const [name, setName] = useState(land ? land.name : '');
  const [cropType, setCropType] = useState(land ? land.cropType : 'Padi');
  const [lat, setLat] = useState(land ? land.location.lat : -6.2088);
  const [lng, setLng] = useState(land ? land.location.lng : 106.8456);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name,
        cropType,
        location: { lat, lng },
        updatedAt: serverTimestamp()
      };

      if (land) {
        await updateDoc(doc(db, 'lands', land.id), data);
      } else {
        await addDoc(collection(db, 'lands'), {
          ...data,
          ownerId,
          createdAt: serverTimestamp()
        });
      }
      onClose();
    } catch(e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-hunter-green p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] w-full max-w-2xl shadow-2xl border border-palm-leaf/30 overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
          <h3 className="text-xl lg:text-2xl font-black text-white italic tracking-tighter">{land ? t('edit') : t('landConfiguration')}</h3>
          <button onClick={onClose} className="p-2 text-palm-leaf hover:text-white transition-all"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-palm-leaf ml-1">{t('productionAreaName')}</label>
            <input 
              type="text" required 
              className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-palm-leaf/20 text-white outline-none focus:border-lime-cream transition-all" 
              placeholder={t('productionAreaNamePlaceholder')}
              value={name} onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-palm-leaf ml-1">{t('mainCommodity')}</label>
            <select 
              className="w-full px-5 py-4 rounded-2xl bg-black/20 border border-palm-leaf/20 text-white outline-none cursor-pointer"
              value={cropType} onChange={e => setCropType(e.target.value)}
            >
              <option className="bg-hunter-green" value="Padi">Padi</option>
              <option className="bg-hunter-green" value="Sayuran">Sayuran</option>
              <option className="bg-hunter-green" value="Buah">Buah</option>
              <option className="bg-hunter-green" value="Tebu">Tebu</option>
              <option className="bg-hunter-green" value="Tanaman Bumbu">Tanaman Bumbu</option>
            </select>
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-palm-leaf ml-1">{t('geographicCoordinates')}</label>
             <div className="h-48 lg:h-56 rounded-2xl overflow-hidden border border-palm-leaf/20 shadow-inner">
               <MapContainer center={[lat, lng]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                 <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                 <MapClickHandler onPick={(la, ln) => { setLat(la); setLng(ln); }} />
                 <Marker position={[lat, lng]} />
               </MapContainer>
             </div>
             <p className="text-[9px] font-bold text-hunter-green bg-palm-leaf/20 px-3 py-1 rounded-full w-fit mt-3">TARGET: {lat.toFixed(6)}, {lng.toFixed(6)}</p>
          </div>
          <button 
            disabled={loading}
            className="w-full py-5 bg-lime-cream text-evergreen rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-lime-cream/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? '...' : t('save')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng); }
  });
  return null;
}
