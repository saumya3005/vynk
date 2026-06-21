import { useState, useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader, Eye, EyeOff, Check, X, Sparkles, Code2, GraduationCap, Briefcase, Palette, BookOpen } from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'Student', label: 'Student', icon: GraduationCap, color: 'from-blue-500 to-cyan-400' },
  { value: 'Developer', label: 'Developer', icon: Code2, color: 'from-violet-500 to-purple-400' },
  { value: 'Recruiter', label: 'Recruiter', icon: Briefcase, color: 'from-amber-500 to-orange-400' },
  { value: 'Teacher', label: 'Teacher', icon: BookOpen, color: 'from-emerald-500 to-green-400' },
  { value: 'Creator', label: 'Creator', icon: Palette, color: 'from-pink-500 to-rose-400' },
  { value: 'Professional', label: 'Professional', icon: Sparkles, color: 'from-slate-600 to-gray-500' },
];

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', role: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const passwordRules = useMemo(() => {
    const p = formData.password;
    return [
      { label: '8+ characters', pass: p.length >= 8 },
      { label: 'Uppercase letter', pass: /[A-Z]/.test(p) },
      { label: 'Lowercase letter', pass: /[a-z]/.test(p) },
      { label: 'Number', pass: /[0-9]/.test(p) },
      { label: 'Special character', pass: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/~`]/.test(p) },
    ];
  }, [formData.password]);

  const passwordStrength = passwordRules.filter(r => r.pass).length;
  const strengthLabel = ['', 'Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-400'][passwordStrength];

  const allValid = formData.username.trim() && formData.email.includes('@') && passwordStrength === 5 && formData.password === formData.confirmPassword && formData.role;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allValid) return toast.error('Please complete all fields correctly');
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', formData);
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
    <div className="min-h-screen flex bg-bg">
      {/* Left Hero — hidden on mobile */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-ink">
        {/* Floating gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-500" />

        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 text-center px-12">
          <h1 className="text-6xl font-black text-white tracking-tight mb-4">
            Vynk<span className="text-primary">.</span>
          </h1>
          <p className="text-xl text-white/60 font-light leading-relaxed max-w-md mx-auto">
            Where students, developers, and creators connect, collaborate, and build together.
          </p>
          <div className="mt-12 flex items-center justify-center gap-4 text-white/40 text-sm">
            <span>🚀 10K+ users</span>
            <span>•</span>
            <span>💻 Open projects</span>
            <span>•</span>
            <span>🎓 Learning hub</span>
          </div>
        </motion.div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-black text-text">Vynk<span className="text-primary">.</span></h1>
          </div>

          <div className="bg-white/75 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-text mb-1">Create your account</h2>
            <p className="text-muted text-sm mb-6">Join thousands of builders on Vynk</p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text/70">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Choose a unique username" className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" required autoComplete="username" />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text/70">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" required autoComplete="email" />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text/70">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" className="w-full px-4 py-3 pr-11 rounded-xl bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" required autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-muted hover:text-text">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength meter */}
                {formData.password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColor : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {passwordRules.map(r => (
                        <div key={r.label} className={`flex items-center gap-1.5 text-xs ${r.pass ? 'text-emerald-600' : 'text-muted'}`}>
                          {r.pass ? <Check size={12} /> : <X size={12} />}
                          {r.label}
                        </div>
                      ))}
                    </div>
                    <p className={`text-xs font-semibold mt-1 ${passwordStrength >= 4 ? 'text-emerald-600' : passwordStrength >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{strengthLabel}</p>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text/70">Confirm Password</label>
                <input type={showPass ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" required autoComplete="new-password" />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              {/* Role Selection Cards */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-text/70">I am a...</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(r => {
                    const Icon = r.icon;
                    const selected = formData.role === r.value;
                    return (
                      <button key={r.value} type="button" onClick={() => setFormData(p => ({ ...p, role: r.value }))} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 bg-white/50'}`}>
                        <div className={`w-8 h-8 rounded-lg bg-linear-to-tr ${r.color} flex items-center justify-center`}>
                          <Icon size={16} className="text-white" />
                        </div>
                        <span className={`text-xs font-semibold ${selected ? 'text-primary' : 'text-muted'}`}>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !allValid}
                className="auth-submit-btn"
              >
                {isLoading ? <Loader size={18} className="animate-spin" /> : <UserPlus size={18} />}
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
              Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
