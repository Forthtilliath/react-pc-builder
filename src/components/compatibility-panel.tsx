import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useBuild } from "../context/build-context.tsx";
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
	const { options } = useBuild();
	const checks = checkCompatibility(options);

	return (
		<section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
			<h2 className="text-lg font-semibold text-slate-100">Compatibilité</h2>
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
