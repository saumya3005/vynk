import { useState, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Loader, EyeOff, Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  // 2FA State
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleOtpChange = (index, val) => {
    if (!/^[0-9]*$/.test(val)) return;
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);
    if (val !== '' && index < 5) otpRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpCode[index] === '' && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', formData);
      if (res.data.requires2FA) {
        setRequires2FA(true);
        setUserId(res.data.userId);
        toast('Enter your 2FA code', { icon: '🔐' });
        // Dev log
        if (res.data.devCode) console.log('DEV 2FA CODE:', res.data.devCode);
      } else {
        login(res.data.token, res.data.user);
        toast.success('Welcome back to Vynk! 🎉');
        navigate('/feed');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length < 6) return toast.error('Enter 6-digit code');
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-2fa', { userId, code });
      login(res.data.token, res.data.user);
      toast.success('Welcome back! 🎉');
      navigate('/feed');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid code.';
      setError(message);
      toast.error(message);
      setOtpCode(['', '', '', '', '', '']);
      otpRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-vynk-bg-1">
      {/* Left Hero — hidden on mobile */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-vynk-text">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-vynk-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-vynk-accent/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-vynk-secondary/20 rounded-full blur-3xl animate-pulse delay-500" />

        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center px-12">
          <h1 className="text-6xl font-black text-white tracking-tight mb-4">
            Welcome back<span className="text-vynk-primary">.</span>
          </h1>
          <p className="text-xl text-white/60 font-light leading-relaxed max-w-md mx-auto">
            Log in to continue building and connecting with the Vynk community.
          </p>
        </motion.div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-black text-vynk-text">Vynk<span className="text-vynk-primary">.</span></h1>
          </div>

          <div className="bg-white/75 backdrop-blur-xl border border-vynk-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!requires2FA ? (
                <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <h2 className="text-2xl font-bold text-vynk-text mb-1">Sign in</h2>
                  <p className="text-vynk-muted text-sm mb-6">Enter your details to access your account</p>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-vynk-text/70">Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl bg-vynk-bg-1 border border-vynk-border text-vynk-text text-sm focus:outline-none focus:ring-2 focus:ring-vynk-primary/30 focus:border-vynk-primary transition-all" required autoComplete="email" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-vynk-text/70">Password</label>
                        <Link to="/forgot-password" className="text-xs text-vynk-primary hover:underline font-medium">Forgot password?</Link>
                      </div>
                      <div className="relative">
                        <input type={showPass ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full px-4 py-3 pr-11 rounded-xl bg-vynk-bg-1 border border-vynk-border text-vynk-text text-sm focus:outline-none focus:ring-2 focus:ring-vynk-primary/30 focus:border-vynk-primary transition-all" required autoComplete="current-password" />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-vynk-muted hover:text-vynk-text">
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={isLoading || !formData.email || !formData.password} className="mt-4 w-full py-3.5 rounded-xl bg-vynk-text text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-vynk-text/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      {isLoading ? <Loader size={18} className="animate-spin" /> : <LogIn size={18} />}
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </form>

                  <p className="text-center text-sm text-vynk-muted mt-8">
                    Don't have an account? <Link to="/register" className="text-vynk-primary font-semibold hover:underline">Create one</Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div key="2fa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-vynk-secondary to-emerald-400 flex items-center justify-center mb-4 mx-auto">
                    <ShieldCheck size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-vynk-text mb-1 text-center">Two-Step Verification</h2>
                  <p className="text-vynk-muted text-sm mb-6 text-center">Enter the 6-digit code sent to your email</p>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handle2FASubmit} className="flex flex-col gap-6">
                    <div className="flex justify-between gap-2">
                      {otpCode.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => otpRefs.current[i] = el}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-12 h-14 rounded-xl bg-vynk-bg-1 border border-vynk-border text-center text-xl font-bold text-vynk-text focus:outline-none focus:ring-2 focus:ring-vynk-secondary/50 focus:border-vynk-secondary transition-all"
                        />
                      ))}
                    </div>

                    <button type="submit" disabled={isLoading || otpCode.join('').length < 6} className="w-full py-3.5 rounded-xl bg-vynk-text text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-vynk-text/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                      {isLoading ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                      Verify & Sign In
                    </button>
                    
                    <button type="button" onClick={() => { setRequires2FA(false); setOtpCode(['','','','','','']); setError(''); }} className="text-sm font-medium text-vynk-muted hover:text-vynk-text">
                      Cancel
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
