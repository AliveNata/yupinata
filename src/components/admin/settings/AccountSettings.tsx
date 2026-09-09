import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { validateEmail } from '../../../utils/validation';

export function AccountSettings() {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadUserEmail() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    }
    loadUserEmail();
  }, []);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (newPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (newPassword === currentPassword) {
        newErrors.newPassword = 'New password must be different from current password';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Update email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ 
          email: email.trim() 
        });
        
        if (emailError) {
          if (emailError.message.includes('email_address_invalid')) {
            setErrors({ email: 'Invalid email format' });
            return;
          }
          throw emailError;
        }
      }

      // Update password if provided
      if (newPassword) {
        // Verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email!,
          password: currentPassword,
        });

        if (signInError) {
          setErrors({ currentPassword: 'Current password is incorrect' });
          return;
        }

        // Update password
        const { error: passwordError } = await supabase.auth.updateUser({ 
          password: newPassword 
        });

        if (passwordError) {
          if (passwordError.message.includes('same_password')) {
            setErrors({ newPassword: 'New password must be different from current password' });
            return;
          }
          throw passwordError;
        }
      }

      toast.success('Account settings updated successfully');
      resetForm();
    } catch (error: any) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="Enter email address"
          required
        />

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <h3 className="text-lg font-medium">Change Password</h3>
          
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={errors.currentPassword}
            required={!!newPassword}
            placeholder="Enter current password"
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            placeholder="Enter new password"
          />

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required={!!newPassword}
            placeholder="Confirm new password"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={resetForm}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}