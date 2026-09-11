import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/FormField';
import Button from '../components/ui/Button';
import axiosClient from '../api/axiosClient';

export default function Login() {
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Backend connection status
  const [backendReady, setBackendReady] = useState(false);

  const from =
    location.state?.from?.pathname || '/dashboard';

  // =========================================================
  // WAKE RENDER BACKEND IN BACKGROUND
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const wakeBackend = async () => {
      try {
        await axiosClient.get('/health', {
          timeout: 15000,
        });

        if (!cancelled) {
          setBackendReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          setBackendReady(false);
        }
      }
    };

    wakeBackend();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // LOGIN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(email, password);

      showSuccess(`Welcome back, ${user.name}.`);

      navigate(from, { replace: true });

    } catch (err) {
      const msg =
        err.message ||
        'Unable to sign in. Please check your credentials.';

      setError(msg);
      showError(msg);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">

      {/* ===================================================== */}
      {/* LEFT — BRAND PANEL */}
      {/* ===================================================== */}

      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 bg-raiz-offwhite border-r border-raiz-border">

        <div>

          <div className="font-serif text-3xl font-bold tracking-tight text-raiz-black leading-none">
            RAIZ
          </div>

          <div className="font-serif text-3xl font-bold tracking-tight text-raiz-black leading-none mt-1">
            REALTORS
          </div>

          <div className="mt-3 text-xs font-medium tracking-widest text-raiz-secondary uppercase">
            Real Estate · Sales · Operations
          </div>

        </div>

        <div className="max-w-sm">

          <p className="font-serif text-2xl text-raiz-black leading-snug">
            A refined operations platform for premium real estate teams.
          </p>

          <p className="mt-4 text-sm text-raiz-secondary leading-relaxed">
            Manage leads, track follow-ups, monitor inventory, and close bookings — all from one calm, considered workspace.
          </p>

        </div>

        <div className="flex items-center gap-3">

          <div className="h-px flex-1 bg-raiz-border" />

          <span className="text-10 tracking-widest text-raiz-secondary/60 uppercase">
            Operations CRM
          </span>

          <div className="h-px flex-1 bg-raiz-border" />

        </div>

      </div>


      {/* ===================================================== */}
      {/* RIGHT — LOGIN FORM */}
      {/* ===================================================== */}

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">

        <div className="w-full max-w-sm">

          {/* ================================================= */}
          {/* MOBILE BRAND */}
          {/* ================================================= */}

          <div className="lg:hidden mb-10 text-center">

            <div className="font-serif text-2xl font-bold tracking-tight text-raiz-black">
              RAIZ REALTORS
            </div>

            <div className="mt-1.5 text-10 tracking-widest text-raiz-secondary uppercase">
              Real Estate · Sales · Operations
            </div>

          </div>


          {/* ================================================= */}
          {/* TITLE */}
          {/* ================================================= */}

          <div className="mb-8">

            <h1 className="font-serif text-2xl font-semibold text-raiz-black">
              Sign in
            </h1>

            <p className="mt-1.5 text-sm text-raiz-secondary">
              Enter your credentials to access the CRM.
            </p>

          </div>


          {/* ================================================= */}
          {/* FORM */}
          {/* ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <Input
              label="Email"
              type="email"
              placeholder="you@raizrealtors.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              disabled={loading}
            />


            {/* PASSWORD */}

            <div className="relative">

              <Input
                label="Password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
                className="absolute right-3 top-[34px] flex h-8 w-8 items-center justify-center text-raiz-secondary transition-colors hover:text-raiz-black disabled:cursor-not-allowed disabled:opacity-50"
              >

                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}

              </button>

            </div>


            {/* ================================================= */}
            {/* BACKEND STATUS */}
            {/* ================================================= */}

            <div className="text-center text-xs text-raiz-secondary">

              {backendReady ? (

                <span className="text-green-700">
                  ● CRM ready
                </span>

              ) : (

                <span>
                  ● Connecting to CRM...
                </span>

              )}

            </div>


            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (

              <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5">

                <p className="text-xs text-red-600">
                  {error}
                </p>

              </div>

            )}


            {/* ================================================= */}
            {/* SIGN IN BUTTON */}
            {/* ================================================= */}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              disabled={loading}
            >
              Sign in
            </Button>

          </form>


          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <div className="mt-8 pt-6 border-t border-raiz-border">

            <p className="text-xs text-raiz-secondary text-center">
              Access is restricted to authorised personnel only.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}