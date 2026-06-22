import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import TopBar from './TopBar';
import VynkAI from '../ui/VynkAI';

const AppShell = () => {
  return (
    <div className="w-full min-h-screen flex flex-col bg-bg">
      {/* Global top bar — always visible at top */}
      <TopBar />

      {/* Body below topbar */}
      <div className="flex flex-1 pt-16">
        {/* Left Sidebar — Desktop only, sits below topbar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 md:ml-64 lg:mr-80 min-h-[calc(100vh-4rem)] pb-20 md:pb-0 overflow-x-hidden">
          <main className="w-full h-full max-w-4xl mx-auto px-4 md:px-6 py-6">
            <Outlet />
          </main>
        </div>

        {/* Right Sidebar — Large desktop only */}
        <RightSidebar />
      </div>

      {/* Floating elements */}
      <VynkAI />
      <MobileNav />
    </div>
  );
};

export default AppShell;
