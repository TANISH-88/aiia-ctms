import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createStudyApi } from "../../studies/api/studiesAPI";
import { supabase } from "../../../api/supabase";

// Phase options matching the study_status context used in the app
const PHASE_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "Phase I", label: "Phase I" },
  { value: "Phase II", label: "Phase II" },
  { value: "Phase III", label: "Phase III" },
  { value: "Phase IV", label: "Phase IV" },
  { value: "Observational", label: "Observational" },
  { value: "Pilot", label: "Pilot" },
];

// The three roles the admin must create via admin-create-user Edge Function
const TEAM_ROLES = [
  {
    key: "pi",
    label: "Principal Investigator",
    role: "principal_investigator",
    hint: "AIIA staff — leads the clinical trial",
    accent: "#1f74d8",
    accentBg: "#dfeeff",
  },
  {
    key: "coordinator",
    label: "Study Coordinator",
    role: "study_coordinator",
    hint: "AIIA staff — manages day-to-day study operations",
    accent: "#2eaa72",
    accentBg: "#e5f6ee",
  },
  {
    key: "monitor",
    label: "Monitor",
    role: "monitor",
    hint: "Company seat — oversees trial conduct and data integrity",
    accent: "#7c5ce9",
    accentBg: "#ede8ff",
  },
];

/**
 * Calls the admin-create-user Edge Function.
 * supabase.functions.invoke automatically forwards the session JWT.
 * The Edge Function verifies admin role server-side before creating the user.
 */
async function invokeCreateUser({ email, name, role, studyId, password }) {
  const { data, error } = await supabase.functions.invoke("admin-create-user", {
    body: { email, name, role, study_id: studyId, password: password || undefined },
  });

  if (error) {
    throw new Error(error.message || "Edge Function call failed");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

// ─── Step 1: Study Details Form ────────────────────────────────────────────

function StudyForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [targetEnrollment, setTargetEnrollment] = useState("");
  const [phase, setPhase] = useState("");
  const [ctriNumber, setCtriNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ecId, setEcId] = useState("");
  const [ecList, setEcList] = useState([]);
  const [ecLoading, setEcLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load existing Ethics Committee accounts (requires profiles_admin_read RLS policy)
  useEffect(() => {
    const loadEcAccounts = async () => {
      try {
        setEcLoading(true);
        const { data, error: ecError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "ethics_committee")
          .order("full_name", { ascending: true });

        if (ecError) throw ecError;
        setEcList(data || []);
      } catch (err) {
        console.error("Failed to load EC accounts:", err.message);
        setEcList([]);
      } finally {
        setEcLoading(false);
      }
    };

    loadEcAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!ecId) {
      setError("Please select an Ethics Committee member before creating the study.");
      return;
    }

    try {
      setLoading(true);

      // 1. Create the study with ec_id set
      const study = await createStudyApi({
        title,
        targetEnrollment,
        phase,
        ctriNumber,
        startDate,
        endDate,
        ecId,
      });

      // 2. Insert study_assignments row for the EC
      //    (ec_id in studies is for submission routing; study_assignments is for access/visibility)
      const { error: assignError } = await supabase
        .from("study_assignments")
        .insert({
          study_id: study.id,
          profile_id: ecId,
          role: "ethics_committee",
        });

      if (assignError) {
        // Non-fatal — study is created; log and surface as warning
        console.warn("EC study_assignment insert failed:", assignError.message);
      }

      onCreated(study);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Ethics Committee — required, full width */}
        <div className="sm:col-span-2">
          <label
            htmlFor="ct-ec"
            className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]"
          >
            Ethics Committee <span className="text-red-500">*</span>
          </label>
          <select
            id="ct-ec"
            required
            value={ecId}
            onChange={(e) => setEcId(e.target.value)}
            disabled={loading || ecLoading}
            className="mt-1.5 h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 text-sm text-[#16324f] outline-none transition focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff] disabled:opacity-60"
          >
            <option value="">
              {ecLoading ? "Loading Ethics Committees…" : ecList.length === 0 ? "No EC accounts found" : "— Select Ethics Committee —"}
            </option>
            {ecList.map((ec) => (
              <option key={ec.id} value={ec.id}>
                {ec.full_name}
              </option>
            ))}
          </select>
          {!ecLoading && ecList.length === 0 && (
            <p className="mt-1 text-[11px] text-[#b44536]">
              No Ethics Committee accounts exist. Create an EC account first, or apply the
              profiles_admin_read RLS policy if the dropdown appears empty.
            </p>
          )}
        </div>

        {/* Title — required */}
        <div className="sm:col-span-2">
          <label
            htmlFor="ct-title"
            className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]"
          >
            Study Title <span className="text-red-500">*</span>
          </label>
          <input
            id="ct-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Efficacy of Ashwagandha in Stress Management"
            className="mt-1.5 h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 text-sm text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff]"
            disabled={loading}
          />
        </div>

        {/* Target Enrollment — required */}
        <div>
          <label
            htmlFor="ct-enrollment"
            className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]"
          >
            Target Enrollment <span className="text-red-500">*</span>
          </label>
          <input
            id="ct-enrollment"
            type="number"
            required
            min="0"
            value={targetEnrollment}
            onChange={(e) => setTargetEnrollment(e.target.value)}
            placeholder="e.g. 120"
            className="mt-1.5 h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 text-sm text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff]"
            disabled={loading}
          />
        </div>

        {/* Phase — optional */}
        <div>
          <label
            htmlFor="ct-phase"
            className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]"
          >
            Phase
          </label>
          <select
            id="ct-phase"
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 text-sm text-[#16324f] outline-none transition focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff]"
            disabled={loading}
          >
            {PHASE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* CTRI Number — optional */}
        <div>
          <label
            htmlFor="ct-ctri"
            className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]"
          >
            CTRI Number <span className="text-[#8a9bad] font-normal normal-case">(optional)</span>
          </label>
          <input
            id="ct-ctri"
            type="text"
            value={ctriNumber}
            onChange={(e) => setCtriNumber(e.target.value)}
            placeholder="e.g. CTRI/2024/01/000001"
            className="mt-1.5 h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 font-mono text-sm text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff]"
            disabled={loading}
          />
        </div>

        {/* Start Date — optional */}
        <div>
          <label
            htmlFor="ct-start"
            className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]"
          >
            Start Date <span className="text-[#8a9bad] font-normal normal-case">(optional)</span>
          </label>
          <input
            id="ct-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 text-sm text-[#16324f] outline-none transition focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff]"
            disabled={loading}
          />
        </div>

        {/* End Date — optional */}
        <div>
          <label
            htmlFor="ct-end"
            className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]"
          >
            End Date <span className="text-[#8a9bad] font-normal normal-case">(optional)</span>
          </label>
          <input
            id="ct-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 text-sm text-[#16324f] outline-none transition focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff]"
            disabled={loading}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-[5px] border border-[#f1c8c2] bg-[#fff5f4] px-3 py-2 text-sm font-medium text-[#9f3f32]">
          ✗ {error}
        </p>
      )}

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-[5px] bg-[#1f74d8] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#145db5] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating study…" : "Create Study"}
        </button>
      </div>
    </form>
  );
}

// ─── Step 2: Individual team-member creation card ───────────────────────────

function TeamMemberCard({ roleConfig, studyId }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { userId, email, name, password }
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail) {
      setError("Name and email are both required.");
      return;
    }
    if (trimmedPassword && trimmedPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      const data = await invokeCreateUser({
        email: trimmedEmail,
        name: trimmedName,
        role: roleConfig.role,
        studyId,
        password: trimmedPassword || undefined,
      });
      setResult({
        userId: data.user_id,
        email: data.email,
        name: data.name,
        password: trimmedPassword || null,
      });
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-[6px] border bg-white p-5 shadow-[0_1px_2px_rgba(19,52,80,0.08)]"
      style={{ borderColor: result ? "#c3e6cb" : "#dfe7ef" }}
    >
      {/* Card header */}
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: roleConfig.accent }}
        >
          {roleConfig.label[0]}
        </span>
        <div>
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#16324f]">
            {roleConfig.label}
          </p>
          <p className="mt-0.5 text-xs text-[#5d7187]">{roleConfig.hint}</p>
        </div>
      </div>

      {/* Success state */}
      {result && (
        <div
          className="mt-4 rounded-[5px] border border-[#c3e6cb] px-3 py-2.5"
          style={{ backgroundColor: roleConfig.accentBg }}
        >
          <p className="text-xs font-semibold text-[#14734c]">✓ Account created</p>
          <dl className="mt-2 grid gap-1 text-xs">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 font-medium text-[#5d7187]">Email</dt>
              <dd className="font-mono text-[#16324f]">{result.email}</dd>
            </div>
            {result.password && (
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 font-medium text-[#5d7187]">Password</dt>
                <dd className="font-mono text-[#16324f]">{result.password}</dd>
              </div>
            )}
            {!result.password && (
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 font-medium text-[#5d7187]">Password</dt>
                <dd className="italic text-[#8a9bad]">None set — user must reset via magic link</dd>
              </div>
            )}
          </dl>
          <p className="mt-2 text-[11px] text-[#8a9bad]">
            Share these credentials with the user securely.
          </p>
        </div>
      )}

      {/* Form — shown whether result exists or not so admin can add another */}
      <form onSubmit={handleSubmit} className="mt-4 grid gap-3" noValidate>
        <div>
          <label
            htmlFor={`ct-${roleConfig.key}-name`}
            className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]"
          >
            Full Name
          </label>
          <input
            id={`ct-${roleConfig.key}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dr. Priya Sharma"
            className="mt-1.5 h-9 w-full rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 text-sm text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff]"
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div>
          <label
            htmlFor={`ct-${roleConfig.key}-email`}
            className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]"
          >
            Email Address
          </label>
          <input
            id={`ct-${roleConfig.key}-email`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@aiia.gov.in"
            className="mt-1.5 h-9 w-full rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 text-sm text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff]"
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div>
          <label
            htmlFor={`ct-${roleConfig.key}-password`}
            className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]"
          >
            Password <span className="font-normal normal-case text-[#8a9bad]">(min 8 chars)</span>
          </label>
          <div className="relative mt-1.5">
            <input
              id={`ct-${roleConfig.key}-password`}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Set a login password"
              className="h-9 w-full rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 pr-16 text-sm text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff]"
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#1f74d8] hover:text-[#145db5]"
              tabIndex={-1}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-[5px] border border-[#f1c8c2] bg-[#fff5f4] px-3 py-2 text-xs font-medium text-[#9f3f32]">
            ✗ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-9 rounded-[5px] px-4 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: roleConfig.accent }}
        >
          {loading
            ? "Creating…"
            : result
            ? `Add Another ${roleConfig.label}`
            : `Create ${roleConfig.label}`}
        </button>
      </form>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function CreateTrialPage() {
  const navigate = useNavigate();
  const [createdStudy, setCreatedStudy] = useState(null);

  return (
    <div className="min-h-screen bg-[#f4f8fb] px-5 py-8 text-[#16324f] sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">

        {/* Page header */}
        <div className="border-b border-[#dfe7ef] pb-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-sm text-[#1f74d8] hover:underline"
          >
            ← Back to Dashboard
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">
            AIIA-CTMS — Admin
          </p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">
            Create Clinical Trial
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#5d7187]">
            Set up a new study and provision team accounts in a single workflow.
            All user accounts are created through the secure server-side API —
            no credentials are exposed.
          </p>
        </div>

        {/* ── Step 1: Study Details ── */}
        <section className="mt-8">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                createdStudy
                  ? "bg-[#2eaa72] text-white"
                  : "bg-[#1f74d8] text-white"
              }`}
            >
              {createdStudy ? "✓" : "1"}
            </span>
            <h2 className="text-[17px] font-semibold text-[#16324f]">Study Details</h2>
          </div>

          <div className="mt-4 rounded-[6px] border border-[#dfe7ef] bg-white p-6 shadow-[0_1px_2px_rgba(19,52,80,0.08)]">
            {createdStudy ? (
              /* Collapsed success view after study created */
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#16324f]">{createdStudy.title}</p>
                    <p className="mt-1 font-mono text-xs text-[#5d7187]">{createdStudy.id}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#e5f6ee] px-2.5 py-1 text-xs font-medium text-[#14734c]">
                    Created
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div>
                    <dt className="uppercase tracking-[0.1em] text-[#8a9bad]">Phase</dt>
                    <dd className="mt-1 text-[#5d7187]">{createdStudy.phase || "—"}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.1em] text-[#8a9bad]">Target</dt>
                    <dd className="mt-1 text-[#5d7187]">{createdStudy.target_enrollment}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.1em] text-[#8a9bad]">Start</dt>
                    <dd className="mt-1 text-[#5d7187]">{createdStudy.start_date || "—"}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.1em] text-[#8a9bad]">Status</dt>
                    <dd className="mt-1 text-[#5d7187]">Protocol Draft</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => navigate(`/studies/${createdStudy.id}`)}
                  className="mt-4 text-xs font-medium text-[#1f74d8] hover:underline"
                >
                  View study details →
                </button>
              </div>
            ) : (
              <StudyForm onCreated={setCreatedStudy} />
            )}
          </div>
        </section>

        {/* ── Step 2: Team Members (revealed after study created) ── */}
        {createdStudy && (
          <section className="mt-10">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1f74d8] text-xs font-bold text-white">
                2
              </span>
              <h2 className="text-[17px] font-semibold text-[#16324f]">Provision Team Accounts</h2>
            </div>
            <p className="mt-2 pl-10 text-sm text-[#5d7187]">
              Each account is created via the secure{" "}
              <code className="rounded bg-[#eef1f5] px-1 font-mono text-xs">
                admin-create-user
              </code>{" "}
              Edge Function and automatically linked to study{" "}
              <code className="rounded bg-[#eef1f5] px-1 font-mono text-xs">
                {createdStudy.id.slice(0, 8)}…
              </code>{" "}
              via <code className="rounded bg-[#eef1f5] px-1 font-mono text-xs">study_assignments</code>.
              All three roles are optional — you can add them now or later.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-1 lg:grid-cols-3">
              {TEAM_ROLES.map((roleConfig) => (
                <TeamMemberCard
                  key={roleConfig.key}
                  roleConfig={roleConfig}
                  studyId={createdStudy.id}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 border-t border-[#dfe7ef] pt-6">
              <button
                type="button"
                onClick={() => navigate(`/studies/${createdStudy.id}`)}
                className="rounded-[5px] bg-[#1f74d8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#145db5]"
              >
                Go to Study Details
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-[5px] border border-[#cfdbe7] bg-white px-5 py-2.5 text-sm font-medium text-[#16324f] transition hover:bg-[#f4f8fb]"
              >
                Back to Dashboard
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
