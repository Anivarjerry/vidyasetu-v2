
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import { Button } from './components/Button';
import { 
  School, CreditCard, Plus, Search, Calendar, UserCog, 
  Users, Trash2, Smartphone, Lock, ChevronRight, Check, 
  X, AlertCircle, ShieldAlert, Key, Star, Clock, MoreVertical, Settings, Info, LogOut,
  UserCheck, UserPlus, Mail, Hash, Layers, LayoutGrid, GraduationCap, MapPin, Truck,
  ShieldCheck, BookOpen, RefreshCw, Home, Zap, ArrowLeft, Loader2
} from 'lucide-react';
import { Modal } from './components/Modal';
import { SettingsModal, AboutModal } from './components/MenuModals';
import { useThemeLanguage } from './contexts/ThemeLanguageContext';
import { useModalBackHandler } from './hooks/useModalBackHandler';
import { fetchVehicles, upsertVehicle, fetchSchoolClasses, addSchoolClass, fetchClassSubjects, addClassSubject, fetchSubjectLessons, addSubjectLesson, fetchLessonHomework, addLessonHomework, deleteLessonHomework } from './services/dashboardService';
import { Vehicle } from './types';

interface AdminDashboardProps {
  onLogout: () => void;
  userName: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, userName }) => {
  const { t } = useThemeLanguage();
  
  const [adminView, setAdminView] = useState<'home' | 'action'>(() => {
    return (window.history.state?.adminView === 'action') ? 'action' : 'home';
  });
  const [activeTab, setActiveTab] = useState<'schools' | 'users' | 'transport'>(() => {
    return window.history.state?.activeTab || 'schools';
  });

  const [schools, setSchools] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [parentsList, setParentsList] = useState<any[]>([]); 
  const [filteredParents, setFilteredParents] = useState<any[]>([]); 
  const [studentOptions, setStudentOptions] = useState<any[]>([]); 
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [selectedSchoolDetails, setSelectedSchoolDetails] = useState<any>(null);
  const [schoolStats, setSchoolStats] = useState({ teachers: 0, drivers: 0, students: 0, parents: 0, principal: 'N/A' });
  const [schoolUsersList, setSchoolUsersList] = useState<{ type: string, data: any[] } | null>(null);
  
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any>(null);
  const [summaryModalType, setSummaryModalType] = useState<'total_schools' | 'total_users' | 'active_schools' | 'active_users' | null>(null);

  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isUserSubModalOpen, setIsUserSubModalOpen] = useState(false);
  const [deleteModalStep, setDeleteModalStep] = useState<'none' | 'auth' | 'confirm'>('none');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuModal, setActiveMenuModal] = useState<'settings' | 'about' | null>(null);

  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [currStep, setCurrStep] = useState<'select_school' | 'manage_classes' | 'manage_subjects' | 'manage_lessons' | 'manage_homework'>('select_school');
  const [currSchool, setCurrSchool] = useState<any>(null);
  const [currClass, setCurrClass] = useState<any>(null);
  const [currSubject, setCurrSubject] = useState<any>(null);
  const [currLesson, setCurrLesson] = useState<any>(null);
  const [currList, setCurrList] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [currLoading, setCurrLoading] = useState(false);

  const [selectedSchoolForSub, setSelectedSchoolForSub] = useState<any>(null);
  const [selectedUserForSub, setSelectedUserForSub] = useState<any>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [userExpiryDate, setUserExpiryDate] = useState('');

  const [newSchool, setNewSchool] = useState({ name: '', school_code: '' });
  const [newUser, setNewUser] = useState({ name: '', mobile: '', password: '', role: '', school_id: '', class_name: '', student_name: '', parent_id: '', selected_student_id: '' });
  const [parentStudents, setParentStudents] = useState<{name: string, class_name: string}[]>([{name: '', class_name: ''}]);

  const [newVehicle, setNewVehicle] = useState({ vehicle_number: '', vehicle_type: 'bus', school_id: '', driver_id: '' });
  const [hasPrincipal, setHasPrincipal] = useState(false); 

  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string, type: 'school' | 'user' | 'vehicle'} | null>(null);
  const [deleteAuth, setDeleteAuth] = useState({ mobile: '', secret: '' });
  const [deleteError, setDeleteError] = useState('');

  useModalBackHandler(isMenuOpen || !!activeMenuModal || !!selectedSchoolDetails || !!selectedUserDetails || !!selectedVehicleDetails || isSchoolModalOpen || isUserModalOpen || isVehicleModalOpen || isSubModalOpen || isUserSubModalOpen || deleteModalStep !== 'none' || isCurriculumModalOpen || !!summaryModalType, () => {
    if (activeMenuModal) setActiveMenuModal(null);
    else if (isMenuOpen) setIsMenuOpen(false);
    else if (summaryModalType) setSummaryModalType(null);
    else if (schoolUsersList) setSchoolUsersList(null);
    else if (selectedSchoolDetails) setSelectedSchoolDetails(null);
    else if (selectedUserDetails) setSelectedUserDetails(null);
    else if (selectedVehicleDetails) setSelectedVehicleDetails(null);
    else if (isSchoolModalOpen) setIsSchoolModalOpen(false);
    else if (isUserModalOpen) setIsUserModalOpen(false);
    else if (isVehicleModalOpen) setIsVehicleModalOpen(false);
    else if (isSubModalOpen) setIsSubModalOpen(false);
    else if (isUserSubModalOpen) setIsUserSubModalOpen(false);
    else if (deleteModalStep !== 'none') setDeleteModalStep('none');
    else if (isCurriculumModalOpen) {
        if (currStep === 'select_school') setIsCurriculumModalOpen(false);
        else if (currStep === 'manage_classes') setCurrStep('select_school');
        else if (currStep === 'manage_subjects') setCurrStep('manage_classes');
        else if (currStep === 'manage_lessons') setCurrStep('manage_subjects');
        else if (currStep === 'manage_homework') setCurrStep('manage_lessons');
    }
  });

  useEffect(() => {
    const handlePop = (e: PopStateEvent) => {
      if (e.state) {
        if (e.state.adminView) setAdminView(e.state.adminView);
        if (e.state.activeTab) setActiveTab(e.state.activeTab);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  useEffect(() => {
    const fetchSchoolData = async () => {
        if (newUser.school_id) {
            const { data } = await supabase.from('users').select('id').eq('school_id', newUser.school_id).eq('role', 'principal').maybeSingle();
            setHasPrincipal(!!data);
            const { data: parents } = await supabase.from('users').select('id, name, mobile').eq('school_id', newUser.school_id).eq('role', 'parent').order('name');
            setParentsList(parents || []);
            setFilteredParents(parents || []);
        } else {
            setHasPrincipal(false);
            setParentsList([]); setFilteredParents([]);
        }
    };
    fetchSchoolData();
  }, [newUser.school_id]);

  useEffect(() => {
      const filterParentsByClass = async () => {
          if (newUser.role === 'student' && newUser.school_id && newUser.class_name) {
              const { data: studentsInClass } = await supabase.from('students').select('parent_user_id').eq('school_id', newUser.school_id).eq('class_name', newUser.class_name).not('parent_user_id', 'is', null);
              if (studentsInClass && studentsInClass.length > 0) {
                  const validParentIds = new Set(studentsInClass.map(s => s.parent_user_id));
                  setFilteredParents(parentsList.filter(p => validParentIds.has(p.id)));
              } else setFilteredParents([]); 
          } else setFilteredParents(parentsList); 
      };
      filterParentsByClass();
  }, [newUser.class_name, newUser.school_id, newUser.role, parentsList]);

  useEffect(() => {
      const fetchStudentsForParent = async () => {
          if (newUser.role === 'student' && newUser.parent_id) {
              let query = supabase.from('students').select('id, name, class_name').eq('parent_user_id', newUser.parent_id);
              if (newUser.class_name) query = query.eq('class_name', newUser.class_name);
              const { data } = await query;
              setStudentOptions(data || []);
          } else setStudentOptions([]);
      };
      fetchStudentsForParent();
  }, [newUser.parent_id, newUser.role, newUser.class_name]);

  const handleAdminViewChange = (view: 'home' | 'action') => {
    if (view !== adminView) {
      window.history.pushState({ adminView: view, activeTab }, '', window.location.href);
      setAdminView(view);
    }
  };

  const handleTabChange = (tab: 'schools' | 'users' | 'transport') => {
    if (tab !== activeTab) {
      window.history.pushState({ adminView, activeTab: tab }, '', window.location.href);
      setActiveTab(tab);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: schoolsData } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
      if (schoolsData) setSchools(schoolsData);
      const { data: usersData } = await supabase.from('users').select('*, schools(name)').order('created_at', { ascending: false });
      if (usersData) setUsers(usersData);
      const { data: vehiclesData } = await supabase.from('vehicles').select('*, schools(name), users!driver_id(name)');
      if (vehiclesData) setVehicles(vehiclesData.map(v => ({ ...v, school_name: v.schools?.name, driver_name: v.users?.name })));
    } catch (e) {} finally { setTimeout(() => setLoading(false), 400); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSync = async () => { setIsRefreshing(true); await fetchData(); setTimeout(() => setIsRefreshing(false), 1000); };

  const fetchSchoolDetailedStats = async (schoolId: string) => {
      setSchoolStats({ teachers: 0, drivers: 0, students: 0, parents: 0, principal: 'Searching...' });
      const { count: teachers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'teacher');
      const { count: drivers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'driver');
      const { count: parents } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('role', 'parent');
      const { count: students } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
      const { data: principal } = await supabase.from('users').select('name').eq('school_id', schoolId).eq('role', 'principal').maybeSingle();
      setSchoolStats({ teachers: teachers || 0, drivers: drivers || 0, parents: parents || 0, students: students || 0, principal: principal?.name || 'Not Assigned' });
  };

  const isUserActive = (expiry: string | null) => { if (!expiry) return false; return new Date(expiry) >= new Date(); };

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeTab === 'schools') return schools.filter(s => (s.name || '').toLowerCase().includes(term) || (s.school_code || '').toLowerCase().includes(term));
    if (activeTab === 'users') return users.filter(u => (u.name || '').toLowerCase().includes(term) || (u.mobile || '').includes(term));
    return vehicles.filter(v => (v.vehicle_number || '').toLowerCase().includes(term) || (v.driver_name || '').toLowerCase().includes(term));
  }, [schools, users, vehicles, activeTab, searchTerm]);

  const updateParentStudent = (index: number, field: 'name' | 'class_name', value: string) => {
      const newStudents = [...parentStudents];
      newStudents[index][field] = value;
      setParentStudents(newStudents);
  };

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.school_code) { alert("Please enter School Name and Code"); return; }
    const { error } = await supabase.from('schools').insert([{ name: newSchool.name, school_code: newSchool.school_code.toUpperCase(), is_active: true, subscription_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] }]);
    if (!error) { setIsSchoolModalOpen(false); setNewSchool({ name: '', school_code: '' }); fetchData(); } else { alert("Registration Error: " + error.message); }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: user, error } = await supabase.from('users').insert([{ name: newUser.name, mobile: newUser.mobile, password: newUser.password || '123456', role: newUser.role, school_id: newUser.school_id, subscription_end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0] }]).select();
    if (error) { alert("Error: " + error.message); return; }
    if (newUser.role === 'parent' && user) {
       for (const student of parentStudents) await supabase.from('students').insert([{ school_id: newUser.school_id, name: student.name, class_name: student.class_name, parent_user_id: user[0].id }]);
    }
    setIsUserModalOpen(false); setNewUser({ name: '', mobile: '', password: '', role: '', school_id: '', class_name: '', student_name: '', parent_id: '', selected_student_id: '' }); fetchData(); 
  };

  const handleMenuAction = (action: () => void) => { setIsMenuOpen(false); setTimeout(action, 150); };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-white dark:bg-dark-950 flex flex-col overflow-hidden transition-colors">
      
      {/* Header - Increased height and added safe-area padding */}
      <header className="h-[calc(5.5rem+env(safe-area-inset-top,0px))] bg-white/80 dark:bg-dark-900/60 backdrop-blur-3xl shadow-sm z-[100] px-6 flex items-end justify-between border-b border-slate-100 dark:border-white/5 flex-shrink-0 relative pb-4 safe-padding-top">
        <div className="flex items-center gap-3"><div className="w-11 h-11 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-500/10"><ShieldAlert size={26} /></div><div><h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase leading-none">VidyaSetu</h1><p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-1">System Admin</p></div></div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 transition-all rounded-full active:scale-90 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 z-[110] relative"><MoreVertical size={24} /></button>
      </header>

      {isMenuOpen && (
        <>
            <div className="fixed inset-0 z-[105]" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute top-[calc(6rem+env(safe-area-inset-top,0px))] right-6 w-48 bg-white dark:bg-dark-900 rounded-[1.5rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden z-[110] animate-in fade-in zoom-in-95 duration-200">
                <div className="py-2">
                    <button onClick={() => handleMenuAction(() => setActiveMenuModal('settings'))} className="w-full text-left px-5 py-3 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 uppercase tracking-widest transition-colors"><Settings size={16} /> {t('settings')}</button>
                    <button onClick={() => handleMenuAction(() => setActiveMenuModal('about'))} className="w-full text-left px-5 py-3 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 uppercase tracking-widest transition-colors"><Info size={16} /> {t('about')}</button>
                    <div className="h-px bg-slate-100 dark:bg-white/5 my-1 mx-4"></div>
                    <button onClick={() => handleMenuAction(onLogout)} className="w-full text-left px-5 py-3 text-xs font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-3 uppercase tracking-widest transition-colors"><LogOut size={16} /> {t('logout')}</button>
                </div>
            </div>
        </>
      )}

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="max-w-4xl mx-auto px-4 pt-4">
          {adminView === 'home' ? (
            <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6 pb-20">
              <div className="relative w-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-900 shadow-[0_15px_40px_-10px_rgba(16,185,129,0.3)] border border-emerald-500/20 group transition-transform duration-500 active:scale-[0.98] h-40 flex flex-col justify-center">
                <div className="absolute top-[-40%] right-[-20%] w-[120%] h-[120%] bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                <div className="relative h-full flex flex-col justify-between px-6 py-5 text-white z-10">
                  <div className="flex justify-between items-start"><div className="space-y-0.5"><p className="text-[8px] font-black text-emerald-200 uppercase tracking-[0.3em] drop-shadow-sm">System Authority</p><h2 className="text-xl font-black uppercase tracking-tighter italic drop-shadow-lg text-white">VidyaSetu AI</h2></div><div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white/90 shadow-2xl"><Key size={20} strokeWidth={1.5} /></div></div>
                  <div className="space-y-1.5"><div><p className="text-[8px] font-black text-emerald-100/60 uppercase tracking-[0.2em]">Master Controller</p><h3 className="text-lg font-black uppercase tracking-tight text-white truncate">{userName}</h3></div></div>
                </div>
              </div>
              {/* Stats and Action Cards ... */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[{ label: t('total_schools'), value: schools.length, id: 'total_schools' }, { label: t('total_users'), value: users.length, id: 'total_users' }, { label: t('active_schools'), value: schools.filter(s => s.is_active).length, id: 'active_schools' }, { label: t('active_users'), value: users.filter(u => isUserActive(u.subscription_end_date)).length, id: 'active_users' }].map((stat, i) => (
                  <button key={i} onClick={() => setSummaryModalType(stat.id as any)} className="p-5 rounded-[2rem] border-2 bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 shadow-sm min-h-[110px] flex flex-col justify-center transition-all hover:border-emerald-400 active:scale-95 text-left"><p className="text-[9px] font-black uppercase tracking-widest mb-1 text-emerald-600 opacity-70">{stat.label}</p><p className="text-2xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">{stat.value}</p></button>
                ))}
              </div>
              <div onClick={() => { setIsCurriculumModalOpen(true); setCurrStep('select_school'); }} className="p-6 rounded-[2.5rem] bg-emerald-600 text-white shadow-xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:bg-emerald-700">
                <div className="flex items-center gap-5"><div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md"><BookOpen size={32} /></div><div><h3 className="text-xl font-black uppercase leading-tight">Academic Setup</h3><p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest mt-1">Manage Class & Subjects</p></div></div><ChevronRight size={24} />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Search and Tabs sticky container */}
               <div className="sticky top-0 z-50 bg-white/50 dark:bg-dark-950/50 backdrop-blur-3xl pt-2 pb-6 space-y-4">
                 <div className="flex bg-slate-50 dark:bg-white/5 p-1 rounded-[2.2rem] border border-slate-100 dark:border-white/5 shadow-inner">
                   <button onClick={() => handleTabChange('schools')} className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase transition-all ${activeTab === 'schools' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-md' : 'text-slate-400'}`}>{t('schools_tab')}</button>
                   <button onClick={() => handleTabChange('users')} className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase transition-all ${activeTab === 'users' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-md' : 'text-slate-400'}`}>{t('users_tab')}</button>
                   <button onClick={() => handleTabChange('transport')} className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase transition-all ${activeTab === 'transport' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-md' : 'text-slate-400'}`}>{t('transport_tab')}</button>
                 </div>
                 {/* Search & Plus buttons */}
                 <div className="flex gap-3">
                   <div className="flex-1 relative"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="text" placeholder={t('quick_search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-white dark:bg-dark-900 border border-slate-100 dark:border-white/5 rounded-3xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold" /></div>
                   <button onClick={handleSync} disabled={isRefreshing} className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-500/10 ${isRefreshing ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'}`}><RefreshCw size={24} strokeWidth={2.5} className={isRefreshing ? 'animate-spin' : ''} /></button>
                   <button onClick={() => { if (activeTab === 'schools') setIsSchoolModalOpen(true); else if (activeTab === 'users') setIsUserModalOpen(true); else setIsVehicleModalOpen(true); }} className="px-6 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-500/10"><Plus size={24} strokeWidth={3} /></button>
                 </div>
               </div>
               {/* List display */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-20">{filteredItems.map(item => (<div key={item.id} className="bg-white dark:bg-dark-900 p-5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm relative cursor-pointer group"><h3 className="text-lg font-black text-slate-800 dark:text-white uppercase truncate">{item.name || item.vehicle_number}</h3></div>))}</div>
            </div>
          )}
        </div>
      </main>
      
      {/* Settings Modals ... */}
      <SettingsModal isOpen={activeMenuModal === 'settings'} onClose={() => setActiveMenuModal(null)} />
      <AboutModal isOpen={activeMenuModal === 'about'} onClose={() => setActiveMenuModal(null)} />
    </div>
  );
};
