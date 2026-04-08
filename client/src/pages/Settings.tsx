import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import apiClient from '../api/client';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.patch('/auth/me', { name });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await apiClient.patch('/auth/password', { currentPassword, newPassword });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    if (!window.confirm('All your recipes, pans, and data will be permanently deleted. Continue?')) return;
    try {
      await apiClient.delete('/auth/me');
      toast.success('Account deleted');
      signOut();
    } catch {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <Card className="p-5 mb-6 animate-fade-in-up delay-100">
        <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">{user?.email}</p>
          </div>
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>

      {/* Change Password */}
      <Card className="p-5 mb-6 animate-fade-in-up delay-200">
        <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" loading={changingPassword}>Change Password</Button>
          </div>
        </form>
      </Card>

      {/* Sign Out */}
      <Card className="p-5 mb-6 animate-fade-in-up delay-300">
        <h2 className="font-semibold text-gray-900 mb-2">Session</h2>
        <p className="text-sm text-gray-600 mb-4">Sign out of your account on this device.</p>
        <Button variant="secondary" onClick={signOut}>
          Sign Out
        </Button>
      </Card>

      {/* Danger Zone */}
      <Card className="p-5 border-red-200 animate-fade-in-up delay-400">
        <h2 className="font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button variant="danger" onClick={handleDeleteAccount}>
          Delete Account
        </Button>
      </Card>
    </div>
  );
}
