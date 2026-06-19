import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import TopBar from './TopBar';
import VynkAI from '../ui/VynkAI';

const AppShell = () => {
  return (
    <div className="w-full min-h-screen flex bg-bg">
      <Sidebar />
      <TopBar />
      <div className="flex-1 md:ml-64 lg:mr-80 min-h-screen relative pt-16 md:pt-0 pb-20 md:pb-0">
        <main className="w-full h-full max-w-4xl mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Global AI Assistant */}
      <VynkAI />

      {/* Right Sidebar (Desktop only) */}
      <RightSidebar />
      <MobileNav />
    </div>
  );
};

export default AppShell;
