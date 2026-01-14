
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-2xl font-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.1em] text-xs h-12 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-xl shadow-brand-500/20 border-none",
    outline: "border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white",
    secondary: "bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white border-none",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/20 border-none"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
