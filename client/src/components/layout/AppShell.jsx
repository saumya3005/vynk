import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import VynkAI from '../ui/VynkAI';

const AppShell = () => {
  return (
    <div className="w-full min-h-screen flex bg-vynk-bg-1">
      <Sidebar />
      <div className="flex-1 md:ml-64 lg:mr-80 min-h-screen relative">
        <main className="w-full h-full">
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
