import { useBuild } from "../context/build-context.tsx";
import { CATEGORIES } from "../data/categories.ts";
import { formatPrice, getEffectivePrice } from "../utils/format.ts";

export function TotalBar() {
	const { options, budget, setBudget } = useBuild();
	const selected = options.filter((o) => o.selected);
	const total = selected.reduce((sum, o) => sum + getEffectivePrice(o), 0);
	const purchasedTotal = selected
		.filter((o) => o.purchased)
		.reduce((sum, o) => sum + getEffectivePrice(o), 0);
	const remaining = budget !== null ? budget - total : null;
	const missingCategories = CATEGORIES.filter(
		(category) =>
			!category.optional && !selected.some((o) => o.category === category.id),
	);

	return (
		<div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg shadow-black/40 backdrop-blur">
			<div>
				<p className="text-sm text-slate-400">Total configuration</p>
				<p className="text-2xl font-bold text-emerald-400">
					{formatPrice(total)}
				</p>
			</div>
			{selected.length > 0 && (
				<div>
					<p className="text-sm text-slate-400">Déjà acheté</p>
					<p className="text-2xl font-bold text-slate-100">
						{formatPrice(purchasedTotal)}
					</p>
				</div>
			)}
			<div>
				<label className="text-sm text-slate-400" htmlFor="budget-input">
					Budget cible (€)
				</label>
				<input
					id="budget-input"
					type="number"
					min="0"
					step="0.01"
					value={budget ?? ""}
					onChange={(e) =>
						setBudget(e.target.value === "" ? null : Number(e.target.value))
					}
					placeholder="—"
					className="mt-1 block w-28 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
				/>
			</div>
			{remaining !== null && (
				<div>
					<p className="text-sm text-slate-400">
						{remaining >= 0 ? "Reste disponible" : "Dépassement"}
					</p>
					<p
						className={`text-2xl font-bold ${
							remaining >= 0 ? "text-emerald-400" : "text-red-400"
						}`}
					>
						{formatPrice(Math.abs(remaining))}
					</p>
				</div>
			)}
			{missingCategories.length > 0 && (
				<p className="text-sm text-amber-400">
					Encore à choisir : {missingCategories.map((c) => c.label).join(", ")}
				</p>
			)}
		</div>
	);
}
