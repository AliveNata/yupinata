import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { supabase } from '../../../lib/supabase';
import { validateEmail } from '../../../utils/validation';
import { toast } from 'react-hot-toast';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('alivenata@gmail.com');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (resetError) {
        if (resetError.message.includes('rate limit')) {
          throw new Error('Too many reset attempts. Please try again later.');
        }
        throw resetError;
      }

      toast.success(
        'Password reset instructions have been sent to your email.',
        { duration: 5000 }
      );
      onClose();
    } catch (err: any) {
      console.error('Error sending reset email:', err);
      setError('Failed to send reset email. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-6">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            placeholder="Enter your email address"
            required
            disabled={isLoading}
          />

          <div className="space-y-4 text-sm text-gray-600">
            <p>Enter your email address and we'll send you instructions to reset your password.</p>
            <p>Please check your spam/junk folder if you don't receive the email within a few minutes.</p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Send}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}