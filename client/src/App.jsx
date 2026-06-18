import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
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
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
          
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
          
          <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/notes/upload" element={<ProtectedRoute><UploadNotes /></ProtectedRoute>} />
          
          <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
          <Route path="/communities/:id" element={<ProtectedRoute><CommunityDetails /></ProtectedRoute>} />
          
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/recruiter" element={<ProtectedRoute><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
