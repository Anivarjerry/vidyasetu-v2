
import React from 'react';
import { Role } from '../types';
import { Button } from './Button';
import { ShieldCheck, MessageSquare, CreditCard, ExternalLink } from 'lucide-react';

interface SubscriptionModalProps {
  role: Role;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ role }) => {
  const upiId = "7737080094@ybl";
  const merchantName = "VidyaSetuAI";

  const getPlans = () => {
    if (role === 'principal' || role === 'admin') {
      return [
        { label: 'Monthly School Premium', amount: 1000, duration: 'Month' },
        { label: 'Yearly School Premium', amount: 10000, duration: 'Year' },
      ];
    } else if (role === 'parent' || role === 'student' as any) {
      return [
        { label: 'Monthly Student Plan', amount: 80, duration: 'Month' },
        { label: 'Yearly Student Plan', amount: 850, duration: 'Year' },
      ];
    }
    return [];
  };

  const handlePayment = (amount: number) => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=VidyaSetuAI_Sub_${role}`;
    window.location.href = upiUrl;
  };

  const plans = getPlans();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex justify-center items-center w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 mb-2 shadow-inner">
           <ShieldCheck size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Choose Your Plan</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-4">
          Activate premium access for <span className="text-brand-500 font-bold">VidyaSetu AI</span> to unlock smart tracking & management.
        </p>
      </div>

      <div className="grid gap-3">
        {plans.map((plan, index) => (
          <button
            key={index}
            onClick={() => handlePayment(plan.amount)}
            className="flex justify-between items-center w-full p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-3xl hover:border-brand-500 transition-all group active:scale-95 shadow-sm"
          >
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plan.duration}ly Access</p>
              <p className="font-black text-slate-800 dark:text-white group-hover:text-brand-500 transition-colors uppercase tracking-tight">{plan.label}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-brand-500">₹{plan.amount}</span>
              <div className="p-2 bg-slate-50 dark:bg-slate-700 rounded-lg text-slate-400 group-hover:text-brand-500">
                <ExternalLink size={16} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-brand-50 dark:bg-brand-500/10 p-5 rounded-3xl border border-brand-100 dark:border-brand-500/20 space-y-3">
        <div className="flex items-center gap-3 text-brand-600 dark:text-brand-400 font-black text-[10px] uppercase tracking-widest">
           <MessageSquare size={18} />
           Important Instructions
        </div>
        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-bold leading-relaxed italic">
          "पेमेंट करने के बाद **Help** सेक्शन में जाकर **WhatsApp** पर स्क्रीनशॉट भेजें, एडमिन 5 मिनट में आपकी पेमेंट अपडेट कर देगा।"
        </p>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-50">
           Secure UPI Transaction • VidyaSetu AI
        </p>
      </div>
    </div>
  );
};
