import { useBuild } from "../context/build-context.tsx";
import { CATEGORIES } from "../data/categories.ts";
import { formatPrice } from "../utils/format.ts";

export function TotalBar() {
	const { options } = useBuild();
	const selected = options.filter((o) => o.selected);
	const total = selected.reduce((sum, o) => sum + o.price, 0);
	const missingCategories = CATEGORIES.filter(
		(category) =>
			!category.optional && !selected.some((o) => o.category === category.id),
	);

	return (
		<div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/90 p-4 backdrop-blur">
			<div>
				<p className="text-sm text-slate-400">Total configuration</p>
				<p className="text-2xl font-bold text-emerald-400">
					{formatPrice(total)}
				</p>
			</div>
			{missingCategories.length > 0 && (
				<p className="text-sm text-amber-400">
					Encore à choisir : {missingCategories.map((c) => c.label).join(", ")}
				</p>
			)}
		</div>
	);
}
