import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';
import { Input } from '../../components/admin/ui/Input';
import { PasswordInput } from '../../components/admin/ui/PasswordInput';
import { ForgotPasswordModal } from '../../components/admin/auth/ForgotPasswordModal';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; auth?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setErrors({ auth: 'Invalid email or password. Please try again.' });
          toast.error('Invalid login credentials');
        } else {
          setErrors({ auth: 'An error occurred during login. Please try again.' });
          toast.error('Login failed');
        }
        return;
      }

      toast.success('Login successful');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ auth: 'An unexpected error occurred. Please try again.' });
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-soft">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-pink-soft">
          <h1 className="text-3xl font-semibold mb-8 text-center text-black">Welcome Back!</h1>
          
          {errors.auth && (
            <div className="mb-6 p-4 bg-pink-soft rounded-lg flex items-center gap-2 text-pink-accent">
              <AlertCircle size={20} />
              <span>{errors.auth}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="Enter your email"
              className="rounded-xl border-pink-soft"
            />

            <div className="space-y-1">
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Enter your password"
                className="rounded-xl border-pink-soft"
              />
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-sky hover:text-sky-dark transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center gap-2
                ${isLoading 
                  ? 'bg-sky-light cursor-not-allowed' 
                  : 'bg-sky hover:bg-sky-dark'}`}
            >
              <LogIn size={20} />
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </div>
  );
}