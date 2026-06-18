import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');

    setIsLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, form);
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-vynk-bg via-vynk-bg-2 to-vynk-bg px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-vynk-primary to-vynk-secondary flex items-center justify-center mb-4">
            <Lock size={24} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold text-vynk-text mb-2">Reset Password</h1>
          <p className="text-vynk-muted text-sm mb-6">Choose a new password for your account.</p>

          {done ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <p className="font-bold text-vynk-text mb-2">Password Reset!</p>
              <p className="text-sm text-vynk-muted">Redirecting to login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-vynk-text mb-1 block">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="glass-input w-full pr-10"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-vynk-muted">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-vynk-text mb-1 block">Confirm Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  className="glass-input w-full"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                />
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex justify-center items-center gap-2">
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>

              <Link to="/login" className="text-center text-sm text-vynk-muted hover:text-vynk-text transition-colors">
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
