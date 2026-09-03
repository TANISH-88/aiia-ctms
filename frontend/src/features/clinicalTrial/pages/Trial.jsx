export default function Trial() {
	return (
		<div className="min-h-screen bg-[#f6f8fc] px-5 py-8 text-[#16233b] sm:px-8 lg:px-10">
			<div className="w-full">
				<div className="border-b border-slate-200 pb-6">
					<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#3d9673]">AIIA-CTMS</p>
					<h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-[#17243b]">Clinical trials</h1>
					<p className="mt-2 text-sm text-slate-500">Manage and monitor your clinical trial portfolio.</p>
				</div>
				<div className="mt-8 rounded-[5px] border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
					<p className="text-sm font-medium text-slate-700">No clinical trials to display</p>
					<p className="mt-1 text-sm text-slate-500">Trial records will appear here when they are available.</p>
				</div>
			</div>
		</div>
	);
}
