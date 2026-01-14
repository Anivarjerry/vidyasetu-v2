
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardData, LoginRequest, Role, PeriodData, ParentHomework, SchoolSummary, SchoolUser } from '../types';
import { fetchDashboardData, submitPeriodData, updateParentHomeworkStatus, getISTDate, updateVehicleLocation, fetchSchoolSummary, fetchSchoolUserList } from '../services/dashboardService';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { SkeletonSchoolCard } from './Skeletons';
import { ProfileView } from './ProfileView';
import { SchoolInfoCard } from './SchoolInfoCard';
import { PeriodModal } from './PeriodModal';
import { AttendanceModal } from './AttendanceModal';
import { AttendanceHistoryModal } from './AttendanceHistoryModal';
import { ParentHomeworkModal } from './ParentHomeworkModal';
import { HomeworkListModal } from './HomeworkListModal';
import { SettingsModal, AboutModal, HelpModal } from './MenuModals';
import { NoticeModal } from './NoticeModal';
import { NoticeListModal } from './NoticeListModal';
import { AnalyticsModal } from './AnalyticsModal';
import { HomeworkAnalyticsModal } from './HomeworkAnalyticsModal';
import { TransportTrackerModal } from './TransportTrackerModal';
import { LeaveRequestModal, StaffLeaveManagementModal, StudentLeaveRequestModal } from './LeaveModals';
import { TeacherHistoryModal } from './TeacherHistoryModal';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { ChevronRight, CheckCircle2, RefreshCw, UserCheck, Bell, BarChart2, BookOpen, MapPin, Truck, CalendarRange, Play, Square, Loader2, Megaphone, GraduationCap, School as SchoolIcon, Sparkles, User, Smartphone, ChevronLeft, History, Lock, AlertCircle, Zap, ShieldCheck, MoreHorizontal, Bot, X, LayoutGrid } from 'lucide-react';
import { SubscriptionModal } from './SubscriptionModal';
import { Modal } from './Modal';
import { AIChatModal } from './AIChatModal';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface DashboardProps {
  credentials: LoginRequest;
  role: Role;
  userName?: string;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ credentials, role, userName, onLogout }) => {
  const { t } = useThemeLanguage();
  
  const [currentView, setCurrentView] = useState<'home' | 'profile'>(() => {
    return (window.history.state?.view === 'profile') ? 'profile' : 'home';
  });

  // --- NAVIGATION STACKS ---
  const [principalStack, setPrincipalStack] = useState<string[]>([]);
  const [teacherStack, setTeacherStack] = useState<string[]>([]);
  const [parentStack, setParentStack] = useState<string[]>([]); 

  // Back Handler for All Navigation Stacks
  useModalBackHandler(
      (role === 'principal' && principalStack.length > 0) || 
      (role === 'teacher' && teacherStack.length > 0) ||
      ((role === 'parent' || role === 'student') && parentStack.length > 0), 
      () => {
          if (role === 'principal') setPrincipalStack(prev => prev.slice(0, -1));
          if (role === 'teacher') setTeacherStack(prev => prev.slice(0, -1));
          if (role === 'parent' || role === 'student') setParentStack(prev => prev.slice(0, -1));
      }
  );

  const [data, setData] = useState<DashboardData | null>(null);
  const [isSchoolActive, setIsSchoolActive] = useState(true);
  const [isUserActive, setIsUserActive] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showLockPopup, setShowLockPopup] = useState<string | null>(null);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // States managed by stack keys
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [selectedHomework, setSelectedHomework] = useState<ParentHomework | null>(null);
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeMenuModal, setActiveMenuModal] = useState<'settings' | 'about' | 'help' | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isNoticeListOpen, setIsNoticeListOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Driver GPS States
  const [isTripActive, setIsTripActive] = useState(false);
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  const watchId = useRef<number | null>(null);
  const wakeLock = useRef<any>(null);
  const lastUpdateTimestamp = useRef<number>(0);
  
  // Principal Summary States
  const [isSchoolDetailOpen, setIsSchoolDetailOpen] = useState(false);
  const [schoolSummary, setSchoolSummary] = useState<SchoolSummary | null>(null);
  const [loadingSchoolSummary, setLoadingSchoolSummary] = useState(false);
  const [schoolSummaryRefreshing, setSchoolSummaryRefreshing] = useState(false);
  const [listCategory, setListCategory] = useState<'teachers' | 'students' | 'drivers' | null>(null);
  const [categoryUserList, setCategoryUserList] = useState<SchoolUser[]>([]);
  const [loadingUserList, setLoadingUserList] = useState(false);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) setCurrentView(e.state.view);
      else setCurrentView('home');
    };
    if (!window.history.state) {
      try { window.history.replaceState({ view: 'home' }, '', window.location.href); } catch (e) {}
    }
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      if (wakeLock.current) { try { wakeLock.current.release(); } catch(e) {} }
    };
  }, []);

  const handleViewChange = (view: 'home' | 'profile') => {
    if (view === currentView) return;
    
    // RESET ALL STACKS when switching view
    setPrincipalStack([]);
    setTeacherStack([]);
    setParentStack([]);

    if (view === 'home') {
      if (window.history.state?.view === 'profile') window.history.back();
      else setCurrentView('home');
    } else {
      try { window.history.pushState({ view: 'profile' }, '', window.location.href); } catch (e) {}
      setCurrentView('profile');
    }
  };

  const fetchGenericData = useCallback(async (targetStudent?: string) => {
     try {
        const dashboardData = await fetchDashboardData(credentials.school_id, credentials.mobile, role, credentials.password, targetStudent);
        if (dashboardData) {
            setData(dashboardData);
            setIsSchoolActive(dashboardData.school_subscription_status === 'active');
            setIsUserActive(dashboardData.subscription_status === 'active');
            if (dashboardData.student_id && !targetStudent) setSelectedStudentId(dashboardData.student_id);
            localStorage.setItem('vidyasetu_dashboard_data', JSON.stringify(dashboardData));
            setTimeout(() => setInitialLoading(false), 300);
        }
     } catch (e) {}
  }, [credentials, role]);

  useEffect(() => {
    fetchGenericData(selectedStudentId || undefined);
  }, [fetchGenericData]);

  const handleManualRefresh = async () => {
    if (!isSchoolActive) return;
    setIsRefreshing(true);
    await fetchGenericData(selectedStudentId || undefined);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const handleStudentSwitch = (sId: string) => {
      if (sId === selectedStudentId) return;
      setSelectedStudentId(sId);
      setIsRefreshing(true); 
      fetchGenericData(sId).then(() => setIsRefreshing(false));
  };

  // GPS Trip Logic
  const handleStartTrip = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    if (!navigator.geolocation) { alert("GPS not supported."); return; }
    navigator.geolocation.getCurrentPosition(async (initialPos) => {
        setIsTripActive(true);
        if ('wakeLock' in navigator) { try { wakeLock.current = await (navigator as any).wakeLock.request('screen'); } catch (wlErr) {} }
        if (data?.user_id) {
          setIsSendingLocation(true);
          await updateVehicleLocation(data.user_id, initialPos.coords.latitude, initialPos.coords.longitude);
          lastUpdateTimestamp.current = Date.now();
          setTimeout(() => setIsSendingLocation(false), 2500);
        }
        watchId.current = navigator.geolocation.watchPosition(async (pos) => {
            const now = Date.now();
            if (data?.user_id && (now - lastUpdateTimestamp.current >= 60000)) {
              setIsSendingLocation(true);
              const ok = await updateVehicleLocation(data.user_id, pos.coords.latitude, pos.coords.longitude);
              if (ok) lastUpdateTimestamp.current = now;
              setTimeout(() => setIsSendingLocation(false), 2500);
            }
          }, (err) => console.error("GPS error", err), { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
      }, (err) => { alert("GPS Permission Denied."); }, { enableHighAccuracy: true });
  };

  const handleStopTrip = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    setIsTripActive(false); setIsSendingLocation(false); lastUpdateTimestamp.current = 0;
    if (watchId.current !== null) { navigator.geolocation.clearWatch(watchId.current); watchId.current = null; }
    if (wakeLock.current) { wakeLock.current.release().catch(() => {}); wakeLock.current = null; }
  };

  const showLockedFeature = (type: 'school' | 'parent') => {
      setShowLockPopup(type === 'school' ? t('school_plan_inactive_teacher') : t('parent_plan_required'));
  };

  const handleOpenAIChat = () => {
      const isStaff = role === 'principal' || role === 'teacher' || role === 'driver' || role === 'admin';
      if (isStaff) {
          if (isSchoolActive) setIsAIChatOpen(true);
          else showLockedFeature('school');
      } else {
          // Parent or Student
          if (isSchoolActive && isUserActive) setIsAIChatOpen(true);
          else if (!isSchoolActive) showLockedFeature('school');
          else showLockedFeature('parent');
      }
  };

  const handleSchoolCardClick = async () => {
    if (!data?.school_db_id) return;
    setIsSchoolDetailOpen(true);
    setListCategory(null);
    const summary = await fetchSchoolSummary(data.school_db_id);
    if (summary) setSchoolSummary(summary);
  };

  const handleSyncSchoolSummary = async () => {
      if (!data?.school_db_id) return;
      setSchoolSummaryRefreshing(true);
      const summary = await fetchSchoolSummary(data.school_db_id);
      if (summary) setSchoolSummary(summary);
      setSchoolSummaryRefreshing(false);
  };

  const handleCategoryClick = async (category: 'teachers' | 'students' | 'drivers') => {
    if (!data?.school_db_id) return;
    setListCategory(category);
    setLoadingUserList(true);
    const users = await fetchSchoolUserList(data.school_db_id, category);
    setCategoryUserList(users);
    setLoadingUserList(false);
  };

  const handlePeriodSubmit = async (pData: PeriodData) => {
    if (!data) return;
    const success = await submitPeriodData(credentials.school_id, credentials.mobile, pData, data.user_name, 'submit');
    if (success) { 
        setTeacherStack(prev => prev.filter(k => k !== 'edit_period')); 
        handleManualRefresh(); 
    } else alert("Submission Failed!");
  };

  const getPeriodsArray = () => {
      const count = data?.total_periods || 8;
      return Array.from({ length: count }, (_, i) => i + 1);
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-[#F8FAFC] dark:bg-dark-950 flex flex-col overflow-hidden transition-colors">
      <Header onRefresh={handleManualRefresh} onOpenSettings={() => setActiveMenuModal('settings')} onOpenAbout={() => setActiveMenuModal('about')} onOpenHelp={() => setActiveMenuModal('help')} onOpenNotices={() => setIsNoticeListOpen(true)} onLogout={onLogout} />

      {/* Main Container - Pushed down by Header height and up by BottomNav height including safe areas */}
      <main className="flex-1 w-full flex flex-col overflow-hidden relative" style={{ marginTop: 'calc(5.5rem + env(safe-area-inset-top, 0px))', marginBottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))' }}>
        {currentView === 'home' ? (
            <>
                <div className="w-full px-4 pt-3 pb-0.5 z-[40] flex-shrink-0">
                    <div className="max-w-4xl mx-auto w-full">
                        {initialLoading && !data ? <SkeletonSchoolCard /> : <SchoolInfoCard schoolName={data?.school_name || ''} schoolCode={data?.school_code || ''} onClick={handleSchoolCardClick} />}
                        
                        <div className="flex items-center justify-between mt-1 mb-2.5 px-1.5">
                             <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                {role === 'parent' || role === 'student' ? t('student_hub') : role === 'teacher' ? t('todays_schedule') : role === 'driver' ? t('bus_route_tracker') : t('principal_portal')}
                             </h3>
                             <div className="flex items-center gap-2">
                                {(role === 'parent' && data?.siblings && data.siblings.length > 1) && (
                                    <div className="flex gap-1.5">
                                        {data.siblings.map(sib => (
                                            <button key={sib.id} onClick={() => handleStudentSwitch(sib.id)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border ${selectedStudentId === sib.id ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'}`}>{sib.name.split(' ')[0]}</button>
                                        ))}
                                    </div>
                                )}
                                <button onClick={handleManualRefresh} disabled={isRefreshing || !isSchoolActive} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black transition-all border ${!isSchoolActive ? 'bg-rose-50 dark:bg-rose-900/10 text-rose-500 border-rose-100 dark:border-rose-800' : 'bg-brand-500/10 dark:bg-slate-800/40 text-brand-500 border-brand-500/10 active:scale-90 shadow-sm'}`}><RefreshCw size={10} className={isRefreshing ? "animate-spin" : ""} />{isSchoolActive ? t('sync') : 'LOCKED'}</button>
                             </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto w-full px-4 pb-4 no-scrollbar">
                    <div className="max-w-4xl mx-auto w-full">
                         <div className={`space-y-3 w-full transition-opacity duration-300 pb-10 ${isRefreshing ? 'opacity-40' : 'opacity-100'}`}>
                            
                            {/* PRINCIPAL HUB */}
                            {role === 'principal' && (
                              <div className="grid grid-cols-1 gap-3 w-full">
                                {[
                                    { key: "notice", title: t('publish_notice'), subtitle: 'Global Academic Broadcast', icon: <Megaphone size={24} /> },
                                    { key: "transport", title: t('transport_tracking'), subtitle: 'Live Vehicle Map Engine', icon: <MapPin size={24} /> },
                                    { key: "teacher_analytics", title: t('teacher_report'), subtitle: 'Staff Efficiency Monitor', icon: <BarChart2 size={24} /> },
                                    { key: "parents_analytics", title: t('homework_status'), subtitle: 'Student Task Compliance', icon: <BookOpen size={24} /> },
                                    { key: "leave_management", title: t('leave_portal'), subtitle: 'Administrative Leave Hub', icon: <CalendarRange size={24} /> },
                                    { key: "attendance", title: t('global_attendance'), subtitle: 'Central Attendance Registry', icon: <UserCheck size={24} /> }
                                ].map((item, index) => (
                                  <div key={index} onClick={() => isSchoolActive ? setPrincipalStack(prev => [...prev, item.key]) : setShowPayModal(true)} className={`glass-card p-5 rounded-[2.5rem] flex items-center justify-between cursor-pointer group active:scale-[0.98] transition-all shadow-sm ${!isSchoolActive ? 'bg-rose-50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/20' : ''}`}><div className="flex items-center gap-4 text-left"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-all group-hover:scale-105 ${!isSchoolActive ? 'bg-rose-500 text-white' : 'bg-brand-500/10 text-brand-600'}`}>{item.icon}</div><div><h3 className={`font-black uppercase text-base leading-tight ${!isSchoolActive ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>{item.title}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.subtitle}</p></div></div>{!isSchoolActive ? <Lock size={20} className="text-rose-400" /> : <ChevronRight size={22} className="text-slate-200 group-hover:text-brand-500 transition-colors" />}</div>
                                ))}
                              </div>
                            )}

                            {/* TEACHER HUB */}
                            {role === 'teacher' && (
                               <div className="space-y-3">
                                  {[
                                      { key: 'attendance', icon: <UserCheck size={28} />, title: t('attendance'), sub: t('digital_register') },
                                      { key: 'leave', icon: <CalendarRange size={28} />, title: t('staff_leave'), sub: t('apply_absence') },
                                      { key: 'history', icon: <History size={28} />, title: "Previous History", sub: "Cloud Submission Log" },
                                      { key: 'homework', icon: <BookOpen size={28} />, title: "Submit Homework", sub: `${data?.total_periods || 8} Daily Learning Periods`, border: "border-l-4 border-brand-500" }
                                  ].map((it, idx) => (
                                      <div key={idx} onClick={() => isSchoolActive ? setTeacherStack(prev => [...prev, it.key]) : showLockedFeature('school')} className={`glass-card p-5 rounded-[2.5rem] flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all shadow-sm ${it.border || ''} ${!isSchoolActive ? 'bg-rose-50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/20' : ''}`}><div className="flex items-center gap-4"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${!isSchoolActive ? 'bg-rose-500 text-white' : 'bg-brand-500/10 text-brand-600'}`}>{it.icon}</div><div className="text-left"><h3 className={`font-black uppercase text-base leading-tight ${!isSchoolActive ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>{it.title}</h3><p className="text-[10px] font-black text-slate-400 font-black uppercase tracking-widest">{it.sub}</p></div></div>{!isSchoolActive ? <Lock size={20} className="text-rose-400" /> : <ChevronRight size={22} className="text-slate-200" />}</div>
                                  ))}
                               </div>
                            )}

                            {/* DRIVER HUB */}
                            {role === 'driver' && (
                                <div className="space-y-4">
                                    <div className={`relative w-full rounded-[2.8rem] overflow-hidden shadow-xl ${!isSchoolActive ? 'bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-100 dark:border-rose-900/30' : isTripActive ? 'bg-brand-600' : 'bg-brand-500/10 dark:bg-brand-500/5 border border-brand-500/10 dark:border-white/5'}`}><div className={`transition-all duration-500 p-7 sm:p-8 ${isTripActive ? 'space-y-10' : 'space-y-0'}`}><div className="flex items-center justify-between w-full"><div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0"><div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-[1.8rem] flex items-center justify-center shadow-xl relative shrink-0 ${!isSchoolActive ? 'bg-rose-500 text-white' : isTripActive ? 'bg-white text-brand-600' : 'bg-brand-500 text-white'}`}>{isTripActive ? (<div className="relative flex items-center justify-center"><div className="absolute inset-[-4px] border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div><Truck size={32} strokeWidth={2.5} /></div>) : (<Play size={36} fill="currentColor" strokeWidth={0} className={!isSchoolActive ? 'text-white' : ''} />)}</div><div className="space-y-0.5 truncate text-left"><h3 className={`font-black uppercase text-base sm:text-xl tracking-tight leading-tight ${!isSchoolActive ? 'text-rose-600' : isTripActive ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{isTripActive ? 'LIVE TRACKING ON' : 'START SCHOOL TRIP'}</h3><p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-80 truncate ${!isSchoolActive ? 'text-rose-400' : isTripActive ? 'text-brand-50' : 'text-slate-400'}`}>{isTripActive ? (isSendingLocation ? 'TRANSMITTING...' : 'BROADCASTING LOCATION') : 'System Check Ready'}</p></div></div><button onClick={isTripActive ? handleStopTrip : handleStartTrip} disabled={!isSchoolActive} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 shrink-0 z-[100] relative cursor-pointer ${!isSchoolActive ? 'bg-rose-100 text-rose-400 opacity-50' : isTripActive ? 'bg-white text-rose-600' : 'bg-brand-600 text-white border-4 border-brand-500/20'}`}>{isTripActive ? <Square size={20} fill="currentColor" className="text-rose-600" /> : <ChevronRight size={28} strokeWidth={3.5} />}</button></div>{isTripActive && (<div className="pt-6 border-t border-white/10 flex items-center justify-between premium-subview-enter"><div className="flex items-center gap-2.5"><div className={`w-2.5 h-2.5 rounded-full ${isSendingLocation ? 'bg-emerald-400 scale-125 shadow-[0_0_10px_rgba(52,211,153,1)]' : 'bg-white animate-pulse'}`}></div><span className={`text-[10px] font-black uppercase tracking-widest text-white/80`}>{isSendingLocation ? 'SATELLITE SYNC ACTIVE' : 'AUTO-SYNC EVERY 1 MINUTE'}</span></div><div className="opacity-40 text-white"><MoreHorizontal size={24} /></div></div>)}</div></div>
                                    <div onClick={() => isSchoolActive ? setIsLeaveModalOpen(true) : showLockedFeature('school')} className={`glass-card p-5 rounded-[2.5rem] flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm border-slate-100 dark:border-white/5 ${!isSchoolActive ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' : ''}`}><div className="flex items-center gap-4"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${!isSchoolActive ? 'bg-rose-500 text-white' : 'bg-brand-500/10 text-brand-600'}`}><CalendarRange size={28} /></div><div className="text-left"><h3 className={`font-black uppercase text-base leading-tight ${!isSchoolActive ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>{t('apply_leave')}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Staff Request Portal</p></div></div>{!isSchoolActive ? <Lock size={20} className="text-rose-400" /> : <ChevronRight size={22} className="text-slate-200" />}</div>
                                </div>
                            )}

                            {/* STUDENT / PARENT HUB */}
                            {(role === 'parent' || role === 'student') && (
                              data?.student_id ? (
                                <div className="space-y-3">
                                  <div onClick={() => isSchoolActive ? setParentStack(prev => [...prev, 'attendance_history']) : showLockedFeature('school')} className={`glass-card p-5 rounded-[2.5rem] flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm ${!isSchoolActive ? 'bg-rose-50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/20' : ''}`}>
                                    <div className="flex items-center gap-4">
                                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${!isSchoolActive ? 'bg-rose-500 text-white' : 'bg-brand-500/10 text-brand-600'}`}><UserCheck size={28} /></div>
                                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('attendance_status')}</p><h4 className={`text-base font-black uppercase leading-tight ${!isSchoolActive ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>{t('current')}: <span className={data?.today_attendance === 'present' ? 'text-emerald-500' : data?.today_attendance === 'absent' ? 'text-rose-500' : 'text-brand-500'}>{data?.today_attendance ? t(data.today_attendance) : t('waiting')}</span></h4></div>
                                    </div>
                                    {!isSchoolActive ? <Lock size={18} className="text-rose-400" /> : <ChevronRight size={20} className="text-slate-300" />}
                                  </div>

                                  {[
                                      { key: 'apply_leave', icon: <CalendarRange size={28} />, title: t('apply_leave'), sub: 'Absence Request Portal' },
                                      { key: 'live_transport', icon: <Truck size={28} />, title: t('live_transport'), sub: 'Real-time Route Monitor' },
                                      { key: 'daily_tasks', icon: <BookOpen size={28} />, title: t('daily_tasks'), sub: 'Check Current Assignments' }
                                  ].map((it, idx) => {
                                      const isLocked = !isSchoolActive || !isUserActive;
                                      return (
                                          <div key={idx} onClick={() => isLocked ? (isSchoolActive ? showLockedFeature('parent') : showLockedFeature('school')) : setParentStack(prev => [...prev, it.key])} className={`glass-card p-5 rounded-[2.5rem] flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm ${isLocked ? 'bg-rose-50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/20' : ''}`}>
                                              <div className="flex items-center gap-4"><div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${isLocked ? 'bg-rose-500 text-white' : 'bg-brand-500/10 text-brand-600'}`}>{it.icon}</div><div className="text-left"><h3 className={`font-black uppercase text-base leading-tight ${isLocked ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>{it.title}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{it.sub}</p></div></div>
                                              {isLocked ? <Lock size={18} className="text-rose-400" /> : <ChevronRight size={20} className="text-slate-300" />}
                                          </div>
                                      );
                                  })}
                                </div>
                              ) : (
                                <div className="p-8 text-center bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5"><div className="w-16 h-16 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><AlertCircle size={32} /></div><h3 className="font-black uppercase text-slate-600 dark:text-slate-400 mb-2">Profile Not Linked</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ask Admin to link your profile.</p></div>
                              )
                            )}
                         </div>
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 overflow-y-auto px-4 w-full no-scrollbar">
                <div className="max-w-4xl mx-auto w-full pt-4">
                    <ProfileView data={data} isLoading={initialLoading} onLogout={onLogout} credentials={credentials} onOpenSubscription={() => { if ((role === 'parent' || role === 'student') && !isSchoolActive) setShowLockPopup(t('upgrade_school_first')); else setShowPayModal(true); }} onOpenHelp={() => setActiveMenuModal('help')} onOpenAbout={() => setActiveMenuModal('about')} />
                </div>
            </div>
        )}
      </main>

      <BottomNav currentView={currentView} onChangeView={handleViewChange} onOpenAIChat={handleOpenAIChat} />
      
      {/* ... (Existing Modals and Logic below remain untouched) */}
      <Modal isOpen={!!showLockPopup} onClose={() => setShowLockPopup(null)} title="ACCESS RESTRICTED"><div className="text-center py-4 space-y-6"><div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner"><Lock size={40} /></div><div><h4 className="text-xl font-black uppercase text-slate-800 dark:text-white tracking-tight">Services Blocked</h4><p className="text-xs text-slate-400 font-bold uppercase mt-3 px-4 leading-relaxed italic">"{showLockPopup}"</p></div><button onClick={() => setShowLockPopup(null)} className="w-full py-5 rounded-[2rem] bg-slate-900 dark:bg-brand-500 text-white font-black uppercase text-xs tracking-widest shadow-xl">Got it</button></div></Modal>
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="PREMIUM UPGRADE"><SubscriptionModal role={role} /></Modal>
      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} userName={data?.user_name || 'User'} role={role} className={data?.class_name} dashboardData={data} />
      <SettingsModal isOpen={activeMenuModal === 'settings'} onClose={() => setActiveMenuModal(null)} />
      <AboutModal isOpen={activeMenuModal === 'about'} onClose={() => setActiveMenuModal(null)} />
      <HelpModal isOpen={activeMenuModal === 'help'} onClose={() => setActiveMenuModal(null)} />
      <NoticeListModal isOpen={isNoticeListOpen} onClose={() => setIsNoticeListOpen(false)} schoolId={credentials.school_id} role={role} />
      
      <LeaveRequestModal isOpen={role === 'driver' && isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} userId={data?.user_id || ''} schoolId={data?.school_db_id || ''} />

      {/* STACK MODALS */}
      <NoticeModal isOpen={principalStack[principalStack.length-1] === 'notice'} onClose={() => setPrincipalStack(prev => prev.slice(0, -1))} credentials={credentials} />
      <TransportTrackerModal isOpen={principalStack[principalStack.length-1] === 'transport'} onClose={() => setPrincipalStack(prev => prev.slice(0, -1))} schoolId={data?.school_db_id || ''} />
      <AnalyticsModal isOpen={principalStack[principalStack.length-1] === 'teacher_analytics'} onClose={() => setPrincipalStack(prev => prev.slice(0, -1))} schoolCode={credentials.school_id} />
      <HomeworkAnalyticsModal isOpen={principalStack[principalStack.length-1] === 'parents_analytics'} onClose={() => setPrincipalStack(prev => prev.slice(0, -1))} schoolCode={credentials.school_id} />
      <StaffLeaveManagementModal isOpen={principalStack[principalStack.length-1] === 'leave_management'} onClose={() => setPrincipalStack(prev => prev.slice(0, -1))} schoolId={data?.school_db_id || ''} />
      <AttendanceModal isOpen={principalStack[principalStack.length-1] === 'attendance'} onClose={() => setPrincipalStack(prev => prev.slice(0, -1))} schoolId={data?.school_db_id || ''} teacherId={data?.user_id || ''} />

      <AttendanceModal isOpen={teacherStack[teacherStack.length-1] === 'attendance'} onClose={() => setTeacherStack(prev => prev.slice(0, -1))} schoolId={data?.school_db_id || ''} teacherId={data?.user_id || ''} />
      <LeaveRequestModal isOpen={teacherStack[teacherStack.length-1] === 'leave'} onClose={() => setTeacherStack(prev => prev.slice(0, -1))} userId={data?.user_id || ''} schoolId={data?.school_db_id || ''} />
      <TeacherHistoryModal isOpen={teacherStack[teacherStack.length-1] === 'history'} onClose={() => setTeacherStack(prev => prev.slice(0, -1))} credentials={credentials} />
      <Modal isOpen={teacherStack[teacherStack.length-1] === 'homework'} onClose={() => setTeacherStack(prev => prev.slice(0, -1))} title="TODAY'S PORTAL"><div className="space-y-4 premium-subview-enter"><div className="flex items-center gap-3 bg-brand-50 dark:bg-brand-500/10 p-5 rounded-[2.5rem] border border-brand-100 dark:border-brand-500/20"><div className="w-14 h-14 bg-white dark:bg-dark-900 rounded-2xl flex items-center justify-center text-brand-600 shadow-sm shrink-0"><Sparkles size={28} /></div><div className="text-left"><h4 className="font-black text-slate-800 dark:text-white uppercase leading-tight">Quick Submission</h4><p className="text-[10px] font-black text-slate-400 dark:text-brand-500/60 uppercase tracking-widest">Update {data?.total_periods || 8} sessions</p></div></div><div className="grid grid-cols-2 gap-3 pb-4">{getPeriodsArray().map((num) => { const pData = data?.periods?.find(p => p.period_number === num); const isSubmitted = pData?.status === 'submitted'; return (<div key={num} onClick={() => { setSelectedPeriod(num); setTeacherStack(prev => [...prev, 'edit_period']); }} className={`glass-card p-4 rounded-[2rem] transition-all h-36 flex flex-col justify-between cursor-pointer active:scale-95 ${isSubmitted ? 'border-brand-500/30 bg-brand-50 dark:bg-brand-500/5 shadow-inner' : ''}`}><div className="flex justify-between items-start text-left"><span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">P {num}</span>{isSubmitted && <div className="text-brand-500"><CheckCircle2 size={16} /></div>}</div><div className="min-w-0 text-left"><p className="text-sm font-black truncate uppercase text-slate-800 dark:text-white leading-tight">{pData?.subject || 'Waiting'}</p><p className="text-[9px] font-bold text-slate-400 uppercase truncate">{pData?.class_name || 'Empty'}</p></div><button className={`w-full py-2 rounded-2xl text-[8px] font-black uppercase tracking-widest ${isSubmitted ? 'bg-brand-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>{isSubmitted ? 'EDIT' : 'SET'}</button></div>); })}</div><button onClick={() => setTeacherStack(prev => prev.slice(0, -1))} className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 dark:border-white/5">Close Portal</button></div></Modal>
      <PeriodModal isOpen={teacherStack[teacherStack.length-1] === 'edit_period'} onClose={() => setTeacherStack(prev => prev.slice(0, -1))} periodNumber={selectedPeriod || 1} onSubmit={handlePeriodSubmit} initialData={data?.periods?.find(p => p.period_number === selectedPeriod)} schoolDbId={data?.school_db_id} />

      {data && (
        <>
            <AttendanceHistoryModal isOpen={parentStack[parentStack.length-1] === 'attendance_history'} onClose={() => setParentStack(prev => prev.slice(0, -1))} studentId={data.student_id || ''} studentName={data.student_name || ''} />
            <StudentLeaveRequestModal isOpen={parentStack[parentStack.length-1] === 'apply_leave'} onClose={() => setParentStack(prev => prev.slice(0, -1))} parentId={role === 'student' ? (data.linked_parent_id || data.user_id || '') : (data.user_id || '')} studentId={data.student_id || ''} schoolId={data.school_db_id || ''} />
            <TransportTrackerModal isOpen={parentStack[parentStack.length-1] === 'live_transport'} onClose={() => setParentStack(prev => prev.slice(0, -1))} schoolId={data.school_db_id || ''} />
            <HomeworkListModal isOpen={parentStack.includes('daily_tasks')} onClose={() => setParentStack(prev => prev.filter(k => k !== 'daily_tasks' && k !== 'homework_details'))} dashboardData={data} credentials={credentials} isSubscribed={isUserActive} onLockClick={() => showLockedFeature('parent')} onViewHomework={(hw) => { setSelectedHomework(hw); setParentStack(prev => [...prev, 'homework_details']); }} onRefresh={handleManualRefresh} isRefreshing={isRefreshing} refreshTrigger={refreshTrigger} />
            <ParentHomeworkModal isOpen={parentStack[parentStack.length-1] === 'homework_details'} onClose={() => setParentStack(prev => prev.slice(0, -1))} data={selectedHomework} onComplete={async () => { if(selectedHomework) await updateParentHomeworkStatus(credentials.school_id, data.class_name || '', data.section || '', data.student_id || '', credentials.mobile, selectedHomework.period, selectedHomework.subject, getISTDate()); setParentStack(prev => prev.slice(0, -1)); handleManualRefresh(); }} isSubmitting={false} />
        </>
      )}
    </div>
  );
};
