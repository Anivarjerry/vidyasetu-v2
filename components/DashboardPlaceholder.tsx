import React from 'react';
import { Role } from '../types';
import { Construction } from 'lucide-react';

interface DashboardPlaceholderProps {
  role: Role;
}

export const DashboardPlaceholder: React.FC<DashboardPlaceholderProps> = ({ role }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 space-y-6">
        <div className="w-20 h-20 bg-[#2ECC71]/10 rounded-full flex items-center justify-center mx-auto text-[#2ECC71]">
          <Construction size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800">Welcome!</h1>
        
        <div className="space-y-2">
            <p className="text-gray-600">
            You are logged in as <span className="font-semibold text-[#2ECC71] capitalize">{role}</span>.
            </p>
            <p className="text-gray-500 text-sm">
            Dashboard will be available soon.
            </p>
        </div>

        <div className="pt-4 text-xs text-gray-400">
            VidyaSetu AI • Phase 1
        </div>
      </div>
    </div>
  );
};
