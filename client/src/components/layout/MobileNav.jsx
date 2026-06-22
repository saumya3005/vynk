import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, MessageSquare, User, Search } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import GlobalCreateDropdown from '../ui/GlobalCreateDropdown';

const MobileNav = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/feed' },
    { icon: Compass, path: '/explore' },
    { special: true }, // Create dropdown
    { icon: MessageSquare, path: '/chat' },
    { icon: User, path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-xl border-t border-border z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item, idx) => {
          if (item.special) {
            return (
              <div key={idx} className="flex flex-col items-center justify-center -mt-6">
                <GlobalCreateDropdown isMobile={true} />
              </div>
            );
          }
          
          const isActive = location.pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path);
          
          return (
            <Link key={idx} to={item.path} className="flex flex-col items-center justify-center w-12 h-12 relative group">
              <item.icon 
                size={26} 
                className={`transition-all duration-200 ${isActive ? 'text-primary scale-110' : 'text-muted group-hover:text-text'}`} 
              />
              {isActive && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"></div>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
