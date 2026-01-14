
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the supported languages and themes
type Language = 'en' | 'hi';
type Theme = 'light' | 'dark';

interface ThemeLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: string) => string;
}

// Comprehensive translation dictionary for the app
const translations: Record<string, Record<Language, string>> = {
  'principal': { en: 'Principal', hi: 'प्रधानाचार्य' },
  'teacher': { en: 'Teacher', hi: 'शिक्षक' },
  'parent': { en: 'Parent', hi: 'अभिभावक' },
  'admin': { en: 'Admin', hi: 'एडमिन' },
  'driver': { en: 'Driver', hi: 'ड्राइवर' },
  'school_id_placeholder': { en: 'School ID', hi: 'स्कूल आईडी' },
  'mobile_placeholder': { en: 'Mobile Number', hi: 'मोबाइल नंबर' },
  'password_placeholder': { en: 'Password', hi: 'पासवर्ड' },
  'login_to_system': { en: 'Login to System', hi: 'सिस्टम में लॉगिन करें' },
  'school_plan_inactive_teacher': { en: 'School plan is inactive. Please contact management or admin.', hi: 'स्कूल का प्लान सक्रिय नहीं है। कृपया प्रबंधन या एडमिन से संपर्क करें।' },
  'school_plan_inactive_parent': { en: 'School services are currently restricted. Contact management.', hi: 'स्कूल की सेवाएं फिलहाल प्रतिबंधित हैं। प्रबंधन से संपर्क करें।' },
  'parent_plan_required': { en: 'Personal subscription required to access this premium feature.', hi: 'इस प्रीमियम सुविधा का उपयोग करने के लिए व्यक्तिगत सब्सक्रिप्शन आवश्यक है।' },
  'upgrade_school_first': { en: 'Parent subscription becomes available after school activation.', hi: 'स्कूल सक्रिय होने के बाद ही अभिभावक सब्सक्रिप्शन उपलब्ध होगा।' },
  'access_restricted': { en: 'Access Restricted', hi: 'पहुंच प्रतिबंधित' },
  'system_administrator': { en: 'System Administrator', hi: 'सिस्टम एडमिनिस्ट्रेटर' },
  'secure_login_portal': { en: 'Secure Login Portal', hi: 'सुरक्षित लॉगिन पोर्टल' },
  'admin_mobile_placeholder': { en: 'Admin Mobile', hi: 'एडमिन मोबाइल' },
  'secret_code_placeholder': { en: 'Secret Code', hi: 'सीक्रेट कोड' },
  'verifying': { en: 'Verifying...', hi: 'सत्यापित कर रहा है...' },
  'syncing': { en: 'Syncing...', hi: 'सिंक हो रहा है...' },
  'admin_login': { en: 'Admin Login', hi: 'एडमिन लॉगिन' },
  'staff_mode': { en: 'Staff Mode', hi: 'स्टाफ मोड' },
  'admin_port': { en: 'Admin Portal', hi: 'एडमिन पोर्टल' },
  'about': { en: 'About', hi: 'के बारे में' },
  'help': { en: 'Help', hi: 'सहायता' },
  'settings': { en: 'Settings', hi: 'सेटिंग्स' },
  'choose_language': { en: 'Choose Language', hi: 'भाषा चुनें' },
  'english': { en: 'English', hi: 'अंग्रेजी' },
  'hindi': { en: 'Hindi', hi: 'हिंदी' },
  'choose_theme': { en: 'Choose Theme', hi: 'थीम चुनें' },
  'light': { en: 'Light', hi: 'लाइट' },
  'dark': { en: 'Dark', hi: 'डार्क' },
  'apply_changes': { en: 'Apply Changes', hi: 'बदलाव लागू करें' },
  'student_name': { en: 'Student Name', hi: 'छात्र का नाम' },
  'subscription_plan': { en: 'Subscription Plan', hi: 'सब्सक्रिप्शन प्लान' },
  'active_premium': { en: 'Active Premium', hi: 'सक्रिय प्रीमियम' },
  'plan_expired': { en: 'Plan Expired', hi: 'प्लान समाप्त' },
  'valid_till': { en: 'Valid Till', hi: 'तक मान्य' },
  'account_support': { en: 'Account & Support', hi: 'खाता और सहायता' },
  'contact_support': { en: 'Contact Support', hi: 'सहायता से संपर्क करें' },
  'system_info': { en: 'System Information', hi: 'सिस्टम जानकारी' },
  'attendance': { en: 'Attendance', hi: 'उपस्थिति' },
  'staff_leave': { en: 'Staff Leave', hi: 'स्टाफ अवकाश' },
  'attendance_status': { en: 'Attendance Status', hi: 'उपस्थिति की स्थिति' },
  'current': { en: 'Current', hi: 'वर्तमान' },
  'waiting': { en: 'Waiting', hi: 'प्रतीक्षा' },
  'present': { en: 'Present', hi: 'उपस्थित' },
  'absent': { en: 'Absent', hi: 'अनुपस्थित' },
  'leave': { en: 'Leave', hi: 'अवकाश' },
  'apply_leave': { en: 'Apply Leave', hi: 'अवकाश के लिए आवेदन करें' },
  'absence_request': { en: 'Absence Request', hi: 'अनुपस्थिति अनुरोध' },
  'live_transport': { en: 'Live Transport', hi: 'लाइव परिवहन' },
  'track_school_bus': { en: 'Track School Bus', hi: 'स्कूल बस ट्रैक करें' },
  'daily_tasks': { en: 'Daily Tasks', hi: 'दैनिक कार्य' },
  'view_periods': { en: 'View Periods', hi: 'पीरियड्स देखें' },
  'digital_register': { en: 'Digital Register', hi: 'डिजिटल रजिस्टर' },
  'apply_absence': { en: 'Apply Absence', hi: 'अनुपस्थिति लागू करें' },
  'publish_notice': { en: 'Publish Notice', hi: 'सूचना प्रकाशित करें' },
  'broadcast_alerts': { en: 'Broadcast Alerts', hi: 'ब्रॉडकास्ट अलर्ट' },
  'transport_tracking': { en: 'Transport Tracking', hi: 'परिवहन ट्रैकिंग' },
  'live_vehicle_map': { en: 'Live Vehicle Map', hi: 'लाइव वाहन मानचित्र' },
  'teacher_report': { en: 'Teacher Report', hi: 'शिक्षक रिपोर्ट' },
  'submission_status': { en: 'Submission Status', hi: 'सबमिशन स्थिति' },
  'homework_status': { en: 'Homework Status', hi: 'होमवर्क स्थिति' },
  'completion_report': { en: 'Completion Report', hi: 'पूर्णता रिपोर्ट' },
  'leave_portal': { en: 'Leave Portal', hi: 'अवकाश पोर्टल' },
  'staff': { en: 'Staff', hi: 'स्टाफ' },
  'students': { en: 'Students', hi: 'छात्र' },
  'global_attendance': { en: 'Global Attendance', hi: 'ग्लोबल उपस्थिति' },
  'digital_database': { en: 'Digital Database', hi: 'डिजिटल डेटाबेस' },
  'institution_info': { en: 'Institution Info', hi: 'संस्थान की जानकारी' },
  'management_head': { en: 'Management Head', hi: 'प्रबंधन प्रमुख' },
  'teachers': { en: 'Teachers', hi: 'शिक्षक' },
  'total_students': { en: 'Total Students', hi: 'कुल छात्र' },
  'drivers': { en: 'Drivers', hi: 'ड्राइवर' },
  'back_to_summary': { en: 'Back to Summary', hi: 'सारांश पर वापस' },
  'student_hub': { en: 'Student Hub', hi: 'छात्र हब' },
  'todays_schedule': { en: 'Today\'s Schedule', hi: 'आज का शेड्यूल' },
  'bus_route_tracker': { en: 'Bus Route Tracker', hi: 'बस रूट ट्रैकर' },
  'principal_portal': { en: 'Principal Portal', hi: 'प्रिंसिपल पोर्टल' },
  'sync': { en: 'Sync', hi: 'सिंक' },
  'period_history': { en: 'Period History', hi: 'पीरियड इतिहास' },
  'view_past_uploads': { en: 'View Past Uploads', hi: 'पिछले अपलोड देखें' },
  'select_date': { en: 'Select Date', hi: 'तारीख चुनें' },
  'choose_date_to_begin': { en: 'Choose date to begin', hi: 'शुरू करने के लिए तारीख चुनें' },
  'no_uploads_found': { en: 'No uploads found', hi: 'कोई अपलोड नहीं मिला' },
  'period': { en: 'Period', hi: 'पीरियड' },
  'todays_homework': { en: 'Today\'s Homework', hi: 'आज का होमवर्क' },
  'homework_details': { en: 'Homework Details', hi: 'होमवर्क विवरण' },
  'not_assigned': { en: 'Not Assigned', hi: 'असाइन नहीं किया गया' },
  'subject': { en: 'Subject', hi: 'विषय' },
  'not_specified': { en: 'Not Specified', hi: 'निर्दिष्ट नहीं' },
  'homework': { en: 'Homework', hi: 'होमवर्क' },
  'no_homework_uploaded': { en: 'No homework uploaded', hi: 'कोई होमवर्क अपलोड नहीं किया गया' },
  'mark_homework_completed': { en: 'Mark Completed', hi: 'पूरा हुआ चिह्नित करें' },
  'homework_assigned': { en: 'Homework Assigned', hi: 'होमवर्क असाइन किया गया' },
  'notifications': { en: 'Notifications', hi: 'सूचनाएं' },
  'recent_notices': { en: 'Recent Notices', hi: 'हाल की सूचनाएं' },
  'no_notices': { en: 'No Notices', hi: 'कोई सूचना नहीं' },
  'digital_attendance': { en: 'Digital Attendance', hi: 'डिजिटल उपस्थिति' },
  'submit_attendance': { en: 'Submit Attendance', hi: 'उपस्थिति सबमिट करें' },
  'teacher_analytics': { en: 'Teacher Analytics', hi: 'शिक्षक विश्लेषण' },
  'school_performance': { en: 'School Performance', hi: 'स्कूल प्रदर्शन' },
  'teachers_updated': { en: 'Teachers Updated', hi: 'शिक्षक अपडेट किए गए' },
  'teachers_pending': { en: 'Teachers Pending', hi: 'शिक्षक लंबित' },
  'periods_updated': { en: 'Periods Updated', hi: 'पीरियड्स अपडेट किए गए' },
  'teacher_list': { en: 'Teacher List', hi: 'शिक्षक सूची' },
  'parents_analytics': { en: 'Parents Analytics', hi: 'अभिभावक विश्लेषण' },
  'student_report': { en: 'Student Report', hi: 'छात्र रिपोर्ट' },
  'fully_completed': { en: 'Fully Completed', hi: 'पूरी तरह से पूर्ण' },
  'pending_work': { en: 'Pending Work', hi: 'लंबित कार्य' },
  'view_records': { en: 'View Records', hi: 'रिकॉर्ड देखें' },
  'schools_tab': { en: 'Schools', hi: 'स्कूल' },
  'users_tab': { en: 'Users', hi: 'उपयोगकर्ता' },
  'transport_tab': { en: 'Transport', hi: 'परिवहन' },
  'quick_search': { en: 'Quick Search', hi: 'त्वरित खोज' },
  'no_entries': { en: 'No entries', hi: 'कोई प्रविष्टि नहीं' },
  'expires': { en: 'Expires', hi: 'समाप्त' },
  'active': { en: 'Active', hi: 'सक्रिय' },
  'blocked': { en: 'Blocked', hi: 'ब्लॉक' },
  'expired': { en: 'Expired', hi: 'समाप्त' },
  'total_schools': { en: 'Total Schools', hi: 'कुल स्कूल' },
  'total_users': { en: 'Total Users', hi: 'कुल उपयोगकर्ता' },
  'active_schools': { en: 'Active Schools', hi: 'सक्रिय स्कूल' },
  'active_users': { en: 'Active Users', hi: 'सक्रिय उपयोगकर्ता' },
  'logout': { en: 'Logout', hi: 'लॉगआउट' },
  'template_custom': { en: 'Custom', hi: 'कस्टम' },
  'template_holiday': { en: 'Holiday', hi: 'अवकाश' },
  'template_ptm': { en: 'PTM', hi: 'पीटीएम' },
  'select_template': { en: 'Select Template', hi: 'टेम्पलेट चुनें' },
  'notice_message': { en: 'Notice Message', hi: 'सूचना संदेश' },
  'choose_action': { en: 'Choose Action', hi: 'कार्रवाई चुनें' },
  'make_call': { en: 'Make Call', hi: 'कॉल करें' },
  'open_chat': { en: 'Open Chat', hi: 'चैट खोलें' },
  'email_us': { en: 'Email Us', hi: 'हमें ईमेल करें' },
  'whatsapp_only': { en: 'WhatsApp Only', hi: 'केवल व्हाट्सएप' },
  'call_whatsapp': { en: 'Call / WhatsApp', hi: 'कॉल / व्हाट्सएप' },
};

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local storage or defaults
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('vidyasetu_lang') as Language) || 'en');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('vidyasetu_theme') as Theme) || 'light');

  useEffect(() => {
    localStorage.setItem('vidyasetu_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('vidyasetu_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <ThemeLanguageContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) throw new Error('useThemeLanguage must be used within ThemeLanguageProvider');
  return context;
};
