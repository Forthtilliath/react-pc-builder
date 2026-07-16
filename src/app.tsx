import { FileText } from "lucide-react";
import { useState } from "react";
import { BuildSummary } from "./components/build-summary.tsx";
import { CategoryNav } from "./components/category-nav.tsx";
import { CategorySection } from "./components/category-section.tsx";
import { CollapseControls } from "./components/collapse-controls.tsx";
import { CompatibilityPanel } from "./components/compatibility-panel.tsx";
import { DataBackup } from "./components/data-backup.tsx";
import { TotalBar } from "./components/total-bar.tsx";
import { BuildProvider } from "./context/build-context.tsx";
import { ToastProvider } from "./context/toast-context.tsx";
import { CATEGORIES } from "./data/categories.ts";
import "./index.css";

export function App() {
	const [showSummary, setShowSummary] = useState(false);

	return (
		<ToastProvider>
			<BuildProvider>
				<div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-8">
					<div className="mx-auto max-w-6xl space-y-6">
						<header className="flex flex-wrap items-start justify-between gap-4">
							<div>
								<h1 className="text-2xl font-bold">PC Builder</h1>
								<p className="text-sm text-slate-400">
									Suivi d'achat pour le prochain PC : compare les versions,
									garde le total à jour et vérifie la compatibilité.
								</p>
							</div>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setShowSummary(true)}
									className="flex items-center gap-1 rounded bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
								>
									<FileText size={16} />
									Résumé
								</button>
								<DataBackup />
							</div>
						</header>

						<TotalBar />
						<CompatibilityPanel />

						<div className="grid gap-6 lg:grid-cols-[200px_1fr]">
							<CategoryNav />
							<div className="space-y-4">
								<CollapseControls />
								{CATEGORIES.map((category) => (
									<CategorySection key={category.id} category={category} />
								))}
							</div>
						</div>
					</div>
				</div>
				{showSummary && <BuildSummary onClose={() => setShowSummary(false)} />}
			</BuildProvider>
		</ToastProvider>
	);
}
