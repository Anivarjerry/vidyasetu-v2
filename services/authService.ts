
import { LoginRequest, LoginResponse, Role } from '../types';
import { supabase } from './supabaseClient';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      if (result.error && (result.error.message?.includes('fetch') || result.error.message?.includes('network'))) {
        throw result.error;
      }
      return result;
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(delay);
    }
  }
};

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    // Check if browser is offline
    if (!navigator.onLine) {
      return { status: 'error', message: 'You are offline. Please check your internet connection.' };
    }

    // --- ADMIN LOGIN LOGIC ---
    if (credentials.secret_code && credentials.secret_code.trim() !== '') {
      console.log("Connecting to Supabase for Admin login...");
      
      let adminData, adminError;
      
      try {
          const result = await fetchWithRetry(() => 
            supabase
            .from('admins')
            .select('*')
            .eq('mobile', credentials.mobile)
            .eq('secret_code', credentials.secret_code)
            .maybeSingle()
          );
          adminData = result.data;
          adminError = result.error;
      } catch (err: any) {
          adminError = err;
      }

      if (adminError) {
        console.error("Supabase Admin Login Error:", JSON.stringify(adminError, null, 2));
        
        // Specific check for fetch failures or missing tables
        if (adminError.message?.includes('fetch') || adminError.code === '') {
          return { 
            status: 'error', 
            message: 'Connection Failed: ISP blocking, AdBlocker active, or Supabase Project Paused. Check console.' 
          };
        }
        if (adminError.code === '42P01') {
             return { status: 'error', message: 'System Error: Admins table not found.' };
        }
        
        return { status: 'error', message: `Database Error: ${adminError.message}` };
      }

      if (!adminData) {
        return { status: 'error', message: 'Invalid Admin Credentials' };
      }

      return {
        status: 'success',
        role: 'admin',
        user_role: 'admin',
        user_name: adminData.name,
        user_id: adminData.id
      };
    }

    // --- NORMAL USER LOGIN LOGIC ---
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, is_active, subscription_end_date')
      .eq('school_code', credentials.school_id)
      .maybeSingle();

    if (schoolError) {
        console.error("School Fetch Error:", JSON.stringify(schoolError, null, 2));
        if (schoolError.message?.includes('fetch')) {
             return { status: 'error', message: 'Network Error: Cannot reach server. Disable AdBlocker or check connection.' };
        }
        return { status: 'error', message: `School lookup failed: ${schoolError.message}` };
    }

    if (!schoolData) {
      return { status: 'error', message: 'Invalid School Code' };
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, role, subscription_end_date')
      .eq('school_id', schoolData.id)
      .eq('mobile', credentials.mobile)
      .eq('password', credentials.password)
      .maybeSingle();

    if (userError) {
        console.error("User Fetch Error:", JSON.stringify(userError, null, 2));
        return { status: 'error', message: `User lookup failed: ${userError.message}` };
    }

    if (!userData) {
      return { status: 'error', message: 'Invalid Mobile Number or Password' };
    }

    return {
      status: 'success',
      message: 'Login Successful',
      role: userData.role as Role,
      user_role: userData.role as Role,
      user_name: userData.name,
      user_id: userData.id,
      school_db_id: schoolData.id
    };

  } catch (error: any) {
    console.error("Critical Exception:", error);
    return { status: 'error', message: error.message || 'Unexpected network error.' };
  }
};

export const updateUserToken = async (userId: string, token: string) => {
  try {
    await supabase
      .from('users')
      .update({ fcm_token: token })
      .eq('id', userId);
  } catch (error) {}
};
