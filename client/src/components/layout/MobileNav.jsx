import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, PlusSquare, MessageSquare, User } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const MobileNav = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { icon: Home, path: '/feed' },
    { icon: Compass, path: '/explore' },
    { icon: PlusSquare, path: '/create', special: true },
    { icon: MessageSquare, path: '/chat' },
    { icon: User, path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-vynk-border z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item, idx) => {
          const isActive = location.pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : item.path);
          
          if (item.special) {
            return (
              <Link key={idx} to={item.path} className="flex flex-col items-center justify-center -mt-6">
                <div className="w-12 h-12 rounded-full bg-linear-to-tr from-vynk-primary to-vynk-secondary flex items-center justify-center text-white shadow-lg shadow-vynk-primary/30">
                  <item.icon size={24} />
                </div>
              </Link>
            );
          }
          
          return (
            <Link key={idx} to={item.path} className="flex flex-col items-center justify-center w-12 h-12 relative group">
              <item.icon 
                size={26} 
                className={`transition-all duration-200 ${isActive ? 'text-vynk-primary scale-110' : 'text-vynk-muted group-hover:text-vynk-text'}`} 
              />
              {isActive && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-vynk-primary"></div>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
