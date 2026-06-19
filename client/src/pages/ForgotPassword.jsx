import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setResult(res.data);
      toast.success('Reset link generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(result.resetUrl);
    toast.success('Reset link copied!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-bg via-bg-2 to-bg px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8">
          <Link to="/login" className="flex items-center gap-2 text-muted hover:text-text mb-6 text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-primary to-secondary flex items-center justify-center mb-4">
            <Mail size={24} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold text-text mb-2">Forgot Password</h1>
          <p className="text-muted text-sm mb-6">Enter your email and we'll generate a reset link.</p>

          {result ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <p className="font-bold text-text mb-2">Reset Link Generated</p>
              <p className="text-sm text-muted mb-4">{result.message}</p>

              {result.resetUrl && (
                <div className="bg-surface rounded-xl p-4 text-left mb-4">
                  <p className="text-xs font-bold text-muted uppercase mb-2">Dev Reset URL</p>
                  <p className="text-xs text-text break-all mb-3">{result.resetUrl}</p>
                  <div className="flex gap-2">
                    <button onClick={copyLink} className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                      <Copy size={12} /> Copy
                    </button>
                    <a href={result.resetUrl} className="flex items-center gap-1 text-xs text-secondary font-semibold hover:underline">
                      <ExternalLink size={12} /> Open
                    </a>
                  </div>
                </div>
              )}

              <Link to="/login" className="btn-primary w-full flex justify-center py-2 text-sm">Back to Login</Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-text mb-1 block">Email Address</label>
                <input
                  type="email"
                  required
                  className="glass-input w-full"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex justify-center items-center gap-2">
                {isLoading ? 'Generating...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
