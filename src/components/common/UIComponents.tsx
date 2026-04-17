import React from "react";

interface StatusBadgeProps {
  status: "Uncategorized" | "Pending Publish" | "Published" | "Live" | "Google Play" | "App Store";
  size?: "sm" | "md";
}

export const StatusBadge = ({ status, size = "md" }: StatusBadgeProps) => {
  const styles: Record<string, string> = {
    Uncategorized: "bg-[#fffbeb] text-[#92400e] border-[#fef3c7]",
    "Pending Publish": "bg-[#eff6ff] text-[#1e40af] border-[#dbeafe]",
    "Unpublished": "bg-[#eff6ff] text-[#1e40af] border-[#dbeafe]",
    Published: "bg-[#ecfdf5] text-[#065f46] border-[#d1fae5]",
    Live: "bg-[#ecfdf5] text-[#065f46] border-[#d1fae5]",
    "Google Play": "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]",
    "App Store": "bg-[#f8fafc] text-[#475569] border-[#e2e8f0]",
  };

  return (
    <span className={`inline-flex items-center font-bold border rounded-[4px] uppercase tracking-wide ${styles[status] || styles.Uncategorized} ${
      size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
    }`}>
      {status === "Pending Publish" ? "Pending" : status}
    </span>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  type?: "button" | "submit" | "reset";
}

export const Button = ({ 
  children, 
  variant = "primary", 
  isLoading, 
  className = "", 
  disabled, 
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md px-4 py-2 text-[13px]";
  
  const variants = {
    primary: "bg-utility-accent text-white hover:bg-utility-accent-hover border-none",
    secondary: "bg-utility-sidebar text-white hover:opacity-90",
    outline: "bg-white text-utility-text border border-utility-border hover:bg-slate-50",
    danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
    ghost: "bg-transparent text-utility-muted hover:bg-slate-100 hover:text-utility-text",
  };

  return (
    <button 
      disabled={disabled || isLoading} 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : children}
    </button>
  );
};
