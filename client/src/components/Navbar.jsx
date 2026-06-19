import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, Compass, Briefcase, BookOpen, Users, MessageSquare, Bell, LayoutDashboard, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="glass-card fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 px-6 py-3 flex justify-between items-center">
      <Link to="/feed" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-peach to-lavender"></div>
        <span className="text-xl font-bold tracking-tight text-charcoal hidden md:block">Vynk</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/feed" className="text-charcoal/70 hover:text-coral transition-colors" title="Feed"><Home size={22} /></Link>
        <Link to="/explore" className="text-charcoal/70 hover:text-peach transition-colors" title="Explore"><Compass size={22} /></Link>
        <Link to="/projects" className="text-charcoal/70 hover:text-lavender transition-colors" title="Projects"><Briefcase size={22} /></Link>
        <Link to="/notes" className="text-charcoal/70 hover:text-lilac transition-colors" title="Notes"><BookOpen size={22} /></Link>
        <Link to="/communities" className="text-charcoal/70 hover:text-mint transition-colors" title="Communities"><Users size={22} /></Link>
        <Link to="/chat" className="text-charcoal/70 hover:text-coral transition-colors" title="Messages"><MessageSquare size={22} /></Link>
        <Link to="/notifications" className="text-charcoal/70 hover:text-peach transition-colors" title="Notifications"><Bell size={22} /></Link>
        
        {user?.role === 'Recruiter' && (
          <Link to="/recruiter" className="text-charcoal/70 hover:text-lavender transition-colors" title="Recruiter Dashboard"><LayoutDashboard size={22} /></Link>
        )}
        
        <Link to="/dashboard" className="text-charcoal/70 hover:text-lilac transition-colors" title="Dashboard"><LayoutDashboard size={22} /></Link>
        <Link to="/profile" className="text-charcoal/70 hover:text-mint transition-colors" title="Profile"><User size={22} /></Link>
        
        <button onClick={handleLogout} className="text-charcoal/70 hover:text-red-500 transition-colors ml-4" title="Logout">
          <LogOut size={22} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
