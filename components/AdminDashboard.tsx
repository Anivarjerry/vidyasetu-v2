
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from './Button';
import { 
  School, CreditCard, Plus, Search, Calendar, UserCog, 
  Users, Trash2, Smartphone, Lock, ChevronRight, Check, 
  X, AlertCircle, ShieldAlert, Key, Star, Clock, MoreVertical, Settings, Info, LogOut,
  UserCheck, UserPlus, Mail, Hash, Layers, LayoutGrid, GraduationCap, MapPin, Truck,
  ShieldCheck, BookOpen, RefreshCw, Home, Zap, ArrowLeft, Loader2, MinusCircle, PlusCircle
} from 'lucide-react';
import { Modal } from './Modal';
import { SettingsModal, AboutModal } from './MenuModals';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useModalBackHandler } from '../hooks/useModalBackHandler';
import { fetchVehicles, upsertVehicle, fetchSchoolClasses, addSchoolClass, fetchClassSubjects, addClassSubject, fetchSubjectLessons, addSubjectLesson, fetchLessonHomework, addLessonHomework, deleteLessonHomework, updateSchoolPeriods, fetchSchoolSummary } from '../services/dashboardService';
import { Vehicle } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
  userName: string;
}

// Helper to manage cache
const getCache = (key: string) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch { return null; }
};
const setCache = (key: string, data: any) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, userName }) => {
  const { t } = useThemeLanguage();
  
  const [adminView, setAdminView] = useState<'home' | 'action'>(() => {
    return (window.history.state?.adminView === 'action') ? 'action' : 'home';
  });
  const [activeTab, setActiveTab] = useState<'schools' | 'users' | 'transport'>(() => {
    return window.history.state?.activeTab || 'schools';
  });

  // --- DATA STATE ---
  const [schools, setSchools] = useState<any[]>(getCache('admin_schools') || []);
  const [users, setUsers] = useState<any[]>(getCache('admin_users') || []);
  const [vehicles, setVehicles] = useState<any[]>(getCache('admin_vehicles') || []);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- NAVIGATION STACK (Home Tab Drill Down) ---
  const [navStack, setNavStack] = useState<any[]>([]);

  // --- MODAL STATES ---
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isUserSubModalOpen, setIsUserSubModalOpen] = useState(false);
  const [deleteModalStep, setDeleteModalStep] = useState<'none' | 'auth' | 'confirm'>('none');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuModal, setActiveMenuModal] = useState<'settings' | 'about' | null>(null);

  // Curriculum State
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [currStep, setCurrStep] = useState<'select_school' | 'manage_classes' | 'manage_subjects' | 'manage_lessons' | 'manage_homework'>('select_school');
  const [currSchool, setCurrSchool] = useState<any>(null);
  const [currClass, setCurrClass] = useState<any>(null);
  const [currSubject, setCurrSubject] = useState<any>(null);
  const [currLesson, setCurrLesson] = useState<any>(null);
  const [currList, setCurrList] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [currLoading, setCurrLoading] = useState(false);

  // Dynamic Periods State
  const [isPeriodsModalOpen, setIsPeriodsModalOpen] = useState(false);
  const [selectedSchoolForPeriods, setSelectedSchoolForPeriods] = useState<any>(null);
  const [periodCount, setPeriodCount] = useState(8);
  const [updatingPeriods, setUpdatingPeriods] = useState(false);

  // Action Tab Selection States
  const [selectedSchoolDetails, setSelectedSchoolDetails] = useState<any>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<any>(null);
  const [schoolUsersList, setSchoolUsersList] = useState<{ type: string, data: any[] } | null>(null);

  // Helper States
  const [schoolStats, setSchoolStats] = useState({ teachers: 0, drivers: 0, students: 0, parents: 0, principal: 'N/A' });
  const [selectedSchoolForSub, setSelectedSchoolForSub] = useState<any>(null);
  const [selectedUserForSub, setSelectedUserForSub] = useState<any>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [userExpiryDate, setUserExpiryDate] = useState('');

  // Form States
  const [newSchool, setNewSchool] = useState({ name: '', school_code: '' });
  const [newUser, setNewUser] = useState({ name: '', mobile: '', password: '', role: '', school_id: '', class_name: '', student_name: '', parent_id: '', selected_student_id: '' });
  const [parentStudents, setParentStudents] = useState<{name: string, class_name: string}[]>([{name: '', class_name: ''}]);
  const [parentsList, setParentsList] = useState<any[]>([]); 
  const [filteredParents, setFilteredParents] = useState<any[]>([]); 
  const [studentOptions, setStudentOptions] = useState<any[]>([]);
  const [newVehicle, setNewVehicle] = useState({ vehicle_number: '', vehicle_type: 'bus', school_id: '', driver_id: '' });
  const [hasPrincipal, setHasPrincipal] = useState(false); 
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string, type: 'school' | 'user' | 'vehicle'} | null>(null);
  const [deleteAuth, setDeleteAuth] = useState({ mobile: '', secret: '' });
  const [deleteError, setDeleteError] = useState('');

  // --- BACK HANDLER ---
  useModalBackHandler(
    isMenuOpen || !!activeMenuModal || navStack.length > 0 || !!selectedSchoolDetails || !!selectedUserDetails || !!selectedVehicleDetails || isSchoolModalOpen || isUserModalOpen || isVehicleModalOpen || isSubModalOpen || isUserSubModalOpen || deleteModalStep !== 'none' || isCurriculumModalOpen || isPeriodsModalOpen,
    () => {
        if (activeMenuModal) setActiveMenuModal(null);
        else if (isMenuOpen) setIsMenuOpen(false);
        else if (navStack.length > 0) {
            setNavStack(prev => prev.slice(0, -1)); // Pop stack
        }
        else if (isPeriodsModalOpen) {
            if (selectedSchoolForPeriods) setSelectedSchoolForPeriods(null);
            else setIsPeriodsModalOpen(false);
        }
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
    }
  );

  // --- NAVIGATION HELPERS ---
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

  const handleAdminViewChange = (view: 'home' | 'action') => {
    if (view !== adminView) {
      window.history.pushState({ adminView: view, activeTab }, '', window.location.href);
      setAdminView(view);
      setNavStack([]);
    }
  };

  const handleTabChange = (tab: 'schools' | 'users' | 'transport') => {
    if (tab !== activeTab) {
      window.history.pushState({ adminView, activeTab: tab }, '', window.location.href);
      setActiveTab(tab);
    }
  };

  // --- DATA FETCHING ---
  const fetchData = useCallback(async (background = true) => {
    if (!background) setLoading(true);
    try {
      const { data: schoolsData } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
      if (schoolsData) {
          setSchools(schoolsData);
          setCache('admin_schools', schoolsData);
      }
      
      const { data: usersData } = await supabase.from('users').select('*, schools(name)').order('created_at', { ascending: false });
      if (usersData) {
          setUsers(usersData);
          setCache('admin_users', usersData);
      }

      const { data: vehiclesData } = await supabase.from('vehicles').select('*, schools(name), users!driver_id(name)');
      if (vehiclesData) {
          const mapped = vehiclesData.map(v => ({ ...v, school_name: v.schools?.name, driver_name: v.users?.name }));
          setVehicles(mapped);
          setCache('admin_vehicles', mapped);
      }
    } catch (e) {} finally { if(!background) setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSync = async () => {
      setIsRefreshing(true);
      await fetchData(false);
      setIsRefreshing(false);
  };

  // --- HOME TAB DRILL DOWN LOGIC ---
  const pushToStack = (view: any) => {
      setNavStack([...navStack, view]);
  };

  const openSummary = (type: 'total_schools' | 'total_users' | 'active_schools' | 'active_users') => {
      let data = [];
      if (type === 'total_schools') data = schools;
      else if (type === 'active_schools') data = schools.filter(s => s.is_active);
      else if (type === 'total_users') data = users;
      else if (type === 'active_users') data = users.filter(u => isUserActive(u.subscription_end_date));
      
      pushToStack({ 
          type: 'summary', 
          data: data, 
          title: t(type), 
          itemType: type.includes('school') ? 'school' : 'user',
          readonly: true 
      });
  };

  const openDeepSchoolDetail = async (school: any) => {
      pushToStack({
          type: 'detail_school',
          data: school,
          title: school.name,
          readonly: true
      });
      await fetchSchoolDetailedStats(school.id); 
  };

  const openDeepUserList = (schoolId: string, role: string, title: string) => {
      const list = users.filter(u => u.school_id === schoolId && u.role === role);
      pushToStack({
          type: 'list_users',
          data: list,
          title: title,
          readonly: true
      });
  };

  const openDeepUserDetail = (user: any) => {
      pushToStack({
          type: 'detail_user',
          data: user,
          title: user.name,
          readonly: true
      });
  };

  // --- STATS CALCULATION ---
  const fetchSchoolDetailedStats = async (schoolId: string) => {
      const localTeachers = users.filter(u => u.school_id === schoolId && u.role === 'teacher').length;
      const localDrivers = users.filter(u => u.school_id === schoolId && u.role === 'driver').length;
      const localParents = users.filter(u => u.school_id === schoolId && u.role === 'parent').length;
      const localPrincipal = users.find(u => u.school_id === schoolId && u.role === 'principal')?.name || 'Not Assigned';
      
      setSchoolStats({ teachers: localTeachers, drivers: localDrivers, students: 0, parents: localParents, principal: localPrincipal });

      const { count: students } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId);
      setSchoolStats(prev => ({ ...prev, students: students || 0 }));
  };

  const handleOpenSchoolUserList = (type: 'teacher' | 'driver' | 'parent') => {
      const list = users.filter(u => u.school_id === selectedSchoolDetails.id && u.role === type);
      setSchoolUsersList({ type: type === 'teacher' ? 'Faculty' : type === 'driver' ? 'Transport Staff' : 'Guardians', data: list });
  };

  // --- USER FORM LOGIC ---
  useEffect(() => {
    const run = async () => {
        if (newUser.school_id) {
            const principal = users.find(u => u.school_id === newUser.school_id && u.role === 'principal');
            setHasPrincipal(!!principal);
            const parents = users.filter(u => u.school_id === newUser.school_id && u.role === 'parent').sort((a,b) => a.name.localeCompare(b.name));
            setParentsList(parents);
            setFilteredParents(parents);
        } else {
            setHasPrincipal(false);
            setParentsList([]); setFilteredParents([]);
        }
    }
    run();
  }, [newUser.school_id, users]);

  useEffect(() => {
      // Filter parents based on class for Students
      const filterParents = async () => {
          if (newUser.role === 'student' && newUser.class_name && newUser.school_id) {
              const { data: studentsInClass } = await supabase
                  .from('students')
                  .select('parent_user_id')
                  .eq('school_id', newUser.school_id)
                  .eq('class_name', newUser.class_name)
                  .not('parent_user_id', 'is', null);
              
              if (studentsInClass && studentsInClass.length > 0) {
                  const validParentIds = new Set(studentsInClass.map(s => s.parent_user_id));
                  const filtered = parentsList.filter(p => validParentIds.has(p.id));
                  setFilteredParents(filtered);
              } else {
                  setFilteredParents([]); 
              }
          } else {
              setFilteredParents(parentsList); 
          }
      };
      if (newUser.role === 'student') filterParents();
  }, [newUser.class_name, newUser.school_id, newUser.role, parentsList]);

  // Fetch students for selected parent
  useEffect(() => {
      const fetchStudentsForParent = async () => {
          if (newUser.role === 'student' && newUser.parent_id) {
              let query = supabase.from('students').select('id, name, class_name').eq('parent_user_id', newUser.parent_id);
              if (newUser.class_name) {
                  query = query.eq('class_name', newUser.class_name);
              }
              const { data } = await query;
              setStudentOptions(data || []);
          } else {
              setStudentOptions([]);
          }
      };
      fetchStudentsForParent();
  }, [newUser.parent_id, newUser.role, newUser.class_name]);

  // --- CURRICULUM ---
  useEffect(() => {
    if (!isCurriculumModalOpen) return;
    loadCurriculumData();
  }, [isCurriculumModalOpen, currStep, currSchool, currClass, currSubject, currLesson]);

  const loadCurriculumData = async () => {
    setCurrLoading(true);
    let data: any[] = [];
    if (currStep === 'select_school') {
        data = schools;
    } else if (currStep === 'manage_classes' && currSchool) {
        data = await fetchSchoolClasses(currSchool.id);
    } else if (currStep === 'manage_subjects' && currClass) {
        data = await fetchClassSubjects(currClass.id);
    } else if (currStep === 'manage_lessons' && currSubject) {
        data = await fetchSubjectLessons(currSubject.id);
    } else if (currStep === 'manage_homework' && currLesson) {
        data = await fetchLessonHomework(currLesson.id);
    }
    setCurrList(data);
    setCurrLoading(false);
  };

  const handleAddCurriculumItem = async () => {
    if (!newItemName) return;
    setCurrLoading(true);
    if (currStep === 'manage_classes') await addSchoolClass(currSchool.id, newItemName);
    else if (currStep === 'manage_subjects') await addClassSubject(currClass.id, newItemName);
    else if (currStep === 'manage_lessons') await addSubjectLesson(currSubject.id, newItemName);
    else if (currStep === 'manage_homework') await addLessonHomework(currLesson.id, newItemName);
    
    setNewItemName('');
    await loadCurriculumData();
    setCurrLoading(false);
  };

  const deleteCurriculumItem = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setCurrLoading(true);
    if (currStep === 'manage_classes') await supabase.from('school_classes').delete().eq('id', id);
    else if (currStep === 'manage_subjects') await supabase.from('class_subjects').delete().eq('id', id);
    else if (currStep === 'manage_lessons') await supabase.from('subject_lessons').delete().eq('id', id);
    else if (currStep === 'manage_homework') await deleteLessonHomework(id);
    await loadCurriculumData();
    setCurrLoading(false);
  };

  // Dynamic Periods Logic
  const handleUpdatePeriods = async () => {
      if (!selectedSchoolForPeriods) return;
      setUpdatingPeriods(true);
      const success = await updateSchoolPeriods(selectedSchoolForPeriods.id, periodCount);
      if (success) {
          alert("Success: School periods updated!");
          setIsPeriodsModalOpen(false);
          fetchData();
      } else alert("Failed to update.");
      setUpdatingPeriods(false);
  };

  // --- HELPER FUNCTIONS FOR USER FORM ---
  const addParentStudent = () => {
      setParentStudents([...parentStudents, {name: '', class_name: ''}]);
  };
  const updateParentStudent = (index: number, field: 'name' | 'class_name', value: string) => {
      const newStudents = [...parentStudents];
      newStudents[index][field] = value;
      setParentStudents(newStudents);
  };
  const removeParentStudent = (index: number) => {
      if (parentStudents.length > 1) {
          const newStudents = [...parentStudents];
          newStudents.splice(index, 1);
          setParentStudents(newStudents);
      }
  };

  const checkHighSchool = () => {
      if (newUser.role !== 'student') return false;
      const num = parseInt(newUser.class_name.replace(/\D/g, ''));
      return !isNaN(num) && num >= 9;
  };
  const isHighSchool = checkHighSchool();

  const isUserFormValid = useMemo(() => {
      if(!newUser.school_id || !newUser.role || !newUser.name || newUser.mobile.length !== 10) return false;
      if(newUser.role === 'parent') {
          return parentStudents.every(s => s.name && s.class_name);
      }
      if(newUser.role === 'student') {
          if (isHighSchool) return !!newUser.parent_id && !!newUser.selected_student_id;
          else return !!newUser.student_name;
      }
      return true;
  }, [newUser, isHighSchool, parentStudents]);

  const getNamePlaceholder = () => {
      if (newUser.role === 'teacher') return 'Input Teacher Name';
      if (newUser.role === 'parent') return 'Input Parent Name';
      if (newUser.role === 'driver') return 'Input Driver Full Name';
      if (newUser.role === 'principal') return 'Input Principal Name';
      if (newUser.role === 'student' as any) return 'Input Student Full Name';
      return 'Full Name';
  };

  const handleMenuAction = (action: () => void) => { setIsMenuOpen(false); setTimeout(action, 150); };

  // --- ACTIONS ---
  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.name || !newSchool.school_code) { alert("Enter details"); return; }
    const { error } = await supabase.from('schools').insert([{ name: newSchool.name, school_code: newSchool.school_code.toUpperCase(), is_active: true, subscription_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] }]);
    if (!error) { setIsSchoolModalOpen(false); setNewSchool({ name: '', school_code: '' }); fetchData(); }
  };
  
  const handleAddUser = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const { data: user, error } = await supabase.from('users').insert([{ 
        name: newUser.name, mobile: newUser.mobile, password: newUser.password || '123456', role: newUser.role, school_id: newUser.school_id,
        subscription_end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0] 
      }]).select();
      
      if(error) { alert(error.message); return; }

      // Logic for Parent: Creates MULTIPLE student records
      if (newUser.role === 'parent' && user && user.length > 0) {
         for (const student of parentStudents) {
             await supabase.from('students').insert([{ 
                 school_id: newUser.school_id, 
                 name: student.name, 
                 class_name: student.class_name, 
                 parent_user_id: user[0].id 
             }]);
         }
      }

      // Logic for Student
      if (newUser.role === 'student' as any && user && user.length > 0) {
         if (isHighSchool && newUser.selected_student_id) {
             await supabase.from('students').update({ student_user_id: user[0].id }).eq('id', newUser.selected_student_id);
         } else {
             await supabase.from('students').insert([{ 
                 school_id: newUser.school_id, 
                 name: newUser.name, 
                 class_name: newUser.class_name || 'Class 9', 
                 student_user_id: user[0].id,
                 father_name: newUser.student_name 
             }]);
         }
      }

      setIsUserModalOpen(false); 
      setNewUser({ name: '', mobile: '', password: '', role: '', school_id: '', class_name: '', student_name: '', parent_id: '', selected_student_id: '' }); 
      setParentStudents([{name: '', class_name: ''}]);
      fetchData();
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.vehicle_number || !newVehicle.school_id) return;
    const success = await upsertVehicle(newVehicle);
    if (success) {
        setIsVehicleModalOpen(false);
        setNewVehicle({ vehicle_number: '', vehicle_type: 'bus', school_id: '', driver_id: '' });
        fetchData();
    } else {
        alert("Failed to save vehicle");
    }
  };

  const initiateDelete = (type: any, id: string, name: string) => { setItemToDelete({ id, name, type }); setDeleteModalStep('auth'); };
  const verifyAdminForDelete = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      if (deleteAuth.mobile && deleteAuth.secret) setDeleteModalStep('confirm'); 
  };
  const finalDelete = async () => { 
      if (!itemToDelete) return;
      if (itemToDelete.type === 'school') await supabase.from('schools').delete().eq('id', itemToDelete.id);
      else if (itemToDelete.type === 'user') await supabase.from('users').delete().eq('id', itemToDelete.id);
      else if (itemToDelete.type === 'vehicle') await supabase.from('vehicles').delete().eq('id', itemToDelete.id);
      setDeleteModalStep('none'); fetchData(); 
  };
  
  const toggleSchoolActive = async (id: string, status: boolean) => { await supabase.from('schools').update({is_active: !status}).eq('id', id); fetchData(); };
  const handleUpdateSubscription = async () => { await supabase.from('schools').update({subscription_end_date: expiryDate}).eq('id', selectedSchoolForSub.id); setIsSubModalOpen(false); fetchData(); };
  const handleUpdateUserSubscription = async () => { await supabase.from('users').update({subscription_end_date: userExpiryDate}).eq('id', selectedUserForSub.id); setIsUserSubModalOpen(false); fetchData(); };

  // --- HELPERS ---
  const isUserActive = (expiry: string | null) => { if (!expiry) return false; return new Date(expiry) >= new Date(); };
  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeTab === 'schools') return schools.filter(s => (s.name || '').toLowerCase().includes(term));
    if (activeTab === 'users') return users.filter(u => (u.name || '').toLowerCase().includes(term) || (u.mobile || '').includes(term));
    return vehicles.filter(v => (v.vehicle_number || '').toLowerCase().includes(term));
  }, [schools, users, vehicles, activeTab, searchTerm]);

  const driversForSelectedSchool = useMemo(() => {
    if (!newVehicle.school_id) return [];
    return users.filter(u => u.school_id === newVehicle.school_id && u.role === 'driver');
  }, [users, newVehicle.school_id]);

  // --- RENDER HELPERS ---
  const SyncButton = () => (
      <button onClick={(e) => { e.stopPropagation(); handleSync(); }} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl active:scale-90 transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
      </button>
  );

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
          
          {/* HOME VIEW */}
          {adminView === 'home' && (
            <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6 pb-20">
              <div className="relative w-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-900 shadow-[0_15px_40px_-10px_rgba(16,185,129,0.3)] border border-emerald-500/20 group transition-transform duration-500 active:scale-[0.98] h-40 flex flex-col justify-center">
                <div className="absolute top-[-40%] right-[-20%] w-[120%] h-[120%] bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                <div className="relative h-full flex flex-col justify-between px-6 py-5 text-white z-10">
                  <div className="flex justify-between items-start"><div className="space-y-0.5"><p className="text-[8px] font-black text-emerald-200 uppercase tracking-[0.3em] drop-shadow-sm">System Authority</p><h2 className="text-xl font-black uppercase tracking-tighter italic drop-shadow-lg text-white">VidyaSetu AI</h2></div><div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white/90 shadow-2xl"><Key size={20} strokeWidth={1.5} /></div></div>
                  <div className="space-y-1.5"><div><p className="text-[8px] font-black text-emerald-100/60 uppercase tracking-[0.2em]">Master Controller</p><h3 className="text-lg font-black uppercase tracking-tight text-white truncate">{userName}</h3></div></div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[{ label: t('total_schools'), value: schools.length, id: 'total_schools' }, { label: t('total_users'), value: users.length, id: 'total_users' }, { label: t('active_schools'), value: schools.filter(s => s.is_active).length, id: 'active_schools' }, { label: t('active_users'), value: users.filter(u => isUserActive(u.subscription_end_date)).length, id: 'active_users' }].map((stat, i) => (
                  <button key={i} onClick={() => openSummary(stat.id as any)} className="p-5 rounded-[2rem] border-2 bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10 shadow-sm min-h-[110px] flex flex-col justify-center transition-all hover:border-emerald-400 active:scale-95 text-left"><p className="text-[9px] font-black uppercase tracking-widest mb-1 text-emerald-600 opacity-70">{stat.label}</p><p className="text-2xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">{stat.value}</p></button>
                ))}
              </div>

              <div className="space-y-3">
                <div onClick={() => { setIsCurriculumModalOpen(true); setCurrStep('select_school'); }} className="p-6 rounded-[2.5rem] bg-emerald-600 text-white shadow-xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:bg-emerald-700">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md"><BookOpen size={32} /></div>
                        <div>
                            <h3 className="text-xl font-black uppercase leading-tight">Academic Setup</h3>
                            <p className="text-[10px] font-black text-emerald-100/60 uppercase tracking-widest mt-1">Manage Class & Subjects</p>
                        </div>
                    </div>
                    <ChevronRight size={24} />
                </div>

                <div onClick={() => { setIsPeriodsModalOpen(true); }} className="p-6 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all hover:bg-indigo-700">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md"><LayoutGrid size={32} /></div>
                        <div>
                            <h3 className="text-xl font-black uppercase leading-tight">School Periods</h3>
                            <p className="text-[10px] font-black text-indigo-100/60 uppercase tracking-widest mt-1">Set Dynamic Period Counts</p>
                        </div>
                    </div>
                    <ChevronRight size={24} />
                </div>
              </div>
            </div>
          )}

          {/* ACTION VIEW */}
          {adminView === 'action' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="sticky top-0 z-50 bg-white/50 dark:bg-dark-950/50 backdrop-blur-3xl pt-2 pb-6 space-y-4">
                 <div className="flex bg-slate-50 dark:bg-white/5 p-1 rounded-[2.2rem] border border-slate-100 dark:border-white/5 shadow-inner">
                   <button onClick={() => handleTabChange('schools')} className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase transition-all ${activeTab === 'schools' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-md' : 'text-slate-400'}`}>{t('schools_tab')}</button>
                   <button onClick={() => handleTabChange('users')} className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase transition-all ${activeTab === 'users' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-md' : 'text-slate-400'}`}>{t('users_tab')}</button>
                   <button onClick={() => handleTabChange('transport')} className={`flex-1 py-4 rounded-[1.8rem] text-[10px] font-black uppercase transition-all ${activeTab === 'transport' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 shadow-md' : 'text-slate-400'}`}>{t('transport_tab')}</button>
                 </div>
                 <div className="flex gap-3">
                   <div className="flex-1 relative"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} /><input type="text" placeholder={t('quick_search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-white dark:bg-dark-900 border border-slate-100 dark:border-white/5 rounded-3xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-bold" /></div>
                   <button onClick={handleSync} disabled={isRefreshing} className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-500/10 ${isRefreshing ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'}`}><RefreshCw size={24} strokeWidth={2.5} className={isRefreshing ? 'animate-spin' : ''} /></button>
                   <button onClick={() => { if (activeTab === 'schools') setIsSchoolModalOpen(true); else if (activeTab === 'users') setIsUserModalOpen(true); else setIsVehicleModalOpen(true); }} className="px-6 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-emerald-500/10"><Plus size={24} strokeWidth={3} /></button>
                 </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-20">{filteredItems.map(item => (<div key={item.id} onClick={() => { if(activeTab === 'schools') { setSelectedSchoolDetails(item); setSelectedSchoolForSub(item); setExpiryDate(item.subscription_end_date || ''); } else if(activeTab === 'users') { setSelectedUserDetails(item); setSelectedUserForSub(item); setUserExpiryDate(item.subscription_end_date || ''); } else if(activeTab === 'transport') { setSelectedVehicleDetails(item); } }} className="bg-white dark:bg-dark-900 p-5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all relative cursor-pointer group"><div className="flex justify-between items-start mb-4"><div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">{activeTab === 'schools' ? <School size={24} /> : activeTab === 'users' ? <span className="font-black text-xl">{item.name?.charAt(0)}</span> : <Truck size={24} />}</div><button onClick={(e) => { e.stopPropagation(); initiateDelete(activeTab === 'schools' ? 'school' : activeTab === 'users' ? 'user' : 'vehicle', item.id, item.name || item.vehicle_number); }} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button></div><h3 className="text-lg font-black text-slate-800 dark:text-white uppercase truncate">{item.name || item.vehicle_number}</h3><div className="mt-4 pt-3 border-t border-slate-50 dark:border-white/5 flex justify-between items-center"><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${activeTab === 'schools' ? (item.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600') : (activeTab === 'users' ? (isUserActive(item.subscription_end_date) ? t('active') : t('expired')) : (item.driver_name ? 'ASSIGNED' : 'NO DRIVER'))}`}>{activeTab === 'schools' ? (item.is_active ? t('active') : t('blocked')) : (activeTab === 'users' ? (isUserActive(item.subscription_end_date) ? t('active') : t('expired')) : (item.driver_name ? 'ASSIGNED' : 'NO DRIVER'))}</span><ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" /></div></div>))}</div>
            </div>
          )}
        </div>
      </main>

      {/* Navigation - Enhanced with safe-area support */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-slate-100 dark:border-white/5 flex flex-col items-center justify-center z-[60] safe-padding-bottom h-[calc(4.5rem+env(safe-area-inset-bottom,0px))] transition-all duration-300 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.02)]">
        <div className="w-full max-w-[320px] flex justify-around items-center h-[4.5rem] px-8 relative">
            <button onClick={() => handleAdminViewChange('home')} className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-90 w-16 group ${adminView === 'home' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>
                <div className="relative">
                    <Home size={28} strokeWidth={adminView === 'home' ? 2.5 : 2} className="transition-all duration-300 drop-shadow-sm" />
                    {adminView === 'home' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full animate-in fade-in zoom-in"></span>}
                </div>
                <span className="text-[9px] font-black uppercase mt-1">Home</span>
            </button>
            <button onClick={() => handleAdminViewChange('action')} className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-90 w-16 group ${adminView === 'action' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'}`}>
                <div className="relative">
                    <Zap size={28} strokeWidth={adminView === 'action' ? 2.5 : 2} className="transition-all duration-300 drop-shadow-sm" />
                    {adminView === 'action' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full animate-in fade-in zoom-in"></span>}
                </div>
                <span className="text-[9px] font-black uppercase mt-1">Action</span>
            </button>
        </div>
      </nav>

      {/* Dynamic Periods Modal ... */}
      <Modal isOpen={isPeriodsModalOpen} onClose={() => setIsPeriodsModalOpen(false)} title="SCHOOL PERIODS">
          <div className="flex flex-col h-[70vh]">
              <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                  {!selectedSchoolForPeriods ? (
                      <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select School to Configure</p>
                          {schools.map(s => (
                              <div key={s.id} onClick={() => { setSelectedSchoolForPeriods(s); setPeriodCount(s.total_periods || 8); }} className="p-5 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between cursor-pointer active:scale-95 transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black uppercase shadow-inner"><School size={20} /></div>
                                      <div><p className="font-black text-xs uppercase dark:text-white">{s.name}</p><p className="text-[9px] font-bold text-slate-400 uppercase">Current: {s.total_periods || 8} Periods</p></div>
                                  </div>
                                  <ChevronRight size={18} className="text-slate-300" />
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="premium-subview-enter space-y-8 py-4">
                          <button onClick={() => setSelectedSchoolForPeriods(null)} className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-widest"><ArrowLeft size={14} /> Back to Schools</button>
                          
                          <div className="p-8 bg-indigo-50 dark:bg-indigo-500/5 rounded-[3rem] border border-indigo-100 dark:border-indigo-500/10 text-center">
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">School Configuration</p>
                              <h4 className="text-xl font-black uppercase text-slate-800 dark:text-indigo-400 truncate mb-8">{selectedSchoolForPeriods.name}</h4>
                              
                              <div className="flex items-center justify-center gap-8 mb-8">
                                  <button onClick={() => setPeriodCount(Math.max(1, periodCount - 1))} className="w-14 h-14 rounded-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-rose-500 shadow-md active:scale-90 transition-all"><MinusCircle size={28} /></button>
                                  <div className="flex flex-col">
                                      <span className="text-6xl font-black text-slate-800 dark:text-white tabular-nums">{periodCount}</span>
                                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Periods</span>
                                  </div>
                                  <button onClick={() => setPeriodCount(Math.min(15, periodCount + 1))} className="w-14 h-14 rounded-full bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 flex items-center justify-center text-emerald-500 shadow-md active:scale-90 transition-all"><PlusCircle size={28} /></button>
                              </div>

                              <p className="text-[10px] font-bold italic text-slate-400">"This will update the Homework and Daily Task portals for all users of this school instantly."</p>
                          </div>
                          
                          <button 
                              onClick={handleUpdatePeriods} 
                              disabled={updatingPeriods}
                              className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black uppercase text-[10px] shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all"
                          >
                              {updatingPeriods ? <Loader2 className="animate-spin mx-auto" /> : 'SAVE CONFIGURATION'}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      </Modal>

    </div>
  );
};
