import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../../user/hooks/useUser";
import {
  getRoleDashboardPath,
  needsProfileSetup,
} from "../../user/api/userAPI";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { loadUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    }

    if (!password) {
      nextErrors.password = "Password is required";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsLoggingIn(true);

    try {
      await login(email, password);
      const profile = await loadUser();

      if (needsProfileSetup(profile)) {
        navigate("/auth/setup", { replace: true });
        return;
      }

      navigate(getRoleDashboardPath(profile?.role), {
        replace: true,
      });
    } catch (error) {
      setErrors({
        form: error?.message || "Invalid email or password",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="grid min-h-screen min-w-0 place-items-center bg-[#edf4fb] px-1 py-8 text-[#16324f] sm:px-5 sm:py-12 md:px-8">
      <section className="w-full min-w-0 max-w-[440px] rounded-[10px] border border-[#dfe7ef] bg-white px-3 py-6 shadow-[0_18px_45px_rgba(19,52,80,0.12)] sm:px-8 sm:py-9">
        <div className="mb-6 border-b border-[#dfe7ef] pb-5 sm:mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
            AIIA-CTMS
          </p>
          <h1 className="whitespace-nowrap text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-[#16324f] sm:text-[2rem]">
          Log in
          </h1>
          <p className="mt-3 max-w-[28rem] text-sm leading-6 text-[#5d7187]">
            Secure access to your clinical research workspace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid min-w-0 gap-4 sm:gap-5">
          <div className="grid min-w-0 gap-1.5 sm:gap-2">
            <label
              htmlFor="email"
              className="text-xs font-medium text-[var(--text)] sm:text-sm"
            >
              Email
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={`h-10 w-full min-w-0 rounded-[5px] border bg-[#f4f8fb] px-2 text-xs text-[#16324f] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#1f74d8]/20 sm:h-12 sm:px-3 sm:text-sm ${errors.email ? "border-red-500" : "border-[#dfe7ef] focus:border-[#1f74d8]"}`}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid min-w-0 gap-1.5 sm:gap-2">
            <label
              htmlFor="password"
              className="text-xs font-medium text-[var(--text)] sm:text-sm"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={`h-10 w-full min-w-0 rounded-[5px] border bg-[#f4f8fb] py-2 pl-2 pr-10 text-xs text-[#16324f] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#1f74d8]/20 sm:h-12 sm:py-3 sm:pl-3 sm:pr-12 sm:text-sm ${errors.password ? "border-red-500" : "border-[#dfe7ef] focus:border-[#1f74d8]"}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-[var(--muted)] transition hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--primary)]/30 sm:w-12"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    aria-hidden="true"
                  >
                    <path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    aria-hidden="true"
                  >
                    <path d="M17.8827 19.2968C16.1814 20.3755 14.1638 21.0002 12.0003 21.0002C6.60812 21.0002 2.12215 17.1204 1.18164 12.0002C1.61832 9.62282 2.81932 7.5129 4.52047 5.93457L1.39366 2.80777L2.80788 1.39355L22.6069 21.1925L21.1927 22.6068L17.8827 19.2968ZM5.9356 7.3497C4.60673 8.56015 3.6378 10.1672 3.22278 12.0002C4.14022 16.0521 7.7646 19.0002 12.0003 19.0002C13.5997 19.0002 15.112 18.5798 16.4243 17.8384L14.396 15.8101C13.7023 16.2472 12.8808 16.5002 12.0003 16.5002C9.51498 16.5002 7.50026 14.4854 7.50026 12.0002C7.50026 11.1196 7.75317 10.2981 8.19031 9.60442L5.9356 7.3497ZM12.9139 14.328L9.67246 11.0866C9.5613 11.3696 9.50026 11.6777 9.50026 12.0002C9.50026 13.3809 10.6196 14.5002 12.0003 14.5002C12.3227 14.5002 12.6309 14.4391 12.9139 14.328ZM20.8068 16.5925L19.376 15.1617C20.0319 14.2268 20.5154 13.1586 20.7777 12.0002C19.8603 7.94818 16.2359 5.00016 12.0003 5.00016C11.1544 5.00016 10.3329 5.11773 9.55249 5.33818L7.97446 3.76015C9.22127 3.26959 10.5793 3.00016 12.0003 3.00016C17.3924 3.00016 21.8784 6.87992 22.8189 12.0002C22.5067 13.6998 21.8037 15.2628 20.8068 16.5925ZM11.7229 7.50857C11.8146 7.50299 11.9071 7.50016 12.0003 7.50016C14.4855 7.50016 16.5003 9.51488 16.5003 12.0002C16.5003 12.0933 16.4974 12.1858 16.4919 12.2775L11.7229 7.50857Z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="mt-1 flex h-10 items-center justify-center gap-2 rounded-[5px] bg-[#1f74d8] px-3 text-xs font-semibold text-white transition hover:bg-[#175eaf] focus:outline-none focus:ring-2 focus:ring-[#1f74d8]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:px-4 sm:text-sm"
          >
            {isLoggingIn ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
