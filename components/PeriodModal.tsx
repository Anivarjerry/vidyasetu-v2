
import React, { useState, useEffect } from 'react';
import { PeriodData } from '../types';
import { Button } from './Button';
import { X, Save, Edit2, Loader2, Sparkles, BookOpen, GraduationCap, Layers, CheckCircle2, ChevronRight, Type, History, FileText, LayoutGrid, AlertCircle, ArrowLeft } from 'lucide-react';
import { useModalBackHandler } from '../hooks/useModalBackHandler';
import { fetchSchoolClasses, fetchClassSubjects, fetchSubjectLessons, fetchLessonHomework } from '../services/dashboardService';

interface PeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PeriodData) => Promise<void>;
  periodNumber: number;
  initialData?: PeriodData;
  schoolDbId?: string;
}

export const PeriodModal: React.FC<PeriodModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  periodNumber, 
  initialData,
  schoolDbId
}) => {
  const [formData, setFormData] = useState<PeriodData>({
    period_number: periodNumber,
    status: 'pending',
    class_name: '',
    subject: '',
    lesson: '',
    homework: '',
    homework_type: 'Manual Input'
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [assignedHomeworks, setAssignedHomeworks] = useState<any[]>([]);
  
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Homework Picker States
  const [homeworkPickerStep, setHomeworkPickerStep] = useState<'none' | 'options' | 'manual' | 'test_topic' | 'assigned'>('none');
  const [manualText, setManualText] = useState('');
  const [testTopic, setTestTopic] = useState('');
  const [loadingAssigned, setLoadingAssigned] = useState(false);

  // Single back handler to avoid conflicts
  useModalBackHandler(isOpen, () => {
    if (homeworkPickerStep !== 'none') {
        if (homeworkPickerStep === 'options') setHomeworkPickerStep('none');
        else setHomeworkPickerStep('options');
    } else {
        onClose();
    }
  });

  useEffect(() => {
    if (isOpen && schoolDbId) {
      loadClasses();
    }
  }, [isOpen, schoolDbId]);

  useEffect(() => {
    if (initialData && initialData.status === 'submitted') {
      setFormData(initialData);
      setIsEditMode(true);
    } else {
      setFormData({
        period_number: periodNumber,
        status: 'pending',
        class_name: '',
        subject: '',
        lesson: '',
        homework: '',
        homework_type: 'Manual Input'
      });
      setIsEditMode(false);
      setSubjects([]);
      setLessons([]);
    }
    setHomeworkPickerStep('none');
  }, [initialData, periodNumber, isOpen]);

  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
        const data = await fetchSchoolClasses(schoolDbId!);
        setClasses(data);
        if (initialData?.class_name) {
            const foundClass = data.find(c => c.class_name === initialData.class_name);
            if (foundClass) loadSubjects(foundClass.id);
        }
    } catch(e) {}
    setLoadingClasses(false);
  };

  const loadSubjects = async (classId: string) => {
      setLoadingSubjects(true);
      try {
          const data = await fetchClassSubjects(classId);
          setSubjects(data);
          if (initialData?.subject) {
              const foundSub = data.find(s => s.subject_name === initialData.subject);
              if (foundSub) loadLessons(foundSub.id);
          }
      } catch(e) {}
      setLoadingSubjects(false);
  };

  const loadLessons = async (subjectId: string) => {
      setLoadingLessons(true);
      try {
          const data = await fetchSubjectLessons(subjectId);
          setLessons(data);
      } catch(e) {}
      setLoadingLessons(false);
  };

  const loadAssignedHomework = async () => {
      const selectedLessonObj = lessons.find(l => l.lesson_name === formData.lesson);
      if (!selectedLessonObj) return;
      setLoadingAssigned(true);
      try {
          const data = await fetchLessonHomework(selectedLessonObj.id);
          setAssignedHomeworks(data);
          setHomeworkPickerStep('assigned');
      } catch(e) {}
      setLoadingAssigned(false);
  };

  const handleClassChange = (className: string) => {
    setFormData(prev => ({ ...prev, class_name: className, subject: '', lesson: '', homework: '' }));
    setSubjects([]); setLessons([]);
    const obj = classes.find(c => c.class_name === className);
    if (obj) loadSubjects(obj.id);
  };

  const handleSubjectChange = (subjectName: string) => {
    setFormData(prev => ({ ...prev, subject: subjectName, lesson: '', homework: '' }));
    setLessons([]);
    const obj = subjects.find(s => s.subject_name === subjectName);
    if (obj) loadLessons(obj.id);
  };

  const handleHomeworkSelect = (text: string, type: string) => {
      setFormData(prev => ({ ...prev, homework: text, homework_type: type }));
      setHomeworkPickerStep('none');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.class_name || !formData.subject || !formData.lesson) {
        alert("Please select Class, Subject and Lesson.");
        return;
    }
    if (!formData.homework) {
        alert("Please set homework content first.");
        return;
    }
    setIsSubmitting(true);
    await onSubmit({ ...formData, status: 'submitted' });
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-dark-900 rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden premium-subview-enter transition-all flex flex-col max-h-[92vh] border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-800/40">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              {isEditMode ? `Edit Period ${periodNumber}` : `Submit Period ${periodNumber}`}
            </h3>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1">
              <Sparkles size={10} /> Smart Portal Active
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 p-2.5 rounded-2xl bg-white dark:bg-white/5 shadow-sm active:scale-90 transition-all">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1"><GraduationCap size={12} /> Class</label>
              <select value={formData.class_name} onChange={(e) => handleClassChange(e.target.value)} className="w-full p-4 bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all uppercase" required disabled={loadingClasses}>
                <option value="">{loadingClasses ? 'Loading...' : 'Select Class'}</option>
                {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1"><BookOpen size={12} /> Subject</label>
              <select value={formData.subject} onChange={(e) => handleSubjectChange(e.target.value)} className="w-full p-4 bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all uppercase" required disabled={!formData.class_name || loadingSubjects}>
                <option value="">{loadingSubjects ? 'Wait...' : 'Select Subject'}</option>
                {subjects.map(s => <option key={s.id} value={s.subject_name}>{s.subject_name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1"><Layers size={12} /> Lesson / Topic</label>
            <select value={formData.lesson} onChange={(e) => setFormData(prev => ({ ...prev, lesson: e.target.value, homework: '' }))} className="w-full p-4 bg-emerald-50/30 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all uppercase" required disabled={!formData.subject || loadingLessons}>
              <option value="">{loadingLessons ? 'Wait...' : 'Select Lesson'}</option>
              {lessons.map(l => <option key={l.id} value={l.lesson_name}>{l.lesson_name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Homework Details</label>
            <div 
                onClick={(e) => { 
                    e.preventDefault();
                    if(formData.lesson) setHomeworkPickerStep('options'); 
                    else alert("Please select Class, Subject and Lesson first."); 
                }}
                className={`w-full p-6 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 min-h-[120px] cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${formData.homework ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-800' : 'bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-white/10'}`}
            >
              {formData.homework ? (
                  <div className="text-center w-full px-2">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1.5">
                        <CheckCircle2 size={14} />
                        <p className="text-[10px] uppercase font-black tracking-widest">{formData.homework_type?.toUpperCase() || 'CONTENT'} SELECTED</p>
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight line-clamp-3 uppercase tracking-tighter">"{formData.homework}"</p>
                      <p className="text-[8px] text-emerald-500 font-black mt-2 underline">CLICK TO CHANGE</p>
                  </div>
              ) : (
                  <>
                    <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl shadow-sm flex items-center justify-center text-emerald-500 mb-1">
                        <LayoutGrid size={24} />
                    </div>
                    <span className="uppercase tracking-widest text-[10px] font-black text-slate-400">SET HOMEWORK CONTENT</span>
                  </>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={isSubmitting || !formData.homework} className="w-full py-6 rounded-[2.2rem] flex justify-center items-center gap-3 bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 active:scale-[0.98] transition-all font-black text-xs tracking-[0.2em] uppercase border-none glossy-btn disabled:opacity-50">
              {isSubmitting ? <Loader2 className="animate-spin" /> : (isEditMode ? 'Update Session' : 'Save Session')}
            </button>
          </div>
        </form>
      </div>

      {/* HOMEWORK PICKER MODAL */}
      {homeworkPickerStep !== 'none' && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-6 animate-in zoom-in-95 duration-300">
              <div className="w-full max-w-sm bg-white dark:bg-dark-900 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border border-white/5">
                  <div className="p-6 border-b border-slate-50 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                          {(homeworkPickerStep !== 'options') && (
                              <button onClick={() => setHomeworkPickerStep('options')} className="p-2 bg-white dark:bg-white/5 rounded-xl shadow-sm"><ArrowLeft size={18} /></button>
                          )}
                          <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm tracking-widest">{homeworkPickerStep === 'options' ? 'Pick Type' : homeworkPickerStep.toUpperCase()}</h4>
                      </div>
                      <button onClick={() => setHomeworkPickerStep('none')} className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400"><X size={18} /></button>
                  </div>

                  <div className="p-6 space-y-3">
                      {homeworkPickerStep === 'options' && (
                          <div className="grid gap-3 premium-subview-enter">
                              <button onClick={() => { setManualText(formData.homework || ''); setHomeworkPickerStep('manual'); }} className="p-5 bg-slate-50 dark:bg-dark-950 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center gap-4 active:scale-95 transition-all text-left group">
                                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all"><Type size={24} /></div>
                                  <div><p className="font-black text-xs uppercase dark:text-white">Manual Input</p><p className="text-[10px] text-slate-400 font-bold uppercase">Type custom text</p></div>
                              </button>
                              <button onClick={() => handleHomeworkSelect("Complete yesterday's homework and submit tomorrow.", "Yesterday's Task")} className="p-5 bg-slate-50 dark:bg-dark-950 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center gap-4 active:scale-95 transition-all text-left group">
                                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all"><History size={24} /></div>
                                  <div><p className="font-black text-xs uppercase dark:text-white">Fixed: Yesterday's</p><p className="text-[10px] text-slate-400 font-bold uppercase">Set standard reminder</p></div>
                              </button>
                              <button onClick={() => { setTestTopic(''); setHomeworkPickerStep('test_topic'); }} className="p-5 bg-slate-50 dark:bg-dark-950 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center gap-4 active:scale-95 transition-all text-left group">
                                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all"><FileText size={24} /></div>
                                  <div><p className="font-black text-xs uppercase dark:text-white">Fixed: Test Notice</p><p className="text-[10px] text-slate-400 font-bold uppercase">Announce upcoming test</p></div>
                              </button>
                              <button onClick={loadAssignedHomework} className="p-5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-4 active:scale-95 transition-all text-left group">
                                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all"><BookOpen size={24} /></div>
                                  <div><p className="font-black text-xs uppercase dark:text-emerald-500">Assigned Templates</p><p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-tight">Admin pre-sets</p></div>
                              </button>
                          </div>
                      )}

                      {homeworkPickerStep === 'manual' && (
                          <div className="space-y-4 premium-subview-enter">
                              <textarea value={manualText} onChange={e => setManualText(e.target.value)} placeholder="Type homework here..." rows={5} className="w-full p-6 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-white/10 rounded-[2rem] text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none resize-none shadow-inner" />
                              <button onClick={() => handleHomeworkSelect(manualText, "Manual Input")} disabled={!manualText.trim()} className="w-full py-5 rounded-[1.8rem] bg-emerald-500 text-white font-black uppercase text-xs tracking-widest disabled:opacity-40 shadow-lg shadow-emerald-500/20">Apply Content</button>
                          </div>
                      )}

                      {homeworkPickerStep === 'test_topic' && (
                          <div className="space-y-4 premium-subview-enter">
                              <div className="bg-rose-50 dark:bg-rose-500/10 p-5 rounded-3xl border border-rose-100 dark:border-rose-500/20 flex items-center gap-3">
                                  <AlertCircle size={20} className="text-rose-500" />
                                  <p className="text-[10px] font-black uppercase text-rose-600">Testing Protocol</p>
                              </div>
                              <div><label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Topic Name</label><input type="text" value={testTopic} onChange={e => setTestTopic(e.target.value)} placeholder="e.g. Chapter 5 Basics" className="w-full p-5 bg-white dark:bg-dark-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-rose-500 shadow-sm" /></div>
                              <button onClick={() => handleHomeworkSelect(`Test Announcement: Preparation required for "${testTopic}" tomorrow.`, "Test Notice")} disabled={!testTopic.trim()} className="w-full py-5 rounded-[1.8rem] bg-rose-500 text-white font-black uppercase text-xs tracking-widest disabled:opacity-40 shadow-lg shadow-rose-500/20">Set Test Homework</button>
                          </div>
                      )}

                      {homeworkPickerStep === 'assigned' && (
                          <div className="space-y-3 premium-subview-enter">
                              {loadingAssigned ? (
                                  <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>
                              ) : assignedHomeworks.length === 0 ? (
                                  <div className="text-center py-12 px-4 opacity-40 uppercase text-[9px] font-black tracking-[0.2em] italic">No assigned tasks found for this lesson in Admin Panel.</div>
                              ) : (
                                  <div className="space-y-2 max-h-[45vh] overflow-y-auto no-scrollbar pr-1 pb-4">
                                      {assignedHomeworks.map(h => (
                                          <div key={h.id} onClick={() => handleHomeworkSelect(h.homework_template, "Assigned Template")} className="p-5 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100 dark:border-emerald-500/10 active:scale-95 transition-all text-sm font-black text-slate-700 dark:text-slate-300 cursor-pointer uppercase tracking-tight shadow-sm hover:border-emerald-400">{h.homework_template}</div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      <style>{`
        .glossy-btn {
            background-image: linear-gradient(rgba(255,255,255,0.2), transparent);
            border-top: 1px solid rgba(255,255,255,0.4) !important;
        }
      `}</style>
    </div>
  );
};
