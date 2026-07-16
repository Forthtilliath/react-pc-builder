import { useBuild } from "../context/build-context.tsx";

export function CollapseControls() {
	const { setAllCategoriesCollapsed } = useBuild();

	return (
		<div className="flex flex-wrap justify-end gap-2">
			<button
				type="button"
				onClick={() => setAllCategoriesCollapsed(false)}
				className="rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
			>
				Tout déplier
			</button>
			<button
				type="button"
				onClick={() => setAllCategoriesCollapsed(true)}
				className="rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700"
			>
				Tout replier
			</button>
		</div>
	);
}
