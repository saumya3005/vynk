import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      console.log('Logged in:', res.data);
      login(res.data.token, res.data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
          <div className="w-12 h-12 rounded-full bg-linear-to-tr from-vynk-peach to-vynk-lavender mx-auto mb-4"></div>
          <h2 className="text-3xl font-bold text-vynk-charcoal">Welcome back</h2>
          <p className="text-vynk-charcoal/60 mt-2">Enter your details to access your account</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-vynk-charcoal/80">Password</label>
              <a href="#" className="text-xs text-vynk-coral hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="glass-input"
              required
            />
          </div>

          <button type="submit" className="btn-primary mt-4 flex justify-center items-center gap-2">
            <LogIn className="w-5 h-5" />
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-vynk-charcoal/60 mt-8">
          Don't have an account? <Link to="/register" className="text-vynk-coral font-medium hover:underline">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
