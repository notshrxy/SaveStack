
import React from 'react';

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  color?: string;
  className?: string;
  hoverEffect?: boolean;
}

const NeoCard: React.FC<NeoCardProps> = ({ 
  children, 
  color = 'bg-white', 
  className = '', 
  hoverEffect = false,
  ...props
}) => {
  // Creating the isometric "block" depth using stacked hard shadows
  // This simulates a solid side profile
  const blockShadow = "shadow-[1px_1px_0px_black,2px_2px_0px_black,3px_3px_0px_black,4px_4px_0px_black,5px_5px_0px_black,6px_6px_0px_black]";
  const hoverShadow = "hover:shadow-[1px_1px_0px_black,2px_2px_0px_black,3px_3px_0px_black] hover:translate-x-[3px] hover:translate-y-[3px]";

  return (
    <div 
      {...props}
      className={`
        ${color} 
        border-4 border-black 
        ${blockShadow}
        ${hoverEffect ? `${hoverShadow} cursor-pointer` : ''}
        transition-all duration-150 ease-out
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default NeoCard;
