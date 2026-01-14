
import React from 'react';
import { ParentHomework, DashboardData, LoginRequest } from '../types';
import { Modal } from './Modal';
import { ParentHomeworkSection } from './ParentHomeworkSection';
import { RefreshCw, BookOpen } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface HomeworkListModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData: DashboardData | null;
  credentials: LoginRequest;
  isSubscribed: boolean;
  onLockClick: () => void;
  onViewHomework: (hw: ParentHomework) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  refreshTrigger: number;
}

export const HomeworkListModal: React.FC<HomeworkListModalProps> = ({
  isOpen,
  onClose,
  dashboardData,
  credentials,
  isSubscribed,
  onLockClick,
  onViewHomework,
  onRefresh,
  isRefreshing,
  refreshTrigger
}) => {
  const { t } = useThemeLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('todays_homework')}>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-[#2ECC71]" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">8 Academic Periods</span>
            </div>
            <button 
                onClick={onRefresh} 
                disabled={isRefreshing}
                className={`flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-xl text-[10px] font-black text-[#2ECC71] active:scale-90 transition-all ${isRefreshing ? 'opacity-50' : ''}`}
            >
                <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'SYNCING' : 'REFRESH'}
            </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
            <ParentHomeworkSection 
                refreshTrigger={refreshTrigger} 
                dashboardData={dashboardData} 
                credentials={credentials} 
                isSubscribed={isSubscribed} 
                onLockClick={onLockClick} 
                onViewHomework={onViewHomework} 
            />
        </div>

        <div className="pt-2">
            <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-widest italic opacity-60">
              "Select a period to see detailed tasks"
            </p>
        </div>
      </div>
    </Modal>
  );
};
