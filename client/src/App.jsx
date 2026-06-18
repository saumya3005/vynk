import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import Feed from './pages/Feed';
import Reels from './pages/Reels';
import Stories from './pages/Stories';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import ProjectDetails from './pages/ProjectDetails';
import Notes from './pages/Notes';
import UploadNotes from './pages/UploadNotes';
import Communities from './pages/Communities';
import CommunityDetails from './pages/CommunityDetails';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Dashboard from './pages/Dashboard';

function App() {
  const location = useLocation();

  return (
    <div className="w-full min-h-screen flex flex-col">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected App Routes inside AppShell */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/explore" element={<Explore />} />
            
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/create" element={<CreateProject />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            
            <Route path="/notes" element={<Notes />} />
            <Route path="/notes/upload" element={<UploadNotes />} />
            
            <Route path="/communities" element={<Communities />} />
            <Route path="/communities/:id" element={<CommunityDetails />} />
            
            <Route path="/chat" element={<Chat />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Future Overhaul Routes */}
            <Route path="/stories" element={<Stories />} />
            <Route path="/reels" element={<Reels />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;
