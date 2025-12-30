
import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "btn-hover-effect font-black uppercase tracking-widest border-4 border-black transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-2 select-none";
  
  // Isometric block shadows for buttons
  const blockShadow = "shadow-[1px_1px_0px_black,2px_2px_0px_black,3px_3px_0px_black,4px_4px_0px_black]";
  const hoverState = "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_black,2px_2px_0px_black,3px_3px_0px_black]";

  const variants = {
    primary: `bg-purple-500 text-white ${blockShadow} ${hoverState} hover:bg-purple-600`,
    secondary: `bg-white text-black ${blockShadow} ${hoverState} hover:bg-gray-50`,
    danger: `bg-red-500 text-white ${blockShadow} ${hoverState} hover:bg-red-600`
  };

  const sizes = {
    sm: "px-4 py-2 text-xs border-2 shadow-[1px_1px_0px_black,2px_2px_0px_black] active:translate-x-[2px] active:translate-y-[2px]",
    md: "px-8 py-4 text-sm",
    lg: "px-10 py-6 text-xl"
  };

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default NeoButton;
