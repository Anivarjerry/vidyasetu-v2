
import React, { useState } from 'react';
import { DashboardData, LoginRequest, ParentHomework } from '../types';
import { fetchParentHomework } from '../services/dashboardService';
import { X, Search, Calendar, BookOpen } from 'lucide-react';
import { Button } from './Button';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface HomeworkHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData: DashboardData;
  credentials: LoginRequest;
}

export const HomeworkHistoryModal: React.FC<HomeworkHistoryModalProps> = ({
  isOpen,
  onClose,
  dashboardData,
  credentials
}) => {
  useModalBackHandler(isOpen, onClose);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [homeworkList, setHomeworkList] = useState<ParentHomework[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    setHasSearched(true);
    setHomeworkList([]); 
    
    const data = await fetchParentHomework(
      credentials.school_id,
      dashboardData.class_name || '',
      dashboardData.section || '',
      dashboardData.student_id || '',
      credentials.mobile,
      selectedDate
    );

    setHomeworkList(data);
    setLoading(false);
  };

  const getHomeworkForPeriod = (periodNum: number): ParentHomework => {
    const periodLabel = `Period ${periodNum}`;
    const found = homeworkList.find(h => {
        if (!h.period) return false;
        const apiPeriod = h.period.toLowerCase().replace(/\s+/g, ' ').trim();
        const targetPeriod = periodLabel.toLowerCase();
        
        return apiPeriod === targetPeriod || 
               h.period == periodNum.toString() ||
               apiPeriod === periodNum.toString(); 
    });
    
    if (found) return found;

    return {
      period: periodLabel,
      subject: '',
      teacher_name: '',
      homework: '',
      status: 'pending'
    };
  };

  // Generate periods based on school configuration
  const getPeriodsArray = () => {
    const count = dashboardData?.total_periods || 8;
    return Array.from({ length: count }, (_, i) => i + 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Homework History</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">View past assignments</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-3 transition-colors">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Select Date</label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Calendar size={18} />
                    </div>
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent outline-none transition-colors"
                    />
                </div>
                <Button onClick={handleSearch} disabled={loading || !selectedDate} className="px-5 shadow-lg shadow-green-100 dark:shadow-none">
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Search size={20} />
                    )}
                </Button>
            </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
            {!hasSearched ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600 space-y-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-500">
                        <BookOpen size={32} />
                    </div>
                    <p className="text-sm">Select a date to view homework</p>
                </div>
            ) : (
                <div className="space-y-3 pb-6">
                    {getPeriodsArray().map((num) => {
                        const hw = getHomeworkForPeriod(num);
                        const hasContent = hw.homework && 
                                         hw.homework.trim() !== '' && 
                                         hw.homework !== 'No homework uploaded' &&
                                         hw.homework.toLowerCase() !== 'empty';

                        return (
                            <div key={num} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center text-xs font-bold">{num}</span>
                                        <span className="font-bold text-gray-800 dark:text-white text-sm">Period {num}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${hasContent ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                                        {hw.subject && hw.subject.toLowerCase() !== 'empty' ? hw.subject : 'No Subject'}
                                    </span>
                                </div>
                                
                                <div className={`text-sm rounded-lg p-3 border ${hasContent ? 'bg-green-50/30 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 text-gray-700 dark:text-gray-200' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500 italic'}`}>
                                    {hasContent ? hw.homework : 'No homework data found.'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
