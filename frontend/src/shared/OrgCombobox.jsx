import { useEffect, useState } from "react";
import { getOrganizationsApi } from "../features/studies/api/studiesAPI";

export default function OrgCombobox({ value, onChange, disabled, error }) {
  const [orgs, setOrgs] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getOrganizationsApi()
      .then(setOrgs)
      .catch(() => {}) // silent — user can still type a new name
      .finally(() => setFetching(false));
  }, []);

  return (
    <div className="sm:col-span-2">
      <label
        htmlFor="ct-org"
        className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#5d7187]"
      >
        Organization <span className="text-red-500">*</span>
      </label>
      <input
        id="ct-org"
        type="text"
        list="org-name-suggestions"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={fetching ? "Loading organizations…" : "e.g. aiia, icmr, nin"}
        disabled={disabled || fetching}
        autoComplete="off"
        className="mt-1.5 h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-[#f8fafc] px-3 text-sm text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:bg-white focus:ring-2 focus:ring-[#dfeeff] disabled:opacity-60"
      />
      <datalist id="org-name-suggestions">
        {orgs.map((org) => (
          <option key={org.id} value={org.name} />
        ))}
      </datalist>
      {error && (
        <p className="mt-1 text-[11px] text-[#b44536]">{error}</p>
      )}
      <p className="mt-1 text-[10px] text-[#8a9bad]">
        Choose an existing organization or type a new name.
      </p>
    </div>
  );
}
