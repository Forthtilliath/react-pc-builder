import { Printer, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useBuild } from "../context/build-context.tsx";
import { CATEGORIES } from "../data/categories.ts";
import { formatPrice, getEffectivePrice } from "../utils/format.ts";

interface BuildSummaryProps {
	onClose: () => void;
}

const FOCUSABLE_SELECTOR =
	'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function BuildSummary({ onClose }: BuildSummaryProps) {
	const { options } = useBuild();
	const containerRef = useRef<HTMLDivElement>(null);
	const selected = options.filter((o) => o.selected);
	const total = selected.reduce((sum, o) => sum + getEffectivePrice(o), 0);
	const groups = CATEGORIES.map((category) => ({
		category,
		items: selected.filter((o) => o.category === category.id),
	})).filter((group) => group.items.length > 0);

	useEffect(() => {
		containerRef.current?.focus();

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				onClose();
				return;
			}
			const container = containerRef.current;
			if (event.key !== "Tab" || !container) return;
			const focusable =
				container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
			if (focusable.length === 0) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:relative print:bg-white print:p-0">
			<div
				ref={containerRef}
				role="dialog"
				aria-modal="true"
				aria-label="Résumé de la configuration"
				tabIndex={-1}
				className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6 outline-none print:max-h-none print:w-full print:max-w-none print:overflow-visible print:border-0 print:bg-white print:text-black"
			>
				<div className="flex items-center justify-between print:hidden">
					<h2 className="text-xl font-bold text-slate-100">
						Résumé de la configuration
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="p-1.5 text-slate-400 hover:text-slate-100"
						title="Fermer"
					>
						<X size={20} />
					</button>
				</div>

				<div className="mt-4 space-y-4">
					{groups.map(({ category, items }) => (
						<div key={category.id}>
							<h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 print:text-slate-600">
								{category.label}
							</h3>
							{items.map((item) => (
								<div
									key={item.id}
									className="flex justify-between gap-4 text-sm text-slate-200 print:text-black"
								>
									<span>{item.name}</span>
									<span className="shrink-0">
										{formatPrice(getEffectivePrice(item))}
									</span>
								</div>
							))}
						</div>
					))}
					{groups.length === 0 && (
						<p className="text-sm text-slate-500">
							Aucun composant sélectionné pour le moment.
						</p>
					)}
				</div>

				<div className="mt-6 flex justify-between border-t border-slate-700 pt-4 text-lg font-bold text-emerald-400 print:border-slate-300 print:text-black">
					<span>Total</span>
					<span>{formatPrice(total)}</span>
				</div>

				<div className="mt-4 flex justify-end print:hidden">
					<button
						type="button"
						onClick={() => window.print()}
						className="flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
					>
						<Printer size={16} />
						Imprimer / Exporter en PDF
					</button>
				</div>
			</div>
		</div>
	);
}
