import { Link } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';

const TopBar = () => {
  return (
    <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-xl z-50 border-b border-vynk-border flex items-center justify-between px-4">
      <Link to="/feed" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-vynk-primary to-vynk-secondary shadow-md"></div>
        <span className="text-xl font-bold tracking-tight text-vynk-text">Vynk</span>
      </Link>
      <div className="flex items-center gap-4 text-vynk-text">
        <button className="hover:text-vynk-primary transition-colors"><Search size={22} /></button>
        <Link to="/notifications" className="hover:text-vynk-primary transition-colors"><Bell size={22} /></Link>
      </div>
    </div>
  );
};

export default TopBar;
