import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useBuild } from "../context/build-context.tsx";
import { CATEGORIES } from "../data/categories.ts";
import {
	type CompatibilityStatus,
	checkCompatibility,
} from "../utils/compatibility.ts";

const STATUS_STYLES: Record<
	CompatibilityStatus,
	{ icon: typeof CheckCircle2; className: string }
> = {
	ok: { icon: CheckCircle2, className: "text-emerald-400" },
	warning: { icon: AlertTriangle, className: "text-amber-400" },
	error: { icon: XCircle, className: "text-red-400" },
	info: { icon: Info, className: "text-slate-500" },
};

export function CompatibilityPanel() {
	const { options, psuSafetyMargin, setPsuSafetyMargin } = useBuild();
	const checks = checkCompatibility(options, psuSafetyMargin);
	const alertCount = checks.filter(
		(check) => check.status === "error" || check.status === "warning",
	).length;
	const requiredCategories = CATEGORIES.filter(
		(category) => !category.optional,
	);
	const selectedCategoryIds = new Set(
		options.filter((o) => o.selected).map((o) => o.category),
	);
	const filledCount = requiredCategories.filter((category) =>
		selectedCategoryIds.has(category.id),
	).length;
	const isComplete = filledCount === requiredCategories.length;

	return (
		<section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<h2 className="text-lg font-semibold text-slate-100">
						Compatibilité
					</h2>
					<span
						className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
							isComplete && alertCount === 0
								? "bg-emerald-500/15 text-emerald-400"
								: "bg-amber-500/15 text-amber-400"
						}`}
					>
						{filledCount}/{requiredCategories.length} catégories · {alertCount}{" "}
						alerte{alertCount !== 1 ? "s" : ""}
					</span>
				</div>
				<label className="flex items-center gap-2 text-sm text-slate-400">
					Marge de sécurité alimentation (%)
					<input
						type="number"
						min="100"
						step="5"
						value={Math.round(psuSafetyMargin * 100)}
						onChange={(e) => {
							const percent = Number(e.target.value);
							if (percent > 0) setPsuSafetyMargin(percent / 100);
						}}
						className="w-20 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
					/>
				</label>
			</div>
			<ul className="mt-3 space-y-2">
				{checks.map((check) => {
					const { icon: Icon, className } = STATUS_STYLES[check.status];
					return (
						<li key={check.id} className="flex items-start gap-2 text-sm">
							<Icon size={16} className={`mt-0.5 shrink-0 ${className}`} />
							<div>
								<span className="text-slate-200">{check.label}</span>
								<span className="text-slate-500"> — {check.message}</span>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
