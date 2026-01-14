
import { DashboardData, PeriodData, Role, ParentHomework, NoticeItem, NoticeRequest, AnalyticsSummary, TeacherProgress, HomeworkAnalyticsData, StudentHomeworkStatus, Student, AttendanceStatus, Vehicle, StaffLeave, AttendanceHistoryItem, StudentLeave, SchoolSummary, SchoolUser, SiblingInfo } from '../types';
import { supabase } from './supabaseClient';

export const getISTDate = (): string => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + (3600000 * 5.5));
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- ROBUST SCHOOL ID HELPER ---
const getSchoolUUID = async (schoolCode: string): Promise<string | null> => {
    try {
        const cleanCode = schoolCode.trim().toUpperCase();
        const { data, error } = await supabase
            .from('schools')
            .select('id')
            .ilike('school_code', cleanCode)
            .maybeSingle();

        if (error || !data) return null;
        return data.id;
    } catch (e) { return null; }
};

// --- ATTENDANCE SERVICES ---
export const fetchDailyAttendanceStatus = async (schoolId: string, date: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('students!inner(class_name)')
      .eq('school_id', schoolId)
      .eq('date', date);

    if (error) {
        console.error("Fetch Status Error:", error);
        return [];
    }
    if (!data) return [];
    
    const completedClasses = data.map((item: any) => item.students?.class_name).filter(Boolean);
    return Array.from(new Set(completedClasses)) as string[];
  } catch (e) { return []; }
};

export const fetchClassAttendanceToday = async (schoolId: string, className: string, date: string): Promise<Record<string, 'present' | 'absent' | 'leave'>> => {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .select('student_id, status, students!inner(class_name)')
            .eq('school_id', schoolId)
            .eq('date', date)
            .eq('students.class_name', className);

        if (error || !data) return {};
        const records: Record<string, 'present' | 'absent' | 'leave'> = {};
        data.forEach((item: any) => {
            records[item.student_id] = item.status;
        });
        return records;
    } catch (e) { return {}; }
};

export const submitAttendance = async (sid: string, tid: string, cn: string, recs: AttendanceStatus[]): Promise<boolean> => {
  const date = getISTDate();
  
  if (!recs || recs.length === 0) return false;

  const payload = recs.map(r => ({ 
      school_id: sid, 
      marked_by_user_id: tid, 
      student_id: r.student_id, 
      date: date, 
      status: r.status 
  }));

  console.log("Syncing Attendance Payload:", payload);

  const { error } = await supabase
    .from('attendance')
    .upsert(payload, { 
      onConflict: 'student_id,date'
    });

  if (error) {
      console.error("Supabase Error Code:", error.code);
      console.error("Supabase Error Message:", error.message);
      
      if (error.code === 'PGRST204') {
          console.warn("Schema Mismatch: column 'marked_by_user_id' is missing in DB.");
      }
      return false;
  }
  
  return true;
};

// --- NOTICE SERVICES ---
export const fetchNotices = async (schoolCode: string, role: string): Promise<NoticeItem[]> => {
  try {
    const schoolUUID = await getSchoolUUID(schoolCode);
    if (!schoolUUID) return [];
    
    let query = supabase.from('notices').select('*').eq('school_id', schoolUUID);
    
    if (role !== 'principal' && role !== 'admin') {
        const targetRole = role === 'student' ? 'parent' : role;
        query = query.or(`target.eq.all,target.eq.${targetRole}`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch (e) { return []; }
};

export const submitNotice = async (notice: NoticeRequest): Promise<boolean> => {
  try {
    const schoolUUID = await getSchoolUUID(notice.school_id);
    if (!schoolUUID) return false;
    const { error } = await supabase.from('notices').insert({ 
        school_id: schoolUUID, 
        date: notice.date, 
        title: notice.title, 
        message: notice.message, 
        category: notice.category, 
        target: notice.target 
    });
    return !error;
  } catch (e) { return false; }
};

export const deleteNotice = async (id: string): Promise<{success: boolean, error?: string}> => {
  try {
    const { data, error } = await supabase.from('notices').delete().eq('id', id).select();
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) return { success: false, error: "No matching row found." };
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message || "Unknown connection error" }; }
};

// --- ANALYTICS ---
export const fetchPrincipalAnalytics = async (sc: string, d: string): Promise<AnalyticsSummary | null> => {
  const schoolUUID = await getSchoolUUID(sc);
  if (!schoolUUID) return null;
  const { data: ts } = await supabase.from('users').select('id, name, mobile').eq('school_id', schoolUUID).eq('role', 'teacher');
  const { data: pds } = await supabase.from('daily_periods').select('teacher_user_id').eq('school_id', schoolUUID).eq('date', d);
  const teacherList: TeacherProgress[] = (ts || []).map(t => ({ id: t.id, name: t.name, mobile: t.mobile, periods_submitted: (pds || []).filter(s => s.teacher_user_id === t.id).length, total_periods: 8 }));
  return { total_teachers: ts?.length || 0, active_teachers: teacherList.filter(t => t.periods_submitted > 0).length, inactive_teachers: teacherList.filter(t => t.periods_submitted === 0).length, total_periods_expected: (ts?.length || 0) * 8, total_periods_submitted: pds?.length || 0, teacher_list: teacherList };
};

export const fetchHomeworkAnalytics = async (sc: string, date: string): Promise<HomeworkAnalyticsData | null> => {
  const schoolUUID = await getSchoolUUID(sc);
  if (!schoolUUID) return null;
  const { data: sts } = await supabase.from('students').select('id, name, class_name, users!parent_user_id(name)').eq('school_id', schoolUUID);
  const { data: tps = [] } = await supabase.from('daily_periods').select('class_name').eq('school_id', schoolUUID).eq('date', date);
  const { data: sbs = [] } = await supabase.from('homework_submissions').select('student_id').eq('date', date);
  const list: StudentHomeworkStatus[] = (sts || []).map((s: any) => {
    const total = (tps || []).filter((t: any) => t.class_name === s.class_name).length;
    const done = (sbs || []).filter((b: any) => b.student_id === s.id).length;
    let status: any = 'pending';
    if (total === 0) status = 'no_homework'; else if (done >= total) status = 'completed'; else if (done > 0) status = 'partial';
    return { student_id: s.id, student_name: s.name, class_name: s.class_name, parent_name: s.users?.name || 'Unknown', total_homeworks: total, completed_homeworks: done, status };
  });
  return { total_students: sts?.length || 0, fully_completed: list.filter(l => l.status === 'completed').length, partial_completed: list.filter(l => l.status === 'partial').length, pending: list.filter(l => l.status === 'pending').length, student_list: list };
};

export const fetchTeacherHistory = async (sc: string, mob: string, d: string): Promise<PeriodData[]> => {
  const schoolUUID = await getSchoolUUID(sc);
  if (!schoolUUID) return [];
  const { data: user } = await supabase.from('users').select('id').eq('mobile', mob).eq('school_id', schoolUUID).single();
  if (!user) return [];
  const { data } = await supabase.from('daily_periods').select('*').eq('teacher_user_id', user.id).eq('date', d).order('period_number');
  return (data || []).map((p: any) => ({ id: p.id, period_number: p.period_number, status: 'submitted', class_name: p.class_name, subject: p.subject, lesson: p.lesson, homework: p.homework, homework_type: p.homework_type }));
};

// --- MISC ---
export const fetchVehicles = async (id: string): Promise<Vehicle[]> => {
  const { data } = await supabase.from('vehicles').select('*, users!driver_id(name)').eq('school_id', id);
  return (data || []).map((v: any) => ({ ...v, driver_name: v.users?.name }));
};
export const upsertVehicle = async (v: Partial<Vehicle>): Promise<boolean> => { const { error } = await supabase.from('vehicles').upsert({ school_id: v.school_id, vehicle_number: v.vehicle_number, vehicle_type: v.vehicle_type, driver_id: v.driver_id, is_active: v.is_active || true }); return !error; };
export const fetchStudentsForClass = async (id: string, cn: string): Promise<Student[]> => { const { data } = await supabase.from('students').select('*').eq('school_id', id).eq('class_name', cn).order('name'); return data || []; };
export const fetchAttendanceHistory = async (id: string): Promise<AttendanceHistoryItem[]> => {
  const { data } = await supabase.from('attendance').select('*, users!marked_by_user_id(name)').eq('student_id', id).order('date', { ascending: false }).limit(60);
  return (data || []).map((h: any) => ({ id: h.id, date: h.date, status: h.status, marked_by_name: h.users?.name }));
};
export const applyForLeave = async (l: Partial<StaffLeave>): Promise<boolean> => { const { error } = await supabase.from('staff_leaves').insert(l); return !error; };
export const fetchUserLeaves = async (id: string): Promise<StaffLeave[]> => { const { data } = await supabase.from('staff_leaves').select('*').eq('user_id', id).order('created_at', { ascending: false }); return data || []; };
export const fetchSchoolLeaves = async (id: string): Promise<StaffLeave[]> => {
  const { data } = await supabase.from('staff_leaves').select('*, users(name)').eq('school_id', id).order('created_at', { ascending: false });
  return (data || []).map((l: any) => ({ ...l, user_name: l.users?.name }));
};
export const updateLeaveStatus = async (id: string, s: string, c: string): Promise<boolean> => { const { error } = await supabase.from('staff_leaves').update({ status: s, principal_comment: c }).eq('id', id); return !error; };
export const applyStudentLeave = async (l: Partial<StudentLeave>): Promise<boolean> => { const { error } = await supabase.from('student_leaves').insert(l); return !error; };
export const fetchStudentLeavesForParent = async (id: string): Promise<StudentLeave[]> => { const { data } = await supabase.from('student_leaves').select('*').eq('parent_id', id).order('created_at', { ascending: false }); return data || []; };
export const fetchSchoolStudentLeaves = async (id: string): Promise<StudentLeave[]> => {
  const { data } = await supabase.from('student_leaves').select('*, students(name)').eq('school_id', id).order('created_at', { ascending: false });
  return (data || []).map((l: any) => ({ ...l, student_name: l.students?.name }));
};
export const updateStudentLeaveStatus = async (id: string, s: string, c: string): Promise<boolean> => { const { error } = await supabase.from('student_leaves').update({ status: s, principal_comment: c }).eq('id', id); return !error; };

// --- CURRICULUM SERVICES ---
export const fetchSchoolClasses = async (id: string) => { const { data } = await supabase.from('school_classes').select('*').eq('school_id', id).order('class_name'); return data || []; };
export const fetchClassSubjects = async (id: string) => { const { data } = await supabase.from('class_subjects').select('*').eq('class_id', id).order('subject_name'); return data || []; };
export const fetchSubjectLessons = async (id: string) => { const { data } = await supabase.from('subject_lessons').select('*').eq('subject_id', id).order('lesson_name'); return data || []; };
export const addSchoolClass = async (id: string, name: string) => { return await supabase.from('school_classes').insert([{ school_id: id, class_name: name }]); };
export const addClassSubject = async (id: string, name: string) => { return await supabase.from('class_subjects').insert([{ class_id: id, subject_name: name }]); };
export const addSubjectLesson = async (id: string, name: string) => { return await supabase.from('subject_lessons').insert([{ subject_id: id, lesson_name: name }]); };
export const fetchLessonHomework = async (id: string) => { const { data } = await supabase.from('lesson_homework').select('*').eq('lesson_id', id).order('created_at'); return data || []; };
export const addLessonHomework = async (id: string, t: string) => { return await supabase.from('lesson_homework').insert([{ lesson_id: id, homework_template: t }]); };
export const deleteLessonHomework = async (id: string) => { return await supabase.from('lesson_homework').delete().eq('id', id); };

// --- CORE DASHBOARD SERVICES ---
export const updateVehicleLocation = async (id: string, lat: number, lng: number): Promise<boolean> => {
  const { error } = await supabase.from('vehicles').update({ last_lat: lat, last_lng: lng, updated_at: new Date().toISOString() }).eq('driver_id', id);
  return !error;
};

export const fetchSchoolSummary = async (id: string): Promise<SchoolSummary | null> => {
  const { data: s } = await supabase.from('schools').select('name, school_code, total_periods').eq('id', id).single();
  if (!s) return null;
  const { data: p } = await supabase.from('users').select('name').eq('school_id', id).eq('role', 'principal').maybeSingle();
  const { count: t } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', id).eq('role', 'teacher');
  const { count: d } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', id).eq('role', 'driver');
  const { count: st } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', id);
  return { 
    school_name: s.name, 
    school_code: s.school_code, 
    principal_name: p?.name || 'Principal', 
    total_teachers: t || 0, 
    total_drivers: d || 0, 
    total_students: st || 0,
    total_periods: s.total_periods || 8 
  };
};

export const updateSchoolPeriods = async (schoolId: string, count: number): Promise<boolean> => {
    const { error } = await supabase.from('schools').update({ total_periods: count }).eq('id', schoolId);
    return !error;
};

export const fetchSchoolUserList = async (id: string, cat: string): Promise<SchoolUser[]> => {
  if (cat === 'students') {
     const { data } = await supabase.from('students').select('id, name, users(mobile)').eq('school_id', id).order('name');
     return (data || []).map((s: any) => ({ id: s.id, name: s.name, mobile: s.users?.mobile || 'No Contact' }));
  }
  const { data } = await supabase.from('users').select('id, name, mobile').eq('school_id', id).eq('role', cat === 'teachers' ? 'teacher' : 'driver').order('name');
  return data || [];
};

export const submitPeriodData = async (sc: string, mob: string, p: PeriodData, un: string, action: string): Promise<boolean> => {
  const schoolUUID = await getSchoolUUID(sc);
  if (!schoolUUID) return false;
  const { data: user } = await supabase.from('users').select('id').eq('mobile', mob).eq('school_id', schoolUUID).single();
  if (!user) return false;
  const { error } = await supabase.from('daily_periods').upsert({ 
    school_id: schoolUUID, teacher_user_id: user.id, date: getISTDate(), period_number: p.period_number, 
    class_name: p.class_name, subject: p.subject, lesson: p.lesson, homework: p.homework, homework_type: p.homework_type || 'Manual' 
  }, { onConflict: 'teacher_user_id,date,period_number' });
  return !error;
};

export const fetchParentHomework = async (sc: string, cn: string, s: string, sid: string, mob: string, date: string): Promise<ParentHomework[]> => {
  const schoolUUID = await getSchoolUUID(sc);
  if (!schoolUUID) return [];
  const { data: periods } = await supabase.from('daily_periods').select('*, users!teacher_user_id(name)').eq('school_id', schoolUUID).eq('class_name', cn).eq('date', date);
  const { data: subs = [] } = await supabase.from('homework_submissions').select('period_number, status').eq('student_id', sid).eq('date', date);
  return (periods || []).map((p: any) => ({
    id: p.id, period: `Period ${p.period_number}`, subject: p.subject, teacher_name: p.users?.name || 'Teacher', 
    homework: p.homework, homework_type: p.homework_type, status: subs?.find((s: any) => s.period_number === p.period_number)?.status || 'pending'
  }));
};

export const updateParentHomeworkStatus = async (sc: string, cn: string, s: string, sid: string, mob: string, p: string, sub: string, date: string): Promise<boolean> => {
  const pn = parseInt(p.replace(/\D/g, '')) || 1;
  const { error } = await supabase.from('homework_submissions').upsert({ student_id: sid, date: date, period_number: pn, status: 'completed' }, { onConflict: 'student_id,date,period_number' });
  return !error;
};

// --- ENHANCED AI CONTEXT DATA FETCHER ---
export const fetchAIContextData = async (
  role: Role, 
  schoolIdCode: string, 
  userId: string, 
  studentId?: string,
  className?: string
): Promise<string> => {
  const schoolUUID = await getSchoolUUID(schoolIdCode);
  if (!schoolUUID || !userId) return "System: No user context available.";
  
  const today = getISTDate();
  let contextParts: string[] = [`TODAY'S DATE: ${today}`];

  try {
    // 1. Fetch Latest Notices (Relevant to all)
    const { data: notices } = await supabase
      .from('notices')
      .select('title, message, category, date')
      .eq('school_id', schoolUUID)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (notices && notices.length > 0) {
      contextParts.push(`LATEST NOTICES:\n${notices.map(n => `- [${n.category.toUpperCase()}] ${n.title}: ${n.message} (For Date: ${n.date})`).join('\n')}`);
    }

    // 2. Role-specific Data (Leaves)
    if (role === 'teacher' || role === 'driver' || role === 'principal') {
        const { data: leaves } = await supabase
            .from('staff_leaves')
            .select('leave_type, start_date, end_date, status, principal_comment')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(2);
        if (leaves && leaves.length > 0) {
            contextParts.push(`YOUR LEAVE STATUS:\n${leaves.map(l => `- Type: ${l.leave_type}, Period: ${l.start_date} to ${l.end_date}, Status: ${l.status.toUpperCase()} (Note: ${l.principal_comment || 'None'})`).join('\n')}`);
        }
    }

    // 3. Role-specific Data (Homework & Attendance for Parents/Students)
    if ((role === 'parent' || role === 'student' as any) && studentId) {
        // Attendance
        const { data: att } = await supabase.from('attendance').select('status').eq('student_id', studentId).eq('date', today).maybeSingle();
        contextParts.push(`TODAY'S ATTENDANCE: ${att ? att.status.toUpperCase() : 'NOT MARKED YET'}.`);

        // Homework for their class
        if (className) {
            const { data: hw } = await supabase
                .from('daily_periods')
                .select('period_number, subject, homework, homework_type, users!teacher_user_id(name)')
                .eq('school_id', schoolUUID)
                .eq('class_name', className)
                .eq('date', today)
                .order('period_number');
            
            if (hw && hw.length > 0) {
                contextParts.push(`TODAY'S CLASS HOMEWORK (${className}):\n${hw.map(h => `- Period ${h.period_number} [${h.subject} by ${h.users?.name || 'Teacher'}]: ${h.homework} (Type: ${h.homework_type})`).join('\n')}`);
            } else {
                contextParts.push(`TODAY'S CLASS HOMEWORK: No homework has been uploaded for ${className} today yet.`);
            }
        }

        // Student Leaves
        const { data: sLeaves } = await supabase
            .from('student_leaves')
            .select('leave_type, start_date, status')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
            .limit(1);
        if (sLeaves && sLeaves.length > 0) {
            contextParts.push(`LATEST STUDENT LEAVE: ${sLeaves[0].leave_type} is ${sLeaves[0].status.toUpperCase()}.`);
        }
    }

    // 4. Role-specific Data (Teacher's own submissions)
    if (role === 'teacher') {
        const { data: myHw } = await supabase
            .from('daily_periods')
            .select('period_number, class_name, subject, homework')
            .eq('teacher_user_id', userId)
            .eq('date', today);
        if (myHw && myHw.length > 0) {
            contextParts.push(`YOUR SUBMISSIONS TODAY:\n${myHw.map(h => `- Period ${h.period_number} for ${h.class_name} (${h.subject}): ${h.homework}`).join('\n')}`);
        }
    }

  } catch (error) { 
    console.error("AI Context Fetch Error:", error);
    return "System: Unable to retrieve live school data at this moment."; 
  }

  return contextParts.join("\n\n");
};

// --- DASHBOARD DATA FETCH ---
export const fetchDashboardData = async ( sc: string, mob: string, role: Role, pw?: string, sid?: string ): Promise<DashboardData | null> => {
  try {
    const { data: school } = await supabase.from('schools').select('id, name, school_code, is_active, subscription_end_date, total_periods').ilike('school_code', sc.trim()).maybeSingle();
    if (!school) return null;
    let uQ = supabase.from('users').select('id, name, role, mobile, subscription_end_date').eq('school_id', school.id).eq('mobile', mob);
    if (pw) uQ = uQ.eq('password', pw);
    const { data: user } = await uQ.maybeSingle();
    if (!user) return null;

    const today = new Date(getISTDate() + "T00:00:00Z").getTime();
    const schoolActive = school.is_active && school.subscription_end_date && new Date(school.subscription_end_date + "T00:00:00Z").getTime() >= today;
    const userActive = user.subscription_end_date && new Date(user.subscription_end_date + "T00:00:00Z").getTime() >= today;

    const base: DashboardData = { 
        user_id: user.id, school_db_id: school.id, user_name: user.name, user_role: user.role as Role, 
        mobile_number: user.mobile, school_name: school.name, school_code: school.school_code, 
        subscription_status: (role === 'parent' || role === 'student' as any) ? (schoolActive && userActive ? 'active' : 'inactive') : (schoolActive ? 'active' : 'inactive'),
        school_subscription_status: schoolActive ? 'active' : 'inactive', 
        subscription_end_date: (role === 'parent' || role === 'student' as any) ? user.subscription_end_date : school.subscription_end_date,
        total_periods: school.total_periods || 8 
    };

    if (role === 'teacher') {
      const { data: ps } = await supabase.from('daily_periods').select('*').eq('school_id', school.id).eq('teacher_user_id', user.id).eq('date', getISTDate());
      return { ...base, periods: (ps || []).map((p: any) => ({ id: p.id, period_number: p.period_number, status: 'submitted', class_name: p.class_name, subject: p.subject, lesson: p.lesson, homework: p.homework, homework_type: p.homework_type })) };
    }

    if (role === 'parent') {
      const { data: kids } = await supabase.from('students').select('id, name, class_name, section').eq('parent_user_id', user.id);
      const target = sid ? kids?.find(k => k.id === sid) : kids?.[0];
      const { data: att } = await supabase.from('attendance').select('status').eq('student_id', target?.id).eq('date', getISTDate()).maybeSingle();
      return { ...base, student_id: target?.id, student_name: target?.name, class_name: target?.class_name, section: target?.section || '', today_attendance: (att?.status as any) || 'pending', siblings: kids || [] };
    }

    if (role === 'student' as any) {
      let { data: st } = await supabase.from('students').select('id, name, class_name, section, father_name, parent_user_id').eq('student_user_id', user.id).maybeSingle();
      if (!st) st = (await supabase.from('students').select('id, name, class_name, section, father_name, parent_user_id').eq('school_id', school.id).eq('name', user.name).maybeSingle()).data || null;
      if (st) {
        const { data: att = null } = await supabase.from('attendance').select('status').eq('student_id', st.id).eq('date', getISTDate()).maybeSingle();
        return { ...base, student_id: st.id, student_name: st.name, class_name: st.class_name, section: st.section || '', father_name: st.father_name, linked_parent_id: st.parent_user_id, today_attendance: (att?.status as any) || 'pending' };
      }
    }
    return base;
  } catch (error) { return null; }
};
