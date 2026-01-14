
import React, { useState, useEffect } from 'react';
import { StaffLeave, StudentLeave } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { X, Calendar, MessageSquare, CheckCircle2, AlertCircle, Clock, Send, ChevronRight, User, GraduationCap, Loader2, RefreshCw } from 'lucide-react';
import { applyForLeave, fetchUserLeaves, fetchSchoolLeaves, updateLeaveStatus, applyStudentLeave, fetchStudentLeavesForParent, fetchSchoolStudentLeaves, updateStudentLeaveStatus } from '../services/dashboardService';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  schoolId: string;
}

interface StaffLeaveManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
}

interface StudentLeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string;
  studentId: string;
  schoolId: string;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose, userId, schoolId }) => {
  const { t } = useThemeLanguage();
  const [formData, setFormData] = useState({
    leave_type: 'Casual Leave',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [history, setHistory] = useState<StaffLeave[]>([]);
  const [tab, setTab] = useState<'apply' | 'history'>('apply');
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useModalBackHandler(tab === 'history' && isOpen, () => setTab('apply'));

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, start_date: today, end_date: today, reason: '' }));
      if (userId) loadHistory();
    }
  }, [isOpen, userId]);

  const loadHistory = async () => {
    if (!userId) return;
    setLoadingHistory(true);
    const data = await fetchUserLeaves(userId);
    setHistory(data);
    setLoadingHistory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !schoolId || !formData.reason.trim()) return;
    setSubmitting(true);
    const success = await applyForLeave({ ...formData, user_id: userId, school_id: schoolId, status: 'pending' });
    if (success) {
      setFormData(prev => ({ ...prev, reason: '' })); 
      setTab('history');
      loadHistory();
    } else alert("Error submitting request.");
    setSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="STAFF LEAVE">
      <div className="space-y-4">
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5">
           <button onClick={() => setTab('apply')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${tab === 'apply' ? 'bg-white dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 shadow-md' : 'text-slate-400 dark:text-slate-600'}`}>Apply</button>
           <button onClick={() => { setTab('history'); loadHistory(); }} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${tab === 'history' ? 'bg-white dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 shadow-md' : 'text-slate-400 dark:text-slate-600'}`}>History</button>
        </div>
        {tab === 'apply' ? (
          <form onSubmit={handleSubmit} className="space-y-4 premium-subview-enter">
            <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Leave Type</label><select value={formData.leave_type} onChange={e => setFormData({...formData, leave_type: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/10 rounded-2xl text-xs font-black uppercase outline-none focus:ring-2 focus:ring-brand-500/10 dark:text-white"><option>Casual Leave</option><option>Sick Leave</option><option>Urgent Work</option></select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">From</label><input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/10 rounded-2xl text-[10px] font-black dark:text-white" required /></div>
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Until</label><input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/10 rounded-2xl text-[10px] font-black dark:text-white" required /></div>
            </div>
            <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason</label><textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Explain your absence..." rows={4} className="w-full p-5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/10 rounded-3xl text-sm font-bold dark:text-slate-200 text-slate-800 outline-none focus:ring-2 focus:ring-brand-500/10 resize-none shadow-inner-sm" required /></div>
            <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-6 rounded-[2rem] flex justify-center items-center gap-3 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-2 border-brand-200 dark:border-brand-500/20 shadow-xl shadow-brand-500/5 active:scale-[0.98] transition-all font-black text-xs tracking-[0.2em] uppercase"
            >
                {submitting ? <Loader2 className="animate-spin" /> : 'SUBMIT REQUEST'}
            </button>
          </form>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar pr-1 premium-subview-enter">
            {loadingHistory ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-brand-500" /></div> : history.length === 0 ? <div className="text-center py-10 opacity-30 uppercase text-[9px] font-black tracking-widest">No history</div> : history.map(l => (
                <div key={l.id} className="p-5 bg-white dark:bg-dark-950 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden transition-colors">
                   {/* DYNAMIC STATUS BADGE - RED FOR PENDING, GREEN FOR APPROVED */}
                   <div className={`absolute top-0 right-0 px-4 py-1.5 text-[8px] font-black uppercase text-white rounded-bl-xl ${l.status === 'approved' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : l.status === 'rejected' ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-rose-500 animate-pulse border-b border-l border-white/20 shadow-xl shadow-rose-500/30'}`}>
                     {l.status === 'pending' ? 'ALERT: PENDING' : l.status}
                   </div>
                   <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm mb-1">{l.leave_type}</h4>
                   <p className="text-[10px] text-slate-400 font-bold mb-3">{l.start_date} to {l.end_date}</p>
                   <p className="text-xs text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed">"{l.reason}"</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export const StudentLeaveRequestModal: React.FC<StudentLeaveRequestModalProps> = ({ isOpen, onClose, parentId, studentId, schoolId }) => {
  const { t } = useThemeLanguage();
  const [formData, setFormData] = useState({
    leave_type: 'Sick Leave',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [history, setHistory] = useState<StudentLeave[]>([]);
  const [tab, setTab] = useState<'apply' | 'history'>('apply');
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useModalBackHandler(tab === 'history' && isOpen, () => setTab('apply'));

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, start_date: today, end_date: today, reason: '' }));
      if (parentId) loadHistory();
    }
  }, [isOpen, parentId]);

  const loadHistory = async () => {
    if (!parentId) return;
    setLoadingHistory(true);
    const data = await fetchStudentLeavesForParent(parentId);
    setHistory(data);
    setLoadingHistory(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentId || !studentId || !schoolId || !formData.reason.trim()) return;
    setSubmitting(true);
    const success = await applyStudentLeave({ 
      ...formData, 
      parent_id: parentId, 
      student_id: studentId, 
      school_id: schoolId, 
      status: 'pending' 
    });
    if (success) {
      setFormData(prev => ({ ...prev, reason: '' })); 
      setTab('history');
      loadHistory();
    } else alert("Error submitting request.");
    setSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="STUDENT LEAVE">
      <div className="space-y-4">
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5">
           <button onClick={() => setTab('apply')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${tab === 'apply' ? 'bg-white dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 shadow-md' : 'text-slate-400 dark:text-slate-600'}`}>Apply</button>
           <button onClick={() => { setTab('history'); loadHistory(); }} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${tab === 'history' ? 'bg-white dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 shadow-md' : 'text-slate-400 dark:text-slate-600'}`}>History</button>
        </div>
        {tab === 'apply' ? (
          <form onSubmit={handleSubmit} className="space-y-4 premium-subview-enter">
            <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason Type</label><select value={formData.leave_type} onChange={e => setFormData({...formData, leave_type: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/10 rounded-2xl text-xs font-black uppercase dark:text-white outline-none focus:ring-2 focus:ring-brand-500/10"><option>Sick Leave</option><option>Casual Leave</option><option>Family Event</option></select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Starts</label><input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/10 rounded-2xl text-[10px] font-black dark:text-white" required /></div>
              <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Ends</label><input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/10 rounded-2xl text-[10px] font-black dark:text-white" required /></div>
            </div>
            <div className="space-y-1"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Application Text</label><textarea value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} placeholder="Detailed reason for leave..." rows={4} className="w-full p-5 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/10 rounded-3xl text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-brand-500/10 resize-none shadow-inner-sm" required /></div>
            <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-6 rounded-[2rem] flex justify-center items-center gap-3 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-2 border-brand-200 dark:border-brand-500/20 shadow-xl shadow-brand-500/5 active:scale-[0.98] transition-all font-black text-xs tracking-[0.2em] uppercase"
            >
                {submitting ? <Loader2 className="animate-spin" /> : 'SUBMIT REQUEST'}
            </button>
          </form>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar pr-1 premium-subview-enter">
            {loadingHistory ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-brand-500" /></div> : history.length === 0 ? <div className="text-center py-10 opacity-30 uppercase text-[9px] font-black tracking-widest">No history</div> : history.map(l => (
                <div key={l.id} className="p-5 bg-white dark:bg-dark-950 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden transition-colors">
                   <div className={`absolute top-0 right-0 px-4 py-1.5 text-[8px] font-black uppercase text-white rounded-bl-xl ${l.status === 'approved' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : l.status === 'rejected' ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-rose-500 animate-pulse border-b border-l border-white/20 shadow-xl shadow-rose-500/30'}`}>
                     {l.status === 'pending' ? 'ALERT: PENDING' : l.status}
                   </div>
                   <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm mb-1">{l.leave_type}</h4>
                   <p className="text-[10px] text-slate-400 font-bold mb-3">{l.start_date} to {l.end_date}</p>
                   <p className="text-xs text-slate-600 dark:text-slate-300 font-bold italic leading-relaxed">"{l.reason}"</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export const StaffLeaveManagementModal: React.FC<StaffLeaveManagementModalProps> = ({ isOpen, onClose, schoolId }) => {
  const { t } = useThemeLanguage();
  const [activeTab, setActiveTab] = useState<'staff' | 'students'>('staff');
  const [staffLeaves, setStaffLeaves] = useState<StaffLeave[]>([]);
  const [studentLeaves, setStudentLeaves] = useState<StudentLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useModalBackHandler(!!selectedItem && isOpen, () => setSelectedItem(null));

  useEffect(() => {
    if (isOpen) loadAllLeaves();
  }, [isOpen]);

  const loadAllLeaves = async (forceRefresh = false) => {
    if (!schoolId) return;
    const CACHE_KEY = `vidyasetu_leaves_${schoolId}`;
    
    if (forceRefresh) setIsRefreshing(true);
    else {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setStaffLeaves(parsed.staff);
                setStudentLeaves(parsed.students);
                setLoading(false);
            } catch(e) {}
        } else setLoading(true);
    }

    const [staff, students] = await Promise.all([
      fetchSchoolLeaves(schoolId),
      fetchSchoolStudentLeaves(schoolId)
    ]);
    
    setStaffLeaves(staff);
    setStudentLeaves(students);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ staff, students }));
    setLoading(false);
    setIsRefreshing(false);
  };

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selectedItem) return;
    setSubmitting(true);
    const success = activeTab === 'staff' 
        ? await updateLeaveStatus(selectedItem.id, status, comment)
        : await updateStudentLeaveStatus(selectedItem.id, status, comment);
        
    if (success) {
      setSelectedItem(null);
      setComment('');
      loadAllLeaves(true);
    } else alert("Error updating status");
    setSubmitting(false);
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
            <CheckCircle2 size={12} strokeWidth={3} />
            <span className="text-[9px] font-black uppercase tracking-widest">APPROVED</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-500/10">
            <AlertCircle size={12} strokeWidth={3} />
            <span className="text-[9px] font-black uppercase tracking-widest">REJECTED</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-500 rounded-xl border border-rose-100 dark:border-rose-500/20 shadow-sm animate-pulse">
            <AlertCircle size={12} strokeWidth={3} />
            <span className="text-[9px] font-black uppercase tracking-widest">ALERT: PENDING</span>
          </div>
        );
    }
  };

  if (isOpen) {
      return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 premium-modal-backdrop" onClick={onClose} />
            <div className="bg-white dark:bg-dark-900 rounded-[3rem] shadow-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden premium-modal-content relative z-10 border border-white/20">
                <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-dark-900">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase leading-tight">LEAVE PORTAL</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => loadAllLeaves(true)} disabled={isRefreshing} className={`p-2.5 rounded-2xl transition-all ${isRefreshing ? 'bg-brand-500/20 text-brand-500' : 'text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20'}`}>
                            <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} strokeWidth={2.5} />
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-all active:scale-90">
                            <X size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
                
                <div className="p-8 overflow-y-auto no-scrollbar bg-white dark:bg-dark-900 flex-1">
                    <div className="space-y-4">
                        {!selectedItem && (
                        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5 premium-subview-enter">
                            <button onClick={() => setActiveTab('staff')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'staff' ? 'bg-white dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 shadow-md' : 'text-slate-400 dark:text-slate-600'}`}>Staff ({staffLeaves.filter(l => l.status === 'pending').length})</button>
                            <button onClick={() => setActiveTab('students')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'students' ? 'bg-white dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 shadow-md' : 'text-slate-400 dark:text-slate-600'}`}>Students ({studentLeaves.filter(l => l.status === 'pending').length})</button>
                        </div>
                        )}

                        {selectedItem ? (
                        <div className="space-y-6 premium-subview-enter">
                            <div className={`p-7 rounded-[2.5rem] bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/20 dark:border-white/5`}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-dark-900 flex items-center justify-center text-brand-600 shadow-sm">{activeTab === 'staff' ? <User size={28} /> : <GraduationCap size={28} />}</div>
                                    <div>
                                    <h3 className="font-black text-slate-800 dark:text-white uppercase text-lg leading-tight">{selectedItem.user_name || selectedItem.student_name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeTab === 'staff' ? 'Faculty Member' : 'Student Request'}</p>
                                    </div>
                                </div>
                                <div className="p-5 bg-white/60 dark:bg-dark-950/40 rounded-3xl border border-white dark:border-white/5">
                                    <p className="text-[8px] font-black text-slate-400 uppercase mb-2">Detailed Reason</p>
                                    <p className="text-sm text-slate-800 dark:text-slate-200 font-bold italic leading-relaxed">"{selectedItem.reason}"</p>
                                </div>
                            </div>

                            {selectedItem.status === 'pending' && (
                                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Note from Principal (Optional)..." rows={3} className="w-full p-6 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/5 rounded-[2rem] outline-none focus:ring-2 focus:ring-brand-500/10 text-sm font-bold text-slate-800 dark:text-white resize-none transition-all shadow-inner-sm" />
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                {selectedItem.status === 'pending' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => handleAction('rejected')} disabled={submitting} className="py-7 rounded-3xl bg-rose-500/10 text-rose-600 font-black text-xs uppercase tracking-widest transition-all active:scale-95 border-2 border-rose-200/20 shadow-lg shadow-rose-500/5">Reject</button>
                                        <button 
                                            onClick={() => handleAction('approved')} 
                                            disabled={submitting} 
                                            className="py-7 rounded-3xl flex justify-center items-center gap-2 bg-emerald-500 text-white border-none shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all font-black text-xs uppercase tracking-widest"
                                        >
                                            {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Approve'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-6 bg-slate-50 dark:bg-brand-500/5 rounded-[2rem] text-center border border-slate-100 dark:border-brand-500/10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Request Processed</p>
                                        <div className="flex justify-center mt-2">{renderStatus(selectedItem.status)}</div>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Back to List</button>
                        </div>
                        ) : (
                        <div className="space-y-3 premium-subview-enter">
                            <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-4 no-scrollbar">
                                {loading ? <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-brand-500" /></div> : (activeTab === 'staff' ? staffLeaves : studentLeaves).length === 0 ? <div className="text-center py-16 opacity-30 uppercase text-[9px] font-black tracking-widest">Clear Queue</div> : (activeTab === 'staff' ? staffLeaves : studentLeaves).map(l => (
                                    <div key={l.id} onClick={() => setSelectedItem(l)} className={`p-5 bg-white dark:bg-dark-950 rounded-[2.2rem] border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] ${l.status === 'pending' ? 'border-l-4 border-l-rose-500 bg-rose-50/20' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${l.status === 'pending' ? 'bg-rose-500/10 text-rose-600' : 'bg-brand-500/10 text-brand-600'} shadow-inner`}>
                                            {activeTab === 'staff' ? <User size={24} /> : <GraduationCap size={24} />}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-slate-800 dark:text-white uppercase leading-tight truncate">{l.user_name || l.student_name}</h4>
                                            <div className="mt-1.5 flex items-center gap-2">
                                                {renderStatus(l.status)}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-200 dark:text-slate-800" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  }
  return null;
};
