"use client";

import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Code,
  Trash2,
  Lock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/hooks/useSettings";
import { useSessions, useRevokeSession, useLogoutAll } from "@/hooks/useAuth";
import type { Session } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SettingsCategory =
  | "profile"
  | "notifications"
  | "privacy"
  | "developer"
  | "account";

interface NavItem {
  id: SettingsCategory;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "developer", label: "Developer", icon: Code },
  { id: "account", label: "Account", icon: Lock },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] =
    useState<SettingsCategory>("profile");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm sm:text-base text-slate-600">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Navigation Sidebar - Mobile: Horizontal scroll, Desktop: Fixed sidebar */}
        <nav className="lg:w-64 lg:flex-shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeCategory === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveCategory(item.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    whitespace-nowrap transition-all duration-300
                    active:scale-[0.98]
                    ${
                      isActive
                        ? "bg-[#3c8350] text-white shadow-lg shadow-[#3c8350]/25"
                        : "text-slate-600 hover:bg-slate-100"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto hidden lg:block" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Active Form Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeCategory === "profile" && <ProfileSettings />}
              {activeCategory === "notifications" && <NotificationSettings />}
              {activeCategory === "privacy" && <PrivacySettings />}
              {activeCategory === "developer" && <DeveloperSettings />}
              {activeCategory === "account" && <AccountSettings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ==================== PROFILE SETTINGS ====================

function ProfileSettings() {
  const { saveProfile, profileState, resetFormState } = useSettings();
  const [formData, setFormData] = useState({
    firstName: "NAME",
    lastName: "SURNAME",
    email: "name.surname@example.com",
    bio: "Learning enthusiast",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveProfile(formData);
    if (success) {
      setTimeout(() => resetFormState("profile"), 3000);
    }
  };

  return (
    <SettingsSection
      title="Profile Settings"
      description="Update your personal information and bio"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="First Name">
            <Input
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="Enter your first name"
              className="transition-colors duration-300"
            />
          </FormField>

          <FormField label="Last Name">
            <Input
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Enter your last name"
              className="transition-colors duration-300"
            />
          </FormField>
        </div>

        <FormField label="Email Address">
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Enter your email"
            className="transition-colors duration-300"
          />
        </FormField>

        <FormField label="Bio">
          <textarea
            value={formData.bio}
            onChange={(e) =>
              setFormData({ ...formData, bio: e.target.value })
            }
            placeholder="Tell us about yourself"
            rows={4}
            className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3c8350] transition-colors duration-300 resize-none"
          />
        </FormField>

        <StatusMessage state={profileState} />

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={profileState.isLoading}
            disabled={profileState.isLoading}
            className="active:scale-[0.98] transition-transform"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}

// ==================== NOTIFICATION SETTINGS ====================

function NotificationSettings() {
  const { saveNotifications, notificationsState, resetFormState } =
    useSettings();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    marketingEmails: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveNotifications(settings);
    if (success) {
      setTimeout(() => resetFormState("notifications"), 3000);
    }
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SettingsSection
      title="Notification Preferences"
      description="Choose how you want to be notified"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <ToggleField
          label="Email Notifications"
          description="Receive notifications about your account activity via email"
          checked={settings.emailNotifications}
          onCheckedChange={() => handleToggle("emailNotifications")}
        />

        <ToggleField
          label="Push Notifications"
          description="Receive push notifications in your browser"
          checked={settings.pushNotifications}
          onCheckedChange={() => handleToggle("pushNotifications")}
        />

        <ToggleField
          label="Weekly Digest"
          description="Get a weekly summary of your learning progress"
          checked={settings.weeklyDigest}
          onCheckedChange={() => handleToggle("weeklyDigest")}
        />

        <ToggleField
          label="Marketing Emails"
          description="Receive updates about new features and promotions"
          checked={settings.marketingEmails}
          onCheckedChange={() => handleToggle("marketingEmails")}
        />

        <StatusMessage state={notificationsState} />

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={notificationsState.isLoading}
            disabled={notificationsState.isLoading}
            className="active:scale-[0.98] transition-transform"
          >
            Save Preferences
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}

// ==================== PRIVACY SETTINGS ====================

function PrivacySettings() {
  const { savePrivacy, privacyState, resetFormState } = useSettings();
  const [settings, setSettings] = useState<{
    profileVisibility: "public" | "private" | "friends";
    showActivity: boolean;
    allowDataCollection: boolean;
  }>({
    profileVisibility: "public",
    showActivity: true,
    allowDataCollection: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await savePrivacy(settings);
    if (success) {
      setTimeout(() => resetFormState("privacy"), 3000);
    }
  };

  return (
    <SettingsSection
      title="Privacy Settings"
      description="Control your privacy and data sharing preferences"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Profile Visibility">
          <Select
            value={settings.profileVisibility}
            onValueChange={(value: "public" | "private" | "friends") =>
              setSettings({ ...settings, profileVisibility: value })
            }
          >
            <SelectTrigger className="w-full transition-colors duration-300">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Anyone can see</SelectItem>
              <SelectItem value="friends">
                Friends Only - Only connections
              </SelectItem>
              <SelectItem value="private">
                Private - Only you can see
              </SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        <ToggleField
          label="Show Activity Status"
          description="Let others see when you're active"
          checked={settings.showActivity}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, showActivity: checked })
          }
        />

        <ToggleField
          label="Allow Data Collection"
          description="Help us improve by allowing anonymous usage data collection"
          checked={settings.allowDataCollection}
          onCheckedChange={(checked) =>
            setSettings({ ...settings, allowDataCollection: checked })
          }
        />

        <StatusMessage state={privacyState} />

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={privacyState.isLoading}
            disabled={privacyState.isLoading}
            className="active:scale-[0.98] transition-transform"
          >
            Save Privacy Settings
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}

// ==================== DEVELOPER SETTINGS ====================

function DeveloperSettings() {
  const { isMockModeEnabled, toggleMockMode, isMockLoading } = useSettings();

  return (
    <SettingsSection
      title="Developer Settings"
      description="Advanced settings for development and testing"
    >
      <div className="space-y-6">
        {/* Mock Backend Toggle */}
        <div
          className={`
            p-4 sm:p-6 rounded-xl border-2 transition-all duration-300
            ${
              isMockModeEnabled
                ? "border-amber-400 bg-amber-50/50"
                : "border-slate-200"
            }
          `}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">
                  Enable Mock Backend
                </h3>
                <span
                  className={`
                    px-2 py-0.5 text-xs font-medium rounded-full
                    ${
                      isMockModeEnabled
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }
                  `}
                >
                  {isMockModeEnabled ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                When enabled, all form submissions on this Settings page will be
                routed through a mock backend service with simulated network
                delays. No real API calls will be made.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <code className="px-2 py-1 text-xs bg-slate-100 rounded text-slate-600">
                  Delay: 1000ms
                </code>
                <code className="px-2 py-1 text-xs bg-slate-100 rounded text-slate-600">
                  Scope: Settings page only
                </code>
              </div>
            </div>
            <Switch
              checked={isMockModeEnabled}
              onCheckedChange={toggleMockMode}
              disabled={isMockLoading}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>
        </div>

        {/* Mock Mode Info */}
        {isMockModeEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-50 rounded-xl border border-amber-200"
          >
            <h4 className="text-sm font-medium text-amber-900 mb-2">
              Mock Mode is Active
            </h4>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>• Profile save operations will be mocked</li>
              <li>• Notification preferences will be stored locally</li>
              <li>• Privacy settings updates are simulated</li>
              <li>• Password changes return mock responses</li>
              <li>• Check browser console for mock activity logs</li>
            </ul>
          </motion.div>
        )}

        {/* Environment Info */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <h4 className="text-sm font-medium text-slate-900 mb-2">
            Environment Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Node Env</span>
              <span className="text-slate-700 font-mono">
                {process.env.NODE_ENV}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Next.js Version</span>
              <span className="text-slate-700 font-mono">
                16.1.6
              </span>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}

// ==================== SESSION MANAGEMENT COMPONENT ====================

function SessionManagement() {
  const { data: sessions, isLoading, error, refetch } = useSessions();
  const revokeMutation = useRevokeSession();
  const logoutAllMutation = useLogoutAll();
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('mobile')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    if (userAgent.toLowerCase().includes('tablet')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.toLowerCase().includes('chrome')) return 'Chrome';
    if (userAgent.toLowerCase().includes('firefox')) return 'Firefox';
    if (userAgent.toLowerCase().includes('safari')) return 'Safari';
    if (userAgent.toLowerCase().includes('edge')) return 'Edge';
    return 'Browser';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-slate-900">Active Sessions</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-48 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-900">Active Sessions</h3>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">Failed to load sessions. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentSession = sessions?.find((s: Session) => s.is_current);
  const otherSessions = sessions?.filter((s: Session) => !s.is_current) || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900">Active Sessions</h3>
          <p className="text-sm text-slate-500">
            Manage your active sessions across all devices
          </p>
        </div>
        {otherSessions.length > 0 && (
          <button
            onClick={() => setShowLogoutAllConfirm(true)}
            disabled={logoutAllMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-colors disabled:opacity-50"
          >
            {logoutAllMutation.isPending ? 'Logging out...' : 'Logout All Devices'}
          </button>
        )}
      </div>

      {/* Current Session */}
      {currentSession && (
        <div className="p-4 rounded-xl border-2 border-[#3c8350]/30 bg-[#3c8350]/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#3c8350]/10 flex items-center justify-center text-[#3c8350]">
              {getDeviceIcon(currentSession.user_agent)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900">Current Session</p>
                <span className="px-2 py-0.5 text-xs font-medium bg-[#3c8350] text-white rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {getBrowserInfo(currentSession.user_agent)} • {currentSession.ip_address}
              </p>
              <p className="text-xs text-slate-400">
                Started {formatDate(currentSession.created_at)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Other Sessions */}
      {otherSessions.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">Other Devices</p>
          {otherSessions.map((session: Session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  {getDeviceIcon(session.user_agent)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">
                    {getBrowserInfo(session.user_agent)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {session.ip_address}
                  </p>
                  <p className="text-xs text-slate-400">
                    Last active {formatDate(session.last_active_at)}
                  </p>
                </div>
                <button
                  onClick={() => revokeMutation.mutate(session.id)}
                  disabled={revokeMutation.isPending}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  {revokeMutation.isPending ? 'Revoking...' : 'Revoke'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            No other active sessions found.
          </p>
        </div>
      )}

      {/* Logout All Confirmation Modal */}
      {showLogoutAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Logout from all devices?</h4>
                <p className="text-sm text-slate-500">
                  This will end all your active sessions, including the current one.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutAllConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logoutAllMutation.mutate();
                  setShowLogoutAllConfirm(false);
                }}
                disabled={logoutAllMutation.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {logoutAllMutation.isPending ? 'Logging out...' : 'Logout All'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ==================== ACCOUNT SETTINGS ====================

function AccountSettings() {
  const { changePassword, deleteAccount, passwordState, deleteState } =
    useSettings();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }
    await changePassword(passwordData.currentPassword, passwordData.newPassword);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await deleteAccount(deleteConfirmation);
    setDeleteConfirmation("");
  };

  return (
    <SettingsSection
      title="Account Management"
      description="Manage your account security and data"
    >
      <div className="space-y-8">
        {/* Session Management */}
        <div className="pb-8 border-b border-slate-200">
          <SessionManagement />
        </div>

        {/* Change Password */}
        <div className="pb-8 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-4">
            Change Password
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <FormField label="Current Password">
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
                className="transition-colors duration-300"
              />
            </FormField>

            <FormField label="New Password">
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Enter new password (min 8 characters)"
                className="transition-colors duration-300"
              />
            </FormField>

            <FormField label="Confirm New Password">
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm new password"
                className="transition-colors duration-300"
              />
            </FormField>

            {passwordData.newPassword !== passwordData.confirmPassword &&
              passwordData.confirmPassword && (
                <p className="text-sm text-red-600">
                  Passwords do not match
                </p>
              )}

            <StatusMessage state={passwordState} />

            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={passwordState.isLoading}
                disabled={
                  passwordState.isLoading ||
                  passwordData.newPassword !== passwordData.confirmPassword ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword
                }
                className="active:scale-[0.98] transition-transform"
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>

        {/* Delete Account */}
        <div>
          <h3 className="text-lg font-medium text-red-600 mb-4">
            Danger Zone
          </h3>
          <div className="p-4 sm:p-6 border border-red-200 rounded-xl bg-red-50">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900">
                  Delete Account
                </h4>
                <p className="mt-1 text-sm text-red-700">
                  Once you delete your account, there is no going back. All your
                  data will be permanently removed.
                </p>

                <form onSubmit={handleDeleteSubmit} className="mt-4 space-y-4">
                  <FormField label={`Type "DELETE" to confirm`}>
                    <Input
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                      className="border-red-300 focus:ring-red-500 transition-colors duration-300"
                    />
                  </FormField>

                  <StatusMessage state={deleteState} />

                  <Button
                    type="submit"
                    variant="destructive"
                    isLoading={deleteState.isLoading}
                    disabled={
                      deleteState.isLoading || deleteConfirmation !== "DELETE"
                    }
                    className="active:scale-[0.98] transition-transform"
                  >
                    Permanently Delete Account
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}

// ==================== UI COMPONENTS ====================

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200"
    >
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {description}
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>{children}</motion.div>
    </motion.div>
  );
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

function FormField({ label, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleField({ label, description, checked, onCheckedChange }: ToggleFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors duration-300">
      <div>
        <h4 className="font-medium text-slate-900">
          {label}
        </h4>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-[#3c8350] flex-shrink-0"
      />
    </div>
  );
}

interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

function StatusMessage({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-red-600"
      >
        <AlertCircle className="w-4 h-4" />
        <span>{state.error}</span>
      </motion.div>
    );
  }

  if (state.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-green-600"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>Settings saved successfully!</span>
      </motion.div>
    );
  }

  return null;
}
