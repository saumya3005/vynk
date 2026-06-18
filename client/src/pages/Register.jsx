import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use login (not register) to update context
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Student'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', formData);
      console.log('Register response:', res.data);
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome to Vynk 🎉');
      navigate('/feed');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-vynk-bg-1 to-vynk-bg-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-vynk-secondary to-vynk-primary mx-auto mb-4 flex items-center justify-center">
            <UserPlus size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-vynk-text">Join Vynk</h2>
          <p className="text-vynk-muted mt-2">Create your account to start connecting</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-vynk-text/80">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="glass-input"
              required
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-vynk-text/80">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="glass-input"
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-vynk-text/80">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 chars)"
              className="glass-input"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-vynk-text/80">I am a...</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="glass-input appearance-none cursor-pointer"
            >
              <option value="Student">Student</option>
              <option value="Developer">Developer</option>
              <option value="Recruiter">Recruiter</option>
              <option value="Teacher">Teacher</option>
              <option value="Creator">Content Creator</option>
              <option value="Professional">Professional</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary mt-4 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-vynk-muted mt-8">
          Already have an account? <Link to="/login" className="text-vynk-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
