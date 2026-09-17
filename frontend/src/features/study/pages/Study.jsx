import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudiesApi } from "../../studies/api/studiesAPI";

export default function Study() {
	const navigate = useNavigate();
	const [studies, setStudies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	useEffect(() => {
		const loadStudies = async () => {
			try {
				setLoading(true);
				setError(null);
				setStudies(await getStudiesApi());
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		loadStudies();
	}, []);

	const formatValue = (value) =>
		value
			? value
					.split("_")
					.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
					.join(" ")
			: "Not specified";

	const getStatusColor = (status) => {
		switch (status) {
			case "active":
				return "bg-[#e5f6ee] text-[#14734c]";
			case "enrolling":
				return "bg-[#e6f2ff] text-[#145db5]";
			case "ec_approved":
				return "bg-[#fff7df] text-[#8a6710]";
			case "closed":
				return "bg-[#eef1f5] text-[#53657d]";
			default:
				return "bg-[#f2f5f8] text-[#5d7187]";
		}
	};

	const filteredStudies = studies.filter((study) => {
		const search = searchTerm.trim().toLowerCase();
		const matchesSearch =
			!search ||
			study.title?.toLowerCase().includes(search) ||
			study.ctri_number?.toLowerCase().includes(search) ||
			study.phase?.toLowerCase().includes(search);
		const matchesStatus = statusFilter === "all" || study.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const statusOptions = [...new Set(studies.map((study) => study.status).filter(Boolean))];

	if (loading) {
		return (
			<div className="min-h-screen bg-[#f4f8fb] px-5 py-8 sm:px-8 lg:px-10">
				<div className="border-b border-[#dfe7ef] pb-6">
					<div className="h-3 w-24 animate-pulse rounded bg-[#dfe7ef]" />
					<div className="mt-3 h-8 w-40 animate-pulse rounded bg-[#dfe7ef]" />
					<div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-[#dfe7ef]" />
				</div>
				<div className="mt-8 overflow-hidden rounded-md border border-[#dfe7ef] bg-white">
					{[1, 2, 3].map((row) => (
						<div key={row} className="flex gap-6 border-b border-[#edf1f5] px-5 py-5 last:border-b-0">
							<div className="h-4 flex-1 animate-pulse rounded bg-[#edf1f5]" />
							<div className="h-4 w-20 animate-pulse rounded bg-[#edf1f5]" />
							<div className="h-4 w-28 animate-pulse rounded bg-[#edf1f5]" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f4f8fb] px-5 py-8 text-[#16324f] sm:px-8 lg:px-10">
			<div className="w-full">
				<div className="flex flex-col gap-5 border-b border-[#dfe7ef] pb-6 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d9488]">AIIA-CTMS</p>
						<h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-[#16324f]">Studies</h1>
						<p className="mt-2 max-w-2xl text-sm text-[#5d7187]">Review clinical study records, registration, and current status.</p>
					</div>
					<p className="text-xs font-medium text-[#5d7187]">{studies.length} {studies.length === 1 ? "study" : "studies"} in scope</p>
				</div>

				{error && (
					<div className="mt-8 border-y border-[#f1c8c2] bg-[#fff7f5] px-5 py-4 text-sm text-[#9f3f32]">
						<p className="font-semibold">Unable to load studies</p>
						<p className="mt-1">{error}</p>
					</div>
				)}

				{!error && studies.length === 0 ? (
					<div className="mt-8 border-y border-[#dfe7ef] py-10">
						<p className="text-sm font-semibold text-[#16324f]">No studies to display</p>
						<p className="mt-1 text-sm text-[#5d7187]">Study records will appear here when they are available.</p>
					</div>
				) : !error ? (
					<>
						<div className="mt-7 flex flex-col gap-3 border-y border-[#dfe7ef] py-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="text-sm font-semibold text-[#16324f]">Study register</p>
								<p className="mt-1 text-xs text-[#5d7187]">{filteredStudies.length} of {studies.length} records shown</p>
							</div>
							<div className="flex flex-col gap-2 sm:flex-row">
								<label className="sr-only" htmlFor="study-search">Search studies</label>
								<input
									id="study-search"
									type="search"
									value={searchTerm}
									onChange={(event) => setSearchTerm(event.target.value)}
									placeholder="Search title, phase, or CTRI"
									className="h-10 w-full rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-xs text-[#16324f] outline-none transition placeholder:text-[#8a9bad] focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff] sm:w-60"
								/>
								<label className="sr-only" htmlFor="study-status">Filter by status</label>
								<select
									id="study-status"
									value={statusFilter}
									onChange={(event) => setStatusFilter(event.target.value)}
									className="h-10 rounded-[5px] border border-[#cfdbe7] bg-white px-3 text-xs text-[#16324f] outline-none transition focus:border-[#1f74d8] focus:ring-2 focus:ring-[#dfeeff]"
								>
									<option value="all">All statuses</option>
									{statusOptions.map((status) => (
										<option key={status} value={status}>{formatValue(status)}</option>
									))}
								</select>
							</div>
						</div>

						<div className="mt-5 hidden overflow-x-auto rounded-md border border-[#dfe7ef] bg-white shadow-[0_8px_24px_rgba(19,52,80,0.06)] md:block">
							<table className="w-full min-w-190 border-collapse text-left">
								<thead className="bg-[#fbfcfe]">
									<tr className="border-b border-[#dfe7ef]">
										{["Title", "Status", "Phase", "CTRI Number", "Target Enrollment", "Actions"].map((heading) => (
											<th key={heading} className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5d7187]">{heading}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{filteredStudies.map((study) => (
										<tr key={study.id} className="border-b border-[#edf1f5] transition-colors last:border-b-0 hover:bg-[#f8fbfe]">
											<td className="px-5 py-4 text-sm font-medium text-[#16324f]">{study.title}</td>
											<td className="px-5 py-4 text-sm"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(study.status)}`}>{formatValue(study.status)}</span></td>
											<td className="px-5 py-4 text-sm text-[#5d7187]">{study.phase || "Not specified"}</td>
											<td className="px-5 py-4 font-mono text-xs text-[#5d7187]">{study.ctri_number || "Not registered"}</td>
											<td className="px-5 py-4 text-sm text-[#5d7187]">{study.target_enrollment}</td>
											<td className="px-5 py-4 text-sm">
												<button type="button" onClick={() => navigate(`/studies/${study.id}`)} className="font-medium text-[#1f74d8] transition hover:text-[#145db5] hover:underline focus:outline-none focus:ring-2 focus:ring-[#dfeeff]">
													View details <span aria-hidden="true">→</span>
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="mt-5 grid gap-3 md:hidden">
							{filteredStudies.map((study) => (
								<article key={study.id} className="border-y border-[#dfe7ef] bg-white px-4 py-4 first:border-t">
									<div className="flex items-start justify-between gap-4">
										<h2 className="text-sm font-semibold leading-5 text-[#16324f]">{study.title}</h2>
										<span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(study.status)}`}>{formatValue(study.status)}</span>
									</div>
									<dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
										<div><dt className="uppercase tracking-[0.12em] text-[#8a9bad]">Phase</dt><dd className="mt-1 text-[#5d7187]">{study.phase || "Not specified"}</dd></div>
										<div><dt className="uppercase tracking-[0.12em] text-[#8a9bad]">Target enrollment</dt><dd className="mt-1 text-[#5d7187]">{study.target_enrollment}</dd></div>
									</dl>
									<div className="mt-4 flex items-center justify-between gap-3 border-t border-[#edf1f5] pt-3">
										<span className="font-mono text-xs text-[#5d7187]">{study.ctri_number || "Not registered"}</span>
										<button type="button" onClick={() => navigate(`/studies/${study.id}`)} className="text-sm font-medium text-[#1f74d8] focus:outline-none focus:ring-2 focus:ring-[#dfeeff]">
											View details <span aria-hidden="true">→</span>
										</button>
									</div>
								</article>
							))}
						</div>

						{filteredStudies.length === 0 && <div className="mt-5 border-y border-[#dfe7ef] py-8 text-sm text-[#5d7187]">No studies match the current search or status filter.</div>}
					</>
				) : null}
			</div>
		</div>
	);
}
