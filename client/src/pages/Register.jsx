import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Student'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData, {
        withCredentials: true
      });
      console.log('Registered:', res.data);
      // Navigate to home feed
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-linear-to-tr from-vynk-mint to-vynk-peach mx-auto mb-4"></div>
          <h2 className="text-3xl font-bold text-vynk-charcoal">Join Vynk</h2>
          <p className="text-vynk-charcoal/60 mt-2">Create an account to start connecting</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-vynk-charcoal/80">Username</label>
            <input 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username" 
              className="glass-input"
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-vynk-charcoal/80">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email" 
              className="glass-input"
              required 
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-vynk-charcoal/80">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password" 
              className="glass-input"
              required 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-vynk-charcoal/80">I am a...</label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="glass-input appearance-none"
            >
              <option value="Student">Student</option>
              <option value="Developer">Developer</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Teacher">Teacher</option>
              <option value="Creator">Content Creator</option>
              <option value="Professional">Professional</option>
            </select>
          </div>

          <button type="submit" className="btn-primary mt-4 flex justify-center items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-vynk-charcoal/60 mt-8">
          Already have an account? <Link to="/login" className="text-vynk-lavender font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
