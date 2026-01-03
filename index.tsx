import './index.css';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Plus, Trash2, Check, X, Circle, Zap, ChevronDown, ChevronUp, 
  MoreVertical, ArrowRight, ArrowLeft, Edit2, RefreshCw, AlertCircle, 
  Menu, Settings, HelpCircle, Info, MessageSquare, Heart, Share2, Copy,
  Moon, Sun
} from 'lucide-react';

// --- Types ---

type DayStatus = 'standard' | 'special' | 'emergency' | null;
type Page = 'home' | 'settings' | 'guide' | 'about' | 'feedback' | 'donate';
type Theme = 'dark' | 'light';

interface Stage {
  id: string;
  chelehBite: string;
  specialBite: string;
  emergencyBite?: string;
  days: DayStatus[];
}

interface Habit {
  id: string;
  title: string;
  initialBite: string;
  finalBite: string;
  startDate: number;
  stages: Stage[];
}

// --- Helpers ---

const getDaysPassed = (startDate: number) => {
  const start = new Date(startDate).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  const diffTime = now - start;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const getPageTitle = (page: Page) => {
  switch (page) {
    case 'home': return 'جدول عادت‌سازی';
    case 'settings': return 'تنظیمات';
    case 'guide': return 'راهنما';
    case 'about': return 'درباره ما';
    case 'feedback': return 'ارسال نظر';
    case 'donate': return 'حامی باش';
    default: return 'چله';
  }
};

// --- Components ---

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // تنظیم تم پیش‌فرض روی Dark اگر قبلاً ست نشده باشد
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('app-theme') as Theme) || 'dark';
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem('habits-40-days-v6');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.map((h: any) => {
        if (!h.startDate) {
            let totalFilled = 0;
            if (h.stages) {
                h.stages.forEach((s: Stage) => {
                    totalFilled += s.days.filter(d => d !== null).length;
                });
            }
            return { ...h, startDate: Date.now() - (totalFilled * 86400000) };
        }
        return h;
      });
    } catch (e) {
      return [];
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('habits-40-days-v6', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const addHabit = (habit: Habit) => {
    setHabits([...habits, habit]);
    setIsAddModalOpen(false);
  };

  const updateHabit = (updatedHabit: Habit) => {
    setHabits(habits.map(h => h.id === updatedHabit.id ? updatedHabit : h));
  };

  const deleteHabit = (id: string) => {
    if (window.confirm('آیا از حذف کامل این عادت و تاریخچه آن اطمینان دارید؟')) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  // --- اصلاح بخش اشتراک گذاری ---
  const handleShare = async () => {
    const shareData = {
      title: 'چله یار', // نام پیشنهادی
      text: 'من دارم با اپلیکیشن "چله یار" عادت‌های جدید می‌سازم. تو هم امتحانش کن!',
      url: 'https://example.com/download' // لینک دانلود خود را اینجا بگذارید
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      alert('لینک دانلود کپی شد!');
    }
    setIsMenuOpen(false);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div ={`min-h-screen pb-32 font-['Vazirmatn'] overflow-x-hidden transition-colors duration-300 bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white`}>
      
      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Drawer Menu */}
      <div className={`fixed inset-y-0 right-0 w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/30">
                <Zap className="text-white w-6 h-6 fill-current" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">منوی اصلی</span>
            </div>

            <nav className="flex-1 space-y-2">
              <MenuItem icon={<Zap />} label="جدول عادت‌سازی" active={currentPage === 'home'} onClick={() => { setCurrentPage('home'); setIsMenuOpen(false); }} />
              <MenuItem icon={<Settings />} label="تنظیمات" active={currentPage === 'settings'} onClick={() => { setCurrentPage('settings'); setIsMenuOpen(false); }} />
              <MenuItem icon={<HelpCircle />} label="راهنمایی" active={currentPage === 'guide'} onClick={() => { setCurrentPage('guide'); setIsMenuOpen(false); }} />
              <MenuItem icon={<Info />} label="درباره ما" active={currentPage === 'about'} onClick={() => { setCurrentPage('about'); setIsMenuOpen(false); }} />
              <MenuItem icon={<MessageSquare />} label="ارسال نظر" active={currentPage === 'feedback'} onClick={() => { setCurrentPage('feedback'); setIsMenuOpen(false); }} />
              <MenuItem icon={<Heart />} label="حمایت مالی" active={currentPage === 'donate'} onClick={() => { setCurrentPage('donate'); setIsMenuOpen(false); }} />
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Share2 size={20} />
                  <span>معرفی به دوستان</span>
                </button>
              </div>
            </nav>

            <div className="mt-auto text-center text-xs text-slate-400 dark:text-slate-600 pt-6">
               نسخه ۱.۰.۰
            </div>
         </div>
      </div>

      {/* App Header (اصلاح شده) */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 transition-colors duration-300">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -mr-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
            >
              <Menu size={24} />
            </button>
            {/* تیتر اینجا داینامیک شد */}
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mr-1">
              {getPageTitle(currentPage)}
            </h1>
          </div>
          
          {currentPage === 'home' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-100 dark:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4 mt-2">
        {currentPage === 'home' && (
          <div className="space-y-4">
            {habits.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-6">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700/50">
                  <Zap className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">لیست خالی است</h3>
                <p className="text-slate-500 dark:text-slate-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
                  هیچ عادتی ثبت نشده است. اولین قدم را بردارید.
                </p>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-indigo-600 active:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-900/20 transition-transform active:scale-95"
                >
                  ایجاد عادت جدید
                </button>
              </div>
            ) : (
              habits.map(habit => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  onUpdate={updateHabit}
                  onDelete={deleteHabit}
                />
              ))
            )}
          </div>
        )}

        {currentPage === 'settings' && <SettingsPage theme={theme} setTheme={setTheme} />}
        {currentPage === 'guide' && <GuidePage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'feedback' && <FeedbackPage />}
        {currentPage === 'donate' && <DonatePage />}
      </main>

      {isAddModalOpen && (
        <AddHabitModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSave={addHabit} 
        />
      )}
    </div>
  );
};

// --- Page Components ---

const SplashScreen = () => (
  <div className="fixed inset-0 bg-[#0f172a] z-[100] flex flex-col items-center justify-center animate-out fade-out duration-500 delay-[2500ms]">
     <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
        {/* لوگوی اسپلش اسکرین: برای تغییر، آیکون Zap را با تگ img جایگزین کنید */}
        <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 relative z-10 animate-bounce-slow">
            <<img src="/logo.png" />
        </div>
     </div>
     <h1 className="text-2xl font-bold text-white mt-8 tracking-wider animate-pulse">عادت یار</h1>
  </div>
);

const MenuItem = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
      active 
      ? 'bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-500/10' 
      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
    }`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span>{label}</span>
  </button>
);

const SettingsPage = ({ theme, setTheme }: { theme: Theme, setTheme: (t: Theme) => void }) => (
  <div className="space-y-4">
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
      <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
         <Settings size={20} className="text-indigo-500" />
         ظاهر برنامه
      </h3>
      
      <div className="space-y-3">
         <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">انتخاب پوسته</p>
         <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                theme === 'light' 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
               <Sun size={18} />
               <span className="text-sm font-medium">روز (روشن)</span>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                theme === 'dark' 
                ? 'bg-indigo-900/30 border-indigo-500 text-indigo-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
               <Moon size={18} />
               <span className="text-sm font-medium">شب (تاریک)</span>
            </button>
         </div>
      </div>
    </div>
  </div>
);

// --- اصلاح متن راهنما ---
const GuidePage = () => (
  <div className="space-y-4 text-justify leading-relaxed">
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
       <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg">روش چله‌سازی</h3>
       <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
          این برنامه بر اساس روش‌های باستانی و روانشناسی مدرن برای تثبیت عادت در ۴۰ روز طراحی شده است.
       </p>
       <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 text-sm marker:text-indigo-500">
         <li><strong>لقمه چله:</strong> هدف اصلی که باید ۴۰ روز انجام دهید.</li>
         <li><strong>لقمه ویژه:</strong> کاری کوچکتر برای روزهایی که وقت کم است.</li>
         <li><strong>لقمه اضطراری:</strong> حداقلِ ممکن برای اینکه زنجیره قطع نشود.</li>
       </ul>
    </div>
  </div>
);

// --- اصلاح متن درباره ما ---
const AboutPage = () => (
  <div className="space-y-4">
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
       <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
         <Info size={32} className="text-indigo-500 dark:text-indigo-400" />
       </div>
       <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">عادت یار</h2>
       <p className="text-slate-600 dark:text-slate-400 text-sm leading-7">
         ما سعی داریم ابزاری ساده برای فارسی‌زبانان بسازیم تا در مسیر رشد شخصی همراهشان باشیم.
         <br/>
         نسخه ۱.۰.۰
       </p>
    </div>
  </div>
);

// --- اصلاح فرم بازخورد (اتصال به ایمیل) ---
const FeedbackPage = () => {
  const handleEmail = () => {
     // ایمیل خود را اینجا وارد کنید
     const email = "support@example.com";
     const subject = "نظر درباره اپلیکیشن چله یار";
     window.open(`mailto:${email}?subject=${subject}`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
        <MessageSquare size={48} className="mx-auto text-indigo-500 mb-4" />
        <h3 className="font-bold text-slate-900 dark:text-white mb-2">
          ارسال نظر
        </h3>
        <p className="text-slate-500 text-sm mb-6">
            بهترین راه برای ارتباط با ما ارسال ایمیل است. نظرات شما برای ما ارزشمند است.
        </p>
        <button onClick={handleEmail} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-colors">
            ارسال ایمیل
        </button>
      </div>
    </div>
  );
};

// --- اصلاح نمایش شماره کارت ---
const DonatePage = () => {
  const cardNumber = "6037997454433294"; // شماره کارت بدون فاصله

  const copyCardNumber = () => {
    navigator.clipboard.writeText(cardNumber);
    alert("شماره کارت کپی شد!");
  };

  return (
    <div className="space-y-4">
       <div className="bg-gradient-to-br from-indigo-800 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 text-center relative overflow-hidden shadow-lg">
          <Heart size={48} className="mx-auto mb-4 text-pink-500 fill-pink-500 animate-pulse" />
          <h2 className="text-xl font-bold text-white mb-4">حامی ما باشید</h2>
          <p className="text-slate-300 text-sm leading-7 mb-6">
            این برنامه رایگان است. حمایت شما دلگرمی ماست.
          </p>

          <div className="bg-black/30 p-4 rounded-xl border border-white/10 mb-2 backdrop-blur-sm">
             <div className="text-slate-400 text-xs mb-1">شماره کارت</div>
             {/* نمایش شماره کارت بدون فاصله اضافی و در جهت درست */}
             <div className="text-xl font-mono text-white tracking-widest font-bold dir-ltr mb-1 select-all">
                {cardNumber.match(/.{1,4}/g)?.join(' ')}
             </div>
             <div className="text-slate-400 text-sm">به نام احسان ساروی</div>
          </div>
          
          <button 
            onClick={copyCardNumber}
            className="flex items-center justify-center gap-2 text-indigo-300 text-sm hover:text-white transition-colors mx-auto py-2"
          >
            <Copy size={16} />
            <span>کپی شماره کارت</span>
          </button>
       </div>
    </div>
  );
};

// --- Habit Card Component (بدون تغییر عمده، فقط جهت اطمینان آورده شده) ---
const HabitCard: React.FC<{ 
  habit: Habit; 
  onUpdate: (h: Habit) => void; 
  onDelete: (id: string) => void; 
}> = ({ habit, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showNextStageModal, setShowNextStageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingStageIndex, setViewingStageIndex] = useState(habit.stages.length - 1);

  useEffect(() => {
    if (isExpanded) {
        setViewingStageIndex(habit.stages.length - 1);
    }
  }, [isExpanded, habit.stages.length]);

  const currentStageIndex = habit.stages.length - 1;
  const currentStage = habit.stages[currentStageIndex];
  const currentStageFirstEmpty = currentStage.days.findIndex(d => d === null);
  const currentStageCompleted = currentStageFirstEmpty === -1 ? 40 : currentStageFirstEmpty;
  const currentStageProgress = Math.round((currentStageCompleted / 40) * 100);

  const viewingStage = habit.stages[viewingStageIndex];
  const isViewingCurrentStage = viewingStageIndex === currentStageIndex;
  const isStageComplete = viewingStage.days.every(d => d !== null);

  const globalDaysPassed = getDaysPassed(habit.startDate);
  const currentGlobalDayIndex = Math.max(0, globalDaysPassed);

  let lastFilledGlobalIndex = -1;
  habit.stages.forEach((stage, sIdx) => {
    stage.days.forEach((day, dIdx) => {
        if (day !== null) {
            lastFilledGlobalIndex = (sIdx * 40) + dIdx;
        }
    });
  });

  const canEditDay = (stageIndex: number, dayIndex: number) => {
    const thisCellGlobalIndex = (stageIndex * 40) + dayIndex;
    if (thisCellGlobalIndex > currentGlobalDayIndex) return false;
    if (thisCellGlobalIndex < lastFilledGlobalIndex) return false;
    return true;
  };

  const handleDayClick = (index: number) => {
    if (canEditDay(viewingStageIndex, index)) {
      setSelectedDay(index);
    }
  };

  const handleSetStatus = (status: DayStatus) => {
    if (selectedDay === null) return;
    const newStages = [...habit.stages];
    const updatedDays = [...viewingStage.days];
    updatedDays[selectedDay] = status;
    newStages[viewingStageIndex] = { ...viewingStage, days: updatedDays };
    onUpdate({ ...habit, stages: newStages });
    setSelectedDay(null);
  };

  const handleDefeat = () => {
    const originalFirstStage = habit.stages[0];
    const resetStage: Stage = { ...originalFirstStage, days: Array(40).fill(null) };
    onUpdate({ ...habit, startDate: Date.now(), stages: [resetStage] });
    setShowResetConfirm(false);
    setViewingStageIndex(0);
    setIsExpanded(true);
  };

  const handleAddNextStage = (chelehBite: string, specialBite: string, emergencyBite?: string) => {
    const newStage: Stage = {
      id: Date.now().toString(),
      chelehBite,
      specialBite,
      emergencyBite,
      days: Array(40).fill(null)
    };
    onUpdate({ ...habit, stages: [...habit.stages, newStage] });
    setShowNextStageModal(false);
  };

  const handleEditSave = (t: string, i: string, f: string, c: string, s: string, e?: string) => {
      const newStages = [...habit.stages];
      newStages[viewingStageIndex] = { ...viewingStage, chelehBite: c, specialBite: s, emergencyBite: e };
      onUpdate({ ...habit, title: t, initialBite: i, finalBite: f, stages: newStages });
      setShowEditModal(false);
  };

  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm dark:shadow-black/20 overflow-hidden relative mb-4 border border-slate-200 dark:border-slate-700/30 transition-colors duration-300">
      <div 
        className="bg-slate-50/50 dark:bg-slate-800/40 p-4 relative cursor-pointer active:bg-slate-100 dark:active:bg-slate-800/60 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-stretch">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors ${currentStage.days.every(d => d !== null) ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'}`}>
                    {currentStage.days.every(d => d !== null) ? <Check size={20} strokeWidth={3} /> : <Zap size={20} fill="currentColor" />}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{habit.title}</h3>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mt-1">
                       <span className="bg-slate-200 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">چله {habit.stages.length}</span>
                       <span className="w-1 h-1 bg-slate-400 dark:bg-slate-600 rounded-full"></span>
                       <span>{currentStageCompleted} / 40</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 pl-1">
                <div className="flex flex-col items-end justify-center gap-1.5 border-l border-slate-200 dark:border-slate-700/50 pl-3 ml-1">
                   <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">لقمه کامل</span>
                      <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">{currentStage.chelehBite}</div>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">لقمه ویژه</span>
                      <div className="text-[10px] font-bold text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-500/10 px-1.5 py-0.5 rounded">{currentStage.specialBite}</div>
                   </div>
                </div>
                <div className="text-slate-400 dark:text-slate-500">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>
        </div>

        {!isExpanded && (
            <div className="mt-3 h-1 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${currentStageProgress}%` }} />
            </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-700/30 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/30">
                <div className="flex items-center gap-2">
                    <button disabled={viewingStageIndex === 0} onClick={(e) => { e.stopPropagation(); setViewingStageIndex(prev => prev - 1); }} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"><ArrowRight size={16} /></button>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-16 text-center">چله {viewingStageIndex + 1}</span>
                    <button disabled={viewingStageIndex === habit.stages.length - 1} onClick={(e) => { e.stopPropagation(); setViewingStageIndex(prev => prev + 1); }} className="p-1.5 rounded-lg text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"><ArrowLeft size={16} /></button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"><MoreVertical size={16} /></button>
                </div>
            </div>

            {isMenuOpen && (
                 <div className="absolute top-28 left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl z-20 w-40 py-1 animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={() => { setShowEditModal(true); setIsMenuOpen(false); }} className="w-full text-right px-4 py-2.5 text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2"><Edit2 size={14} /><span>ویرایش</span></button>
                    <button onClick={() => { setShowResetConfirm(true); setIsMenuOpen(false); }} className="w-full text-right px-4 py-2.5 text-red-500 dark:text-red-400 text-xs hover:bg-red-50 dark:hover:bg-slate-700/50 flex items-center gap-2"><RefreshCw size={14} /><span>اعلام شکست</span></button>
                    <button onClick={() => { onDelete(habit.id); setIsMenuOpen(false); }} className="w-full text-right px-4 py-2.5 text-slate-500 dark:text-slate-400 text-xs hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700/50"><Trash2 size={14} /><span>حذف عادت</span></button>
                 </div>
            )}

            <div className="p-3 bg-white dark:bg-[#1e293b]">
                <div className="grid grid-cols-8 gap-1.5 direction-rtl" dir="rtl">
                    {viewingStage.days.map((status, index) => {
                        const dayNum = index + 1;
                        const globalIndex = (viewingStageIndex * 40) + index;
                        const isFilled = status !== null;
                        const isToday = globalIndex === currentGlobalDayIndex;
                        const isPast = globalIndex < currentGlobalDayIndex;
                        const editable = canEditDay(viewingStageIndex, index);
                        const isMissed = isPast && !isFilled;

                        let bgClass = 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/20 text-slate-400 dark:text-slate-600';
                        if (isFilled) bgClass = getStatusColor(status);
                        else if (isMissed) bgClass = 'bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20 text-red-300 dark:text-red-500/50';
                        else if (isToday) bgClass = 'bg-indigo-50 dark:bg-slate-700/50 border-indigo-200 dark:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]';

                        return (
                            <button key={index} disabled={!editable} onClick={() => handleDayClick(index)} className={`aspect-square rounded-md relative flex flex-col items-center justify-center transition-all duration-100 border ${bgClass} ${!editable && !isFilled && !isMissed ? 'opacity-30 cursor-not-allowed' : ''} ${editable ? 'active:scale-90 hover:border-slate-300 dark:hover:border-slate-500/50' : ''}`}>
                                <span className="text-[9px] font-bold mb-0.5 leading-none">{dayNum}</span>
                                {status === 'standard' && <Check size={12} className="text-emerald-700 dark:text-white stroke-[3]" />}
                                {status === 'special' && <Circle size={10} className="text-yellow-700 dark:text-white" strokeWidth={2.5} />}
                                {status === 'emergency' && <X size={12} className="text-red-700 dark:text-white stroke-[3]" />}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            {isStageComplete && isViewingCurrentStage && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border-t border-indigo-100 dark:border-indigo-500/10">
                    <button onClick={() => setShowNextStageModal(true)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition-colors"><span>شروع چله بعدی</span><ArrowRight size={16} className="rotate-180" /></button>
                </div>
            )}
        </div>
      )}

      {selectedDay !== null && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDay(null)} />
              <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-t-[30px] p-6 relative z-10 pb-10 animate-in slide-in-from-bottom duration-300">
                  <div className="w-12 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-6" />
                  <h3 className="text-center text-slate-800 dark:text-slate-300 font-bold mb-8 text-lg">وضعیت روز {selectedDay + 1}</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                      <button onClick={() => handleSetStatus('special')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400 active:bg-yellow-100 dark:active:bg-yellow-500/20 transition-colors">
                          <div className="w-12 h-12 rounded-full bg-yellow-400 dark:bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-900/20 dark:shadow-yellow-900/40"><Circle size={20} className="text-white" strokeWidth={2.5} /></div><span className="text-xs font-bold">لقمه ویژه</span>
                      </button>
                      <button onClick={() => handleSetStatus('standard')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 active:bg-emerald-100 dark:active:bg-emerald-500/20 transition-colors scale-110 origin-bottom">
                          <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/20 dark:shadow-emerald-900/40"><Check size={28} className="text-white stroke-[3]" /></div><span className="text-xs font-bold">انجام شد</span>
                      </button>
                      {viewingStage.emergencyBite ? (
                          <button onClick={() => handleSetStatus('emergency')} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 active:bg-red-100 dark:active:bg-red-500/20 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-900/20 dark:shadow-red-900/40"><X size={24} className="text-white stroke-[3]" /></div><span className="text-xs font-bold">لقمه اضطراری</span>
                          </button>
                      ) : (
                          <div className="opacity-20 grayscale flex flex-col items-center gap-3 p-4"><div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center"><X size={24} className="text-slate-500 dark:text-white" /></div><span className="text-xs font-bold">---</span></div>
                      )}
                  </div>
                   <button onClick={() => handleSetStatus(null)} className="w-full mt-4 py-3 text-slate-500 text-sm font-medium active:text-slate-800 dark:active:text-slate-300">پاک کردن وضعیت</button>
              </div>
          </div>
      )}

      {showResetConfirm && (
         <ModalWrapper onClose={() => setShowResetConfirm(false)}>
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertCircle size={32} /></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">اعلام شکست؟</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">آیا مطمئن هستید؟ با تایید این گزینه، تمام پیشرفت‌ها پاک شده و به روز اول باز می‌گردید.</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-sm">انصراف</button>
                    <button onClick={handleDefeat} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-900/30">بله، از اول</button>
                </div>
            </div>
         </ModalWrapper>
      )}

      {showNextStageModal && <AddStageModal onClose={() => setShowNextStageModal(false)} onSave={handleAddNextStage} stageNumber={habit.stages.length + 1} />}

      {showEditModal && <EditHabitModal onClose={() => setShowEditModal(false)} onSave={handleEditSave} initialData={{ title: habit.title, initialBite: habit.initialBite, finalBite: habit.finalBite, chelehBite: viewingStage.chelehBite, specialBite: viewingStage.specialBite, emergencyBite: viewingStage.emergencyBite }} isFirstStage={viewingStageIndex === 0} stageNumber={viewingStageIndex + 1} />}
    </div>
  );
};

const getStatusColor = (status: DayStatus) => {
  switch (status) {
    case 'standard': return 'bg-emerald-200 dark:bg-emerald-500 border-emerald-300 dark:border-emerald-400 shadow-sm dark:shadow-lg shadow-emerald-900/40 text-emerald-800 dark:text-emerald-950';
    case 'special': return 'bg-yellow-200 dark:bg-yellow-500 border-yellow-300 dark:border-yellow-400 shadow-sm dark:shadow-lg shadow-yellow-900/40 text-yellow-800 dark:text-yellow-950';
    case 'emergency': return 'bg-red-200 dark:bg-red-500 border-red-300 dark:border-red-400 shadow-sm dark:shadow-lg shadow-red-900/40 text-red-800 dark:text-red-950';
    default: return 'bg-slate-100 dark:bg-slate-800';
  }
};

const ModalWrapper: React.FC<{ children?: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="fixed inset-0" onClick={onClose} />
    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 z-10">{children}</div>
  </div>
);

const AddHabitModal: React.FC<{ onClose: () => void; onSave: (h: Habit) => void }> = ({ onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [initialBite, setInitialBite] = useState('');
  const [finalBite, setFinalBite] = useState('');
  const [chelehBite, setChelehBite] = useState('');
  const [specialBite, setSpecialBite] = useState('');
  const [emergencyBite, setEmergencyBite] = useState('');

  const handleSave = () => {
    if (!title || !initialBite || !finalBite || !chelehBite || !specialBite) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      title, initialBite, finalBite, startDate: Date.now(),
      stages: [{ id: 'stage-1', chelehBite, specialBite, emergencyBite: emergencyBite.trim() || undefined, days: Array(40).fill(null) }]
    };
    onSave(newHabit);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{step === 1 ? 'تعریف عادت جدید' : 'تعریف چله اول'}</h3>
        <button onClick={onClose} className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>
      </div>
      {step === 1 ? (
          <div className="space-y-4">
             <Input label="نام عادت" value={title} onChange={setTitle} placeholder="مثلا: مطالعه کتاب" />
             <Input label="لقمه کوچک (شروع)" value={initialBite} onChange={setInitialBite} placeholder="مثلا: ۵ دقیقه" />
             <Input label="لقمه نهایی (هدف)" value={finalBite} onChange={setFinalBite} placeholder="مثلا: ۶۰ دقیقه" />
             <button disabled={!title || !initialBite || !finalBite} onClick={() => setStep(2)} className="w-full mt-6 py-3 bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20">مرحله بعد</button>
          </div>
      ) : (
          <div className="space-y-4">
              <Input label="لقمه چله" value={chelehBite} onChange={setChelehBite} placeholder="مثلا: ۵ دقیقه" />
              <Input label="لقمه ویژه" value={specialBite} onChange={setSpecialBite} placeholder="مثلا: ۲ دقیقه" />
              <Input label="لقمه اضطراری" value={emergencyBite} onChange={setEmergencyBite} placeholder="مثلا: ۱ دقیقه" />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold">بازگشت</button>
                <button disabled={!chelehBite || !specialBite} onClick={handleSave} className="flex-1 py-3 bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20">ساخت عادت</button>
              </div>
          </div>
      )}
    </ModalWrapper>
  );
};

const AddStageModal: React.FC<{ onClose: () => void; onSave: (c: string, s: string, e?: string) => void; stageNumber: number }> = ({ onClose, onSave, stageNumber }) => {
    const [chelehBite, setChelehBite] = useState('');
    const [specialBite, setSpecialBite] = useState('');
    const [emergencyBite, setEmergencyBite] = useState('');
    return (
        <ModalWrapper onClose={onClose}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-slate-900 dark:text-white text-center flex-1">شروع چله {stageNumber}</h3><button onClick={onClose} className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white p-1"><X size={20} /></button></div>
            <div className="space-y-4">
                <Input label="لقمه چله" value={chelehBite} onChange={setChelehBite} placeholder="هدف جدید" />
                <Input label="لقمه ویژه" value={specialBite} onChange={setSpecialBite} placeholder="مقدار ویژه" />
                <Input label="لقمه اضطراری" value={emergencyBite} onChange={setEmergencyBite} placeholder="حداقل مقدار" />
                <button disabled={!chelehBite || !specialBite} onClick={() => onSave(chelehBite, specialBite, emergencyBite.trim() || undefined)} className="w-full mt-6 py-3 bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20">شروع ۴۰ روز جدید</button>
            </div>
        </ModalWrapper>
    );
};

const EditHabitModal: React.FC<{ onClose: () => void; onSave: (t: string, i: string, f: string, c: string, s: string, e?: string) => void; initialData: any; isFirstStage: boolean; stageNumber: number }> = ({ onClose, onSave, initialData, stageNumber }) => {
    const [title, setTitle] = useState(initialData.title);
    const [initialBite, setInitialBite] = useState(initialData.initialBite);
    const [finalBite, setFinalBite] = useState(initialData.finalBite);
    const [chelehBite, setChelehBite] = useState(initialData.chelehBite);
    const [specialBite, setSpecialBite] = useState(initialData.specialBite);
    const [emergencyBite, setEmergencyBite] = useState(initialData.emergencyBite || '');

    return (
        <ModalWrapper onClose={onClose}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-slate-900 dark:text-white">ویرایش عادت و چله {stageNumber}</h3><button onClick={onClose} className="text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button></div>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-4 space-y-4">
                    <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">مشخصات کلی عادت</h4>
                    <Input label="نام عادت" value={title} onChange={setTitle} />
                    <div className="grid grid-cols-2 gap-3"><Input label="لقمه کوچک" value={initialBite} onChange={setInitialBite} /><Input label="لقمه نهایی" value={finalBite} onChange={setFinalBite} /></div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">مشخصات چله جاری ({stageNumber})</h4>
                    <Input label="لقمه چله" value={chelehBite} onChange={setChelehBite} />
                    <div className="grid grid-cols-2 gap-3"><Input label="لقمه ویژه" value={specialBite} onChange={setSpecialBite} /><Input label="لقمه اضطراری" value={emergencyBite} onChange={setEmergencyBite} /></div>
                </div>
            </div>
            <button onClick={() => onSave(title, initialBite, finalBite, chelehBite, specialBite, emergencyBite.trim() || undefined)} className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20">ذخیره تغییرات</button>
        </ModalWrapper>
    );
};

const Input = ({ label, value, onChange, placeholder }: any) => (
  <div>
    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 mr-1">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
  </div>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
