import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axiosClient from '../api/axiosClient';

import houseImage from '../assets/login-house.jpg';

export default function Login() {
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [backendReady, setBackendReady] = useState(false);

  const from =
    location.state?.from?.pathname || '/dashboard';

  // ============================================================
  // WAKE RENDER BACKEND
  // ============================================================

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

  // ============================================================
  // LOGIN
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!email.trim() || !password) {
      const message =
        'Please enter your email and password.';

      setError(message);
      showError(message);

      return;
    }

    setLoading(true);

    try {
      const user = await login(
        email.trim(),
        password
      );

      showSuccess(
        `Welcome back, ${user.name}.`
      );

      navigate(from, {
        replace: true,
      });
    } catch (err) {
      const message =
        err?.message ||
        'Unable to sign in. Please check your credentials.';

      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-[#F5F3EF]
        flex
        items-center
        justify-center
        p-3
        sm:p-5
        lg:p-6
      "
    >

      {/* ========================================================
          MAIN LOGIN CARD
      ======================================================== */}

      <div
        className="
          relative
          w-full
          max-w-[1420px]

          min-h-screen
          lg:h-[calc(100vh-48px)]
          lg:min-h-[650px]
          lg:max-h-[820px]

          overflow-hidden

          bg-[#FAF9F7]

          border
          border-[#DDD9D3]

          rounded-none
          sm:rounded-[28px]

          flex
          flex-col
          lg:flex-row

          shadow-[0_24px_80px_rgba(17,17,17,0.10)]
        "
      >

        {/* ======================================================
            LEFT HOUSE PANEL
        ====================================================== */}

        <section
          className="
            relative
            w-full
            lg:w-[50%]

            min-h-[560px]
            lg:min-h-0

            overflow-hidden

            bg-[#111111]
            text-white
          "
        >

          {/* HOUSE IMAGE */}

          <img
            src={houseImage}
            alt="Luxury modern property"
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              object-center
            "
          />

          {/* DARK OLIVE / NAVY OVERLAY */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-[#07120F]/95
              via-[#101A18]/72
              to-[#243447]/45
            "
          />

          {/* OLIVE EDGE */}

          <div
            className="
              absolute
              top-0
              bottom-0
              left-0
              w-[4px]
              bg-[#59614A]
            "
          />

          {/* LEFT CONTENT */}

          <div
            className="
              relative
              z-10

              h-full

              min-h-[560px]
              lg:min-h-0

              px-7
              py-8

              sm:px-10
              sm:py-10

              lg:px-10
              lg:py-10

              xl:px-12
              xl:py-11

              flex
              flex-col
              justify-between
            "
          >

            {/* ==================================================
                LEFT BRAND
            ================================================== */}

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >

                <h1
                  className="
                    font-serif
                    text-[28px]
                    sm:text-[32px]
                    lg:text-[34px]
                    xl:text-[38px]
                    leading-none
                    tracking-tight
                    text-white
                  "
                >
                  RAIZ
                </h1>

                <div
                  className="
                    h-px
                    w-12
                    bg-[#A8AD92]
                  "
                />

              </div>

              <div
                className="
                  mt-1

                  font-serif

                  text-[28px]
                  sm:text-[32px]
                  lg:text-[34px]
                  xl:text-[38px]

                  leading-none
                  tracking-tight

                  text-white
                "
              >
                REALTORS
              </div>

              <div
                className="
                  mt-4

                  text-[8px]
                  sm:text-[9px]

                  tracking-[0.28em]

                  text-white/75

                  uppercase
                "
              >
                REAL ESTATE · SALES · OPERATIONS
              </div>

            </div>


            {/* ==================================================
                LEFT MAIN MESSAGE
            ================================================== */}

            <div
              className="
                max-w-[500px]
                -mt-3
                lg:-mt-4
              "
            >

              <div
                className="
                  mb-5

                  flex
                  items-center
                  gap-4

                  text-[8px]
                  sm:text-[9px]

                  tracking-[0.28em]

                  uppercase

                  text-white/65
                "
              >

                <div
                  className="
                    h-px
                    w-9
                    bg-[#A8AD92]
                  "
                />

                <span>
                  MORE THAN PROPERTIES
                </span>

              </div>


              <h2
                className="
                  font-serif

                  text-[29px]
                  sm:text-[34px]
                  lg:text-[38px]
                  xl:text-[44px]

                  leading-[1.08]

                  font-normal

                  tracking-tight

                  text-white
                "
              >
                A refined
                <br />

                operations platform
                <br />

                for{' '}

                <span
                  className="
                    text-[#B3B997]
                  "
                >
                  premium
                </span>

                <br />

                real estate teams.
              </h2>


              <p
                className="
                  mt-5

                  max-w-[440px]

                  text-[12px]
                  sm:text-[13px]
                  lg:text-[13px]
                  xl:text-[14px]

                  leading-6

                  text-white/75
                "
              >
                Manage leads, track follow-ups,
                monitor inventory, and close bookings
                — all from one calm, considered workspace.
              </p>

            </div>


            {/* ==================================================
                LEFT BOTTOM ICONS
            ================================================== */}

            <div>

              <div
                className="
                  flex
                  items-stretch
                  w-full
                  max-w-[500px]
                "
              >

                {/* PROPERTIES */}

                <div
                  className="
                    flex-1

                    flex
                    flex-col
                    items-center
                    justify-center

                    text-center
                  "
                >

                  <svg
                    width="27"
                    height="27"
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white/90"
                  >
                    <path
                      d="M4 13.5L15 4L26 13.5V26H18V18H12V26H4V13.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span
                    className="
                      mt-2.5
                      text-[8px]
                      tracking-[0.22em]
                      uppercase
                      text-white/80
                    "
                  >
                    Properties
                  </span>

                </div>


                {/* DIVIDER */}

                <div
                  className="
                    w-px
                    bg-white/25
                  "
                />


                {/* PROGRESS */}

                <div
                  className="
                    flex-1

                    flex
                    flex-col
                    items-center
                    justify-center

                    text-center
                  "
                >

                  <svg
                    width="27"
                    height="27"
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white/90"
                  >

                    <rect
                      x="4"
                      y="15"
                      width="5"
                      height="11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <rect
                      x="12.5"
                      y="9"
                      width="5"
                      height="17"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <rect
                      x="21"
                      y="4"
                      width="5"
                      height="22"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                  </svg>

                  <span
                    className="
                      mt-2.5
                      text-[8px]
                      tracking-[0.22em]
                      uppercase
                      text-white/80
                    "
                  >
                    Progress
                  </span>

                </div>


                {/* DIVIDER */}

                <div
                  className="
                    w-px
                    bg-white/25
                  "
                />


                {/* OPERATIONS CRM */}

                <div
                  className="
                    flex-1

                    flex
                    flex-col
                    items-center
                    justify-center

                    text-center
                  "
                >

                  <svg
                    width="27"
                    height="27"
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white/90"
                  >

                    <path
                      d="M15 4L26 10L15 16L4 10L15 4Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M4 15L15 21L26 15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M4 20L15 26L26 20"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />

                  </svg>

                  <span
                    className="
                      mt-2.5

                      text-[8px]

                      tracking-[0.18em]

                      uppercase

                      text-white/80

                      whitespace-nowrap
                    "
                  >
                    Operations CRM
                  </span>

                </div>

              </div>


              {/* BOTTOM LINE */}

              <div
                className="
                  mt-5

                  flex
                  items-center
                  gap-4

                  max-w-[500px]
                "
              >

                <span
                  className="
                    text-[7px]

                    tracking-[0.28em]

                    uppercase

                    text-[#B3B997]/75

                    whitespace-nowrap
                  "
                >
                  RAIZ OPERATIONS
                </span>

                <div
                  className="
                    h-px
                    flex-1
                    bg-white/20
                  "
                />

              </div>

            </div>

          </div>

        </section>


        {/* ======================================================
            RIGHT LOGIN PANEL
        ====================================================== */}

        <section
          className="
            relative

            flex-1

            bg-[#FAF9F7]

            flex
            items-start
            justify-center

            overflow-y-auto

            px-7
            py-8

            sm:px-10
            sm:py-9

            lg:px-12
            lg:py-8

            xl:px-16
          "
        >

          {/* TOP RIGHT */}

          <div
            className="
              absolute

              top-7
              right-8

              hidden
              md:block

              text-[7px]

              tracking-[0.32em]

              text-[#77736E]

              uppercase
            "
          >
            TRUST · VALUE · LONG-TERM
          </div>


          {/* ==================================================
              RIGHT CONTENT
          ================================================== */}

          <div
            className="
              w-full
              max-w-[420px]
            "
          >

            {/* ==================================================
                BRAND ABOVE SIGN IN
            ================================================== */}

            <div
              className="
                mb-7
                pb-5

                border-b
                border-[#DDD9D3]
              "
            >

              <div
                className="
                  font-serif

                  text-base
                  sm:text-lg

                  text-[#111111]
                "
              >
                RAIZ REALTORS
              </div>


              <div
                className="
                  mt-1.5

                  text-[7px]
                  sm:text-[8px]

                  tracking-[0.28em]

                  text-[#77736E]

                  uppercase
                "
              >
                REAL ESTATE · SALES · OPERATIONS
              </div>

            </div>


            {/* ==================================================
                SIGN IN TITLE
            ================================================== */}

            <div
              className="
                mb-7
              "
            >

              <h2
                className="
                  font-serif

                  text-[34px]
                  sm:text-[38px]
                  lg:text-[42px]

                  font-normal

                  leading-none

                  tracking-tight

                  text-[#111111]
                "
              >
                Sign in
              </h2>


              <p
                className="
                  mt-3

                  text-[13px]
                  sm:text-sm

                  text-[#77736E]
                "
              >
                Enter your credentials to access the CRM.
              </p>

            </div>


            {/* ==================================================
                LOGIN FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="
                space-y-5
              "
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="
                    block

                    mb-2

                    text-[9px]

                    font-medium

                    tracking-[0.22em]

                    uppercase

                    text-[#55514D]
                  "
                >
                  Email
                </label>


                <div
                  className="
                    h-[48px]

                    flex
                    items-center

                    border
                    border-[#D4DCE3]

                    rounded-[8px]

                    bg-[#E8EEF3]

                    px-4

                    transition-all
                    duration-200

                    focus-within:border-[#59614A]

                    focus-within:ring-2

                    focus-within:ring-[#59614A]/10
                  "
                >

                  {/* EMAIL ICON */}

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="
                      mr-3
                      shrink-0
                      text-[#59636B]
                    "
                  >

                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <path
                      d="M4 7L12 13L20 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />

                  </svg>


                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="admin@raizrealtors.com"
                    autoComplete="email"
                    disabled={loading}
                    className="
                      w-full

                      bg-transparent

                      outline-none

                      border-none

                      text-sm

                      text-[#111111]

                      placeholder:text-[#899198]
                    "
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="
                    block

                    mb-2

                    text-[9px]

                    font-medium

                    tracking-[0.22em]

                    uppercase

                    text-[#55514D]
                  "
                >
                  Password
                </label>


                <div
                  className="
                    h-[48px]

                    flex
                    items-center

                    border
                    border-[#D4DCE3]

                    rounded-[8px]

                    bg-[#E8EEF3]

                    px-4

                    transition-all
                    duration-200

                    focus-within:border-[#59614A]

                    focus-within:ring-2

                    focus-within:ring-[#59614A]/10
                  "
                >

                  {/* LOCK ICON */}

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="
                      mr-3
                      shrink-0
                      text-[#59636B]
                    "
                  >

                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                    <path
                      d="M8 10V7.5C8 5.567 9.567 4 11.5 4H12.5C14.433 4 16 5.567 16 7.5V10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />

                  </svg>


                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    className="
                      w-full

                      bg-transparent

                      outline-none

                      border-none

                      text-sm

                      text-[#111111]

                      placeholder:text-[#899198]
                    "
                  />


                  {/* PASSWORD VISIBILITY */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                    className="
                      ml-3

                      shrink-0

                      text-[#667078]

                      hover:text-[#59614A]

                      transition-colors

                      disabled:opacity-50
                    "
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >

                    {showPassword ? (

                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >

                        <path
                          d="M2.5 12C4.5 8.5 8 6.5 12 6.5C16 6.5 19.5 8.5 21.5 12C19.5 15.5 16 17.5 12 17.5C8 17.5 4.5 15.5 2.5 12Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />

                      </svg>

                    ) : (

                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >

                        <path
                          d="M3 3L21 21"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />

                        <path
                          d="M10.6 6.7C11.05 6.57 11.52 6.5 12 6.5C16 6.5 19.5 8.5 21.5 12C20.8 13.2 19.9 14.2 18.9 15"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />

                        <path
                          d="M6.1 9C4.65 9.8 3.45 10.8 2.5 12C4.5 15.5 8 17.5 12 17.5C13.1 17.5 14.15 17.35 15.1 17.05"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />

                      </svg>

                    )}

                  </button>

                </div>

              </div>


              {/* REMEMBER / FORGOT */}

              <div
                className="
                  flex
                  items-center
                  justify-between

                  text-xs
                "
              >

                <label
                  className="
                    flex
                    items-center
                    gap-2

                    text-[#4F4B47]

                    cursor-pointer
                  "
                >

                  <input
                    type="checkbox"
                    className="
                      h-4
                      w-4
                      accent-[#59614A]
                    "
                  />

                  <span>
                    Remember me
                  </span>

                </label>


                <button
                  type="button"
                  className="
                    text-[#59614A]

                    hover:text-[#3F4735]

                    transition-colors
                  "
                >
                  Forgot password?
                </button>

              </div>


              {/* CRM STATUS */}

              <div
                className="
                  flex
                  justify-center
                  items-center

                  text-xs
                "
              >

                {backendReady ? (

                  <span
                    className="
                      flex
                      items-center
                      gap-2

                      text-[#59614A]
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-[#59614A]
                      "
                    />

                    CRM ready

                  </span>

                ) : (

                  <span
                    className="
                      flex
                      items-center
                      gap-2

                      text-[#77736E]
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-[#8A8985]
                      "
                    />

                    Connecting to CRM...

                  </span>

                )}

              </div>


              {/* ERROR */}

              {error && (

                <div
                  className="
                    rounded-lg

                    border
                    border-red-200

                    bg-red-50

                    px-4
                    py-3
                  "
                >

                  <p
                    className="
                      text-xs
                      leading-5
                      text-red-600
                    "
                  >
                    {error}
                  </p>

                </div>

              )}


              {/* SIGN IN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full

                  h-[54px]

                  rounded-[8px]

                  bg-[#111111]

                  text-white

                  text-sm

                  font-medium

                  tracking-wide

                  flex
                  items-center
                  justify-center

                  gap-3

                  transition-all
                  duration-200

                  hover:bg-[#3F4735]

                  active:scale-[0.995]

                  disabled:opacity-60

                  disabled:cursor-not-allowed
                "
              >

                {loading
                  ? 'Signing in...'
                  : 'Sign in'}

                {!loading && (

                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >

                    <path
                      d="M5 12H19"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />

                    <path
                      d="M13 6L19 12L13 18"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                  </svg>

                )}

              </button>

            </form>


            {/* ==================================================
                RESTRICTED ACCESS
            ================================================== */}

            <div
              className="
                mt-8

                pt-5

                border-t
                border-[#DDD9D3]
              "
            >

              <p
                className="
                  text-center

                  text-[9px]
                  sm:text-[10px]

                  text-[#77736E]
                "
              >
                Access is restricted to authorised personnel only.
              </p>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}