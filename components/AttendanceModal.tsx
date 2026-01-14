
import React, { useState, useEffect } from 'react';
import { Student, AttendanceStatus, AttendanceHistoryItem } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { UserCheck, UserX, Clock, Check, Loader2, Users, Calendar, History, ChevronRight, X, RefreshCw, Sparkles, CheckCircle2, Edit3, Save } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { fetchStudentsForClass, submitAttendance, fetchAttendanceHistory, fetchSchoolClasses, fetchDailyAttendanceStatus, fetchClassAttendanceToday, getISTDate } from '../services/dashboardService';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  teacherId: string;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, schoolId, teacherId }) => {
  const { t } = useThemeLanguage();
  const [tab, setTab] = useState<'class' | 'mark' | 'history'>('class');
  const [selectedClass, setSelectedClass] = useState('');
  const [schoolClasses, setSchoolClasses] = useState<any[]>([]);
  const [completedClasses, setCompletedClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'leave'>>({});
  const [historyData, setHistoryData] = useState<AttendanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useModalBackHandler(isOpen && tab !== 'class', () => {
    if (tab === 'history') setTab('mark');
    else if (tab === 'mark') setTab('class');
  });

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    } else {
      setTab('class');
      setSelectedClass('');
      setAttendance({});
      setHistoryData([]);
    }
  }, [isOpen, schoolId]);

  const loadInitialData = async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
        const [classes, status] = await Promise.all([
            fetchSchoolClasses(schoolId),
            fetchDailyAttendanceStatus(schoolId, getISTDate())
        ]);
        setSchoolClasses(classes);
        setCompletedClasses(status);
    } catch (e) {}
    setLoading(false);
  };

  const handleFetchStudents = async (cls: string, isEdit = false) => {
    setSelectedClass(cls);
    setLoading(true);

    try {
        const [studentData, existingAttendance] = await Promise.all([
            fetchStudentsForClass(schoolId, cls),
            isEdit ? fetchClassAttendanceToday(schoolId, cls, getISTDate()) : Promise.resolve({})
        ]);

        setStudents(studentData);
        
        const initial: Record<string, 'present' | 'absent' | 'leave'> = {};
        studentData.forEach(s => {
            // Use existing status if editing, otherwise default to present
            initial[s.id] = existingAttendance[s.id] || 'present';
        });
        setAttendance(initial);
        setTab('mark');
    } catch (e) {
        alert("Error loading students data.");
    } finally {
        setLoading(false);
    }
  };

  const handleFetchHistory = async (studentId: string) => {
      setLoading(true);
      const hist = await fetchAttendanceHistory(studentId);
      setHistoryData(hist);
      setLoading(false);
      setTab('history');
  };

  const handleToggleStatus = (studentId: string, status: 'present' | 'absent' | 'leave') => {
    if (window.navigator.vibrate) window.navigator.vibrate(5);
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (Object.keys(attendance).length === 0) return;
    
    setSubmitting(true);
    const records: AttendanceStatus[] = Object.entries(attendance).map(([id, status]) => ({
      student_id: id,
      student_name: students.find(s => s.id === id)?.name || '',
      status: status as 'present' | 'absent' | 'leave'
    }));

    const success = await submitAttendance(schoolId, teacherId, selectedClass, records);
    if (success) {
      if (window.navigator.vibrate) window.navigator.vibrate([30, 50, 30]);
      
      // Update the local state for completed classes instantly
      if (!completedClasses.includes(selectedClass)) {
          setCompletedClasses(prev => [...prev, selectedClass]);
      }
      
      alert("Success: Attendance Synced with Cloud!");
      setTab('class');
      setSelectedClass('');
    } else {
      alert('DATABASE ERROR: PGRST204. Please run the SQL Script in your Supabase Editor to enable Unique Constraints.');
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 premium-modal-backdrop" onClick={onClose} />
      <div className="bg-white dark:bg-dark-900 rounded-[3rem] shadow-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden premium-modal-content relative z-10 border border-white/20">
        
        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-dark-900">
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase leading-tight">{t('digital_attendance')}</h3>
            <div className="flex items-center gap-2">
                {tab === 'class' && (
                    <button 
                        onClick={loadInitialData} 
                        disabled={isRefreshing || loading}
                        className={`p-2.5 rounded-2xl transition-all ${isRefreshing ? 'bg-brand-500/20 text-brand-500' : 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20'}`}
                    >
                        <RefreshCw size={20} className={isRefreshing || loading ? "animate-spin" : ""} strokeWidth={2.5} />
                    </button>
                )}
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-all active:scale-90">
                    <X size={24} strokeWidth={2.5} />
                </button>
            </div>
        </div>

        <div className="p-8 overflow-y-auto no-scrollbar bg-white dark:bg-dark-900 flex-1">
            {tab === 'class' ? (
            <div className="space-y-4 premium-subview-enter">
                <div className="flex items-center gap-3 bg-brand-50 dark:bg-brand-500/10 p-5 rounded-[2.5rem] border border-brand-100 dark:border-brand-500/20 mb-2">
                   <div className="w-14 h-14 bg-white dark:bg-dark-900 rounded-2xl flex items-center justify-center text-brand-600 shadow-sm shrink-0"><Sparkles size={28} /></div>
                   <div className="text-left"><h4 className="font-black text-slate-800 dark:text-white uppercase leading-tight">Class Picker</h4><p className="text-[10px] font-black text-slate-400 dark:text-brand-500/60 uppercase tracking-widest">Select to mark attendance</p></div>
                </div>

                {loading ? (
                    <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-brand-500" /></div>
                ) : schoolClasses.length === 0 ? (
                    <div className="text-center py-16 opacity-30 uppercase font-black text-[10px] tracking-widest">No classes found</div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 pb-4">
                        {schoolClasses.map(cls => {
                            const isDone = completedClasses.includes(cls.class_name);
                            return (
                                <button
                                    key={cls.id}
                                    onClick={() => handleFetchStudents(cls.class_name, isDone)}
                                    className={`relative p-5 rounded-[2.2rem] border transition-all duration-300 active:scale-95 group overflow-hidden ${
                                        isDone 
                                        ? 'bg-emerald-500 shadow-xl shadow-emerald-500/20 border-emerald-400 text-white' 
                                        : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-white/10 text-slate-700 dark:text-slate-200 shadow-sm'
                                    }`}
                                >
                                    {isDone && (
                                        <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-white/40 via-white/10 to-transparent opacity-80"></div>
                                    )}
                                    
                                    <div className="relative z-10 flex flex-col items-center gap-1">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1 ${isDone ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                            {isDone ? <CheckCircle2 size={28} /> : <Users size={24} />}
                                        </div>
                                        <span className="font-black text-xs uppercase tracking-widest">{cls.class_name}</span>
                                        {isDone ? (
                                            <div className="flex items-center gap-1 mt-1 bg-white/20 px-2 py-0.5 rounded-lg">
                                                <Edit3 size={10} strokeWidth={3} />
                                                <span className="text-[8px] font-black uppercase tracking-tighter">EDIT DATA</span>
                                            </div>
                                        ) : (
                                            <span className="text-[8px] font-black opacity-40 uppercase tracking-tighter">NOT MARKED</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
            ) : tab === 'mark' ? (
            <div className="flex flex-col h-full premium-subview-enter">
                <div className="flex justify-between items-center mb-4 bg-brand-500/5 dark:bg-brand-500/10 p-4 rounded-3xl border border-brand-500/10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md"><Users size={16} /></div>
                    <span className="font-black text-brand-700 dark:text-brand-400 uppercase text-xs tracking-tighter">{selectedClass}</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{students.length} Pupils</span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar pb-2">
                {loading ? (
                    <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-brand-500" /></div>
                ) : (
                    students.map(student => (
                    <div key={student.id} className="bg-white dark:bg-dark-950 p-4 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group transition-all shadow-sm">
                        <div className="flex items-center gap-4 flex-1 min-w-0" onClick={() => handleFetchHistory(student.id)}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-inner shrink-0 ${attendance[student.id] === 'present' ? 'bg-emerald-500 text-white' : attendance[student.id] === 'absent' ? 'bg-rose-500 text-white' : 'bg-brand-500/10 text-brand-600'}`}>
                            {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-black text-slate-800 dark:text-white truncate uppercase text-sm leading-tight">{student.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">Roll: {student.roll_number || 'N/A'}</p>
                            <span className="text-[9px] text-brand-500 font-black uppercase flex items-center gap-1 cursor-pointer hover:underline"><History size={10} /> Track</span>
                            </div>
                        </div>
                        </div>
                        <div className="flex gap-1.5 shrink-0 ml-4">
                        <button onClick={() => handleToggleStatus(student.id, 'present')} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${attendance[student.id] === 'present' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 scale-110' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}><UserCheck size={20} /></button>
                        <button onClick={() => handleToggleStatus(student.id, 'absent')} className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${attendance[student.id] === 'absent' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/10 scale-110' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}><UserX size={20} /></button>
                        </div>
                    </div>
                    ))
                )}
                </div>

                <div className="pt-4 flex flex-col gap-3">
                <button 
                    onClick={handleSubmit} 
                    disabled={submitting} 
                    className="w-full py-6 rounded-[2rem] flex justify-center items-center gap-3 bg-slate-900 dark:bg-emerald-500 text-white border-none shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all font-black text-xs tracking-[0.2em] uppercase"
                >
                    {submitting ? <Loader2 className="animate-spin" /> : <><Save size={18} /> {completedClasses.includes(selectedClass) ? 'OVERWRITE RECORD' : 'MARK ATTENDANCE'}</>}
                </button>
                <button onClick={() => setTab('class')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2 active:scale-90 transition-all">Cancel & Return</button>
                </div>
            </div>
            ) : (
                <div className="flex flex-col h-full premium-subview-enter">
                    <div className="flex items-center gap-3 mb-5 px-1">
                        <button onClick={() => setTab('mark')} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-500 transition-all active:scale-90"><ChevronRight className="rotate-180" size={18} /></button>
                        <div>
                            <h4 className="font-black text-slate-800 dark:text-white uppercase leading-tight">HISTORY</h4>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recent 60 Days</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 no-scrollbar">
                        {loading ? (
                            <div className="text-center py-16"><Loader2 className="animate-spin mx-auto text-brand-500" /></div>
                        ) : historyData.length === 0 ? (
                            <div className="text-center py-16 opacity-40 uppercase text-[10px] font-black tracking-widest dark:text-gray-500">No records found</div>
                        ) : (
                            historyData.map(h => (
                                <div key={h.id} className="p-4 bg-white dark:bg-dark-950 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${h.status === 'present' ? 'bg-brand-500/10 text-brand-500' : h.status === 'absent' ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-50 dark:bg-white/5 text-slate-500'}`}>
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h5 className="font-black text-sm text-slate-800 dark:text-white">{new Date(h.date).toLocaleDateString()}</h5>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Marked by: {h.marked_by_name}</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${h.status === 'present' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10' : h.status === 'absent' ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/10' : 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-500/10'}`}>{h.status}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="pt-6">
                        <button onClick={() => setTab('mark')} className="w-full py-4 rounded-[1.8rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Back to List</button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
