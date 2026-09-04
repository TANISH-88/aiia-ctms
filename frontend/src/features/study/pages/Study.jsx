import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudiesApi } from "../../studies/api/studiesAPI";

export default function Study() {
	const navigate = useNavigate();
	const [studies, setStudies] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

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

	return (
		<div className="min-h-screen bg-[#f6f8fc] px-5 py-8 text-[#16233b] sm:px-8 lg:px-10">
			<div className="w-full">
				<div className="border-b border-slate-200 pb-6">
					<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">AIIA-CTMS</p>
					<h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">Studies</h1>
					<p className="mt-2 text-sm text-slate-500">Review seeded AIIA clinical studies and their current status.</p>
				</div>

				{loading && <p className="mt-8 text-sm text-slate-500">Loading studies...</p>}
				{error && <p className="mt-8 rounded-[5px] border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

				{!loading && !error && studies.length === 0 && (
					<div className="mt-8 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
						<p className="text-sm font-medium text-slate-700">No studies to display</p>
						<p className="mt-1 text-sm text-slate-500">Study records will appear here when they are available.</p>
					</div>
				)}

				{!loading && !error && studies.length > 0 && (
					<div className="mt-8 overflow-x-auto rounded-[5px] border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
						<table className="w-full min-w-[760px] border-collapse text-left">
							<thead className="bg-[#fbfcfe]"><tr className="border-b border-slate-200">
								{["Title", "Status", "Phase", "CTRI Number", "Target Enrollment", "Actions"].map((heading) => <th key={heading} className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{heading}</th>)}
							</tr></thead>
							<tbody>{studies.map((study) => (
								<tr key={study.id} className="border-b border-slate-100 hover:bg-slate-50">
									<td className="px-5 py-4 text-sm font-medium text-slate-900">{study.title}</td>
									<td className="px-5 py-4 text-sm capitalize text-slate-600">{study.status}</td>
									<td className="px-5 py-4 text-sm text-slate-600">{study.phase || "Not specified"}</td>
									<td className="px-5 py-4 text-sm text-slate-600">{study.ctri_number || "Not registered"}</td>
									<td className="px-5 py-4 text-sm text-slate-600">{study.target_enrollment}</td>
									<td className="px-5 py-4 text-sm"><button type="button" onClick={() => navigate(`/studies/${study.id}`)} className="text-[#1d5edb] hover:underline">View Details</button></td>
								</tr>
							))}</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
