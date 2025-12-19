import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      if (!username.trim() || !password.trim()) {
        toast.error('Please enter username and password');
        setIsLoading(false);
        return;
      }

      // Server-side authentication via Edge Function
      const { data, error } = await supabase.functions.invoke('admin-auth', {
        body: { 
          username: username.trim(), 
          password: password.trim(),
          action: 'login'
        }
      });

      if (error) {
        console.error('Auth error:', error);
        toast.error('Authentication failed');
        setIsLoading(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      if (data?.success && data?.token) {
        // Store secure session token
        sessionStorage.setItem('adminToken', data.token);
        sessionStorage.setItem('adminId', data.adminId);
        toast.success('Welcome, Administrator!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-body mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Solar System
        </motion.button>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 border border-accent/50 flex items-center justify-center">
              <Lock className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-display text-2xl text-foreground">
              Admin Portal
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Mission Control Access
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-display text-sm text-primary mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="input-cosmic pl-11"
                  required
                  maxLength={50}
                />
              </div>
            </div>

            <div>
              <label className="block font-display text-sm text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="input-cosmic pl-11"
                  required
                  maxLength={100}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-cosmic w-full"
            >
              {isLoading ? 'Authenticating...' : 'Access Control Center'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Admin;
