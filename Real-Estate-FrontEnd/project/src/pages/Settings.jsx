import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import userApi from '../api/userApi';

import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/FormField';

import {
  User,
  Shield,
  Building2,
  Database,
  CheckCircle2,
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // =========================
  // PROFILE
  // =========================

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');

  // =========================
  // PASSWORD
  // =========================

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // =========================
  // PROFILE SAVE
  // =========================

  const handleProfileSave = (e) => {
    e.preventDefault();

    showSuccess('Profile settings saved successfully.');
  };

  // =========================
  // CHANGE PASSWORD
  // =========================

  const handlePasswordSave = async (e) => {
    e.preventDefault();

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      showError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      showError(
        'New password must contain at least 6 characters.'
      );
      return;
    }

    setPasswordLoading(true);

    try {
      await userApi.changePassword({
        currentPassword,
        newPassword,
      });

      showSuccess(
        'Password changed successfully.'
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err) {
      showError(
        err.message ||
          'Unable to change password.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // =========================
  // ROLE
  // =========================

  const roleLabel = user?.role
    ? user.role.replaceAll('_', ' ')
    : 'USER';

  return (
    <div>

      <PageHeader
        title="Settings"
        description="Manage your profile, security, and CRM preferences."
      />

      <div className="space-y-6">

        {/* ================================================= */}
        {/* PROFILE */}
        {/* ================================================= */}

        <section className="rounded-lg border border-raiz-border bg-white">

          <div className="flex items-start gap-4 border-b border-raiz-border px-6 py-5">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-raiz-border bg-raiz-offwhite">

              <User
                size={18}
                className="text-raiz-black"
              />

            </div>

            <div>

              <h2 className="text-sm font-semibold text-raiz-black">
                Profile
              </h2>

              <p className="mt-1 text-xs text-raiz-secondary">
                Manage your personal CRM profile information.
              </p>

            </div>

          </div>

          <form
            onSubmit={handleProfileSave}
            className="p-6"
          >

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <Input
                label="Full Name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Enter your name"
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                disabled
                placeholder="Email address"
              />

            </div>

            <div className="mt-5 flex justify-end">

              <Button type="submit">
                Save Profile
              </Button>

            </div>

          </form>

        </section>


        {/* ================================================= */}
        {/* ACCOUNT & ACCESS */}
        {/* ================================================= */}

        <section className="rounded-lg border border-raiz-border bg-white">

          <div className="flex items-start gap-4 border-b border-raiz-border px-6 py-5">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-raiz-border bg-raiz-offwhite">

              <Shield
                size={18}
                className="text-raiz-black"
              />

            </div>

            <div>

              <h2 className="text-sm font-semibold text-raiz-black">
                Account & Access
              </h2>

              <p className="mt-1 text-xs text-raiz-secondary">
                Current account permissions and access information.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">

            <InfoItem
              label="Account Name"
              value={user?.name || '—'}
            />

            <InfoItem
              label="Role"
              value={roleLabel}
            />

            <InfoItem
              label="Account Status"
              value="Active"
              status
            />

          </div>

        </section>


        {/* ================================================= */}
        {/* SECURITY */}
        {/* ================================================= */}

        <section className="rounded-lg border border-raiz-border bg-white">

          <div className="flex items-start gap-4 border-b border-raiz-border px-6 py-5">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-raiz-border bg-raiz-offwhite">

              <Shield
                size={18}
                className="text-raiz-black"
              />

            </div>

            <div>

              <h2 className="text-sm font-semibold text-raiz-black">
                Security
              </h2>

              <p className="mt-1 text-xs text-raiz-secondary">
                Update your account password.
              </p>

            </div>

          </div>

          <form
            onSubmit={handlePasswordSave}
            className="p-6"
          >

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(e.target.value)
                }
                placeholder="Current password"
                disabled={passwordLoading}
              />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value)
                }
                placeholder="New password"
                disabled={passwordLoading}
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm password"
                disabled={passwordLoading}
              />

            </div>

            {/* Password mismatch */}

            {newPassword &&
              confirmPassword &&
              newPassword !== confirmPassword && (
                <p className="mt-3 text-xs text-red-600">
                  New passwords do not match.
                </p>
              )}

            {/* Password length */}

            {newPassword &&
              newPassword.length < 6 && (
                <p className="mt-3 text-xs text-raiz-secondary">
                  Password must contain at least 6 characters.
                </p>
              )}

            <div className="mt-5 flex justify-end">

              <Button
                type="submit"
                loading={passwordLoading}
                disabled={
                  passwordLoading ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword ||
                  newPassword.length < 6
                }
              >
                Update Password
              </Button>

            </div>

          </form>

        </section>


        {/* ================================================= */}
        {/* CRM INFORMATION */}
        {/* ================================================= */}

        <section className="rounded-lg border border-raiz-border bg-white">

          <div className="flex items-start gap-4 border-b border-raiz-border px-6 py-5">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-raiz-border bg-raiz-offwhite">

              <Building2
                size={18}
                className="text-raiz-black"
              />

            </div>

            <div>

              <h2 className="text-sm font-semibold text-raiz-black">
                CRM Information
              </h2>

              <p className="mt-1 text-xs text-raiz-secondary">
                Platform information for RAIZ REALTORS.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

            <InfoItem
              label="Platform"
              value="RAIZ REALTORS CRM"
            />

            <InfoItem
              label="Environment"
              value="Production"
            />

            <InfoItem
              label="Application"
              value="Real Estate · Sales · Operations"
            />

            <InfoItem
              label="Access"
              value="Authorised Personnel Only"
            />

          </div>

        </section>


        {/* ================================================= */}
        {/* SYSTEM STATUS */}
        {/* ================================================= */}

        <section className="rounded-lg border border-raiz-border bg-raiz-offwhite">

          <div className="flex items-center gap-4 px-6 py-5">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-raiz-border bg-white">

              <Database
                size={18}
                className="text-raiz-black"
              />

            </div>

            <div className="flex-1">

              <h2 className="text-sm font-semibold text-raiz-black">
                System Status
              </h2>

              <p className="mt-1 text-xs text-raiz-secondary">
                Current CRM platform status.
              </p>

            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-green-700">

              <CheckCircle2 size={15} />

              Operational

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="pb-6 text-center">

          <p className="text-xs text-raiz-secondary">
            RAIZ REALTORS CRM
          </p>

          <p className="mt-1 text-10 tracking-widest text-raiz-secondary/60 uppercase">
            Real Estate · Sales · Operations
          </p>

        </div>

      </div>

    </div>
  );
}


/* ================================================= */
/* INFO ITEM */
/* ================================================= */

function InfoItem({
  label,
  value,
  status = false,
}) {
  return (
    <div className="rounded-md border border-raiz-border bg-raiz-offwhite/40 px-4 py-3">

      <p className="text-10 font-semibold tracking-widest text-raiz-secondary uppercase">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">

        {status && (
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
        )}

        <p className="text-sm font-medium text-raiz-black capitalize">
          {value}
        </p>

      </div>

    </div>
  );
}