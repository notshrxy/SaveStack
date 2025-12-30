
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={22} className="text-black stroke-[3px]" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search your brain..."
          className="w-full bg-[#FAF5E9] border-4 border-black rounded-xl pl-14 pr-6 py-4 font-bold text-lg uppercase tracking-tight placeholder:text-black/30 outline-none search-shadow transition-all focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none"
        />
      </div>
    </div>
  );
};

export default SearchBar;
