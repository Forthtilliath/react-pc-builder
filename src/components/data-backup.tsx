import { Download, Upload } from "lucide-react";
import { type ChangeEvent, useRef } from "react";
import { useBuild } from "../context/build-context.tsx";
import type { ComponentOption } from "../types/component.ts";

interface BackupPayload {
	exportedAt: string;
	options: ComponentOption[];
	budget: number | null;
}

function isBackupPayload(value: unknown): value is BackupPayload {
	if (!value || typeof value !== "object") return false;
	const payload = value as Partial<BackupPayload>;
	return Array.isArray(payload.options);
}

export function DataBackup() {
	const { options, budget, replaceOptions, setBudget } = useBuild();
	const fileInputRef = useRef<HTMLInputElement>(null);

	function handleExport() {
		const payload: BackupPayload = {
			exportedAt: new Date().toISOString(),
			options,
			budget,
		};
		const blob = new Blob([JSON.stringify(payload, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `pc-builder-backup-${new Date().toISOString().slice(0, 10)}.json`;
		link.click();
		URL.revokeObjectURL(url);
	}

	async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		let parsed: unknown;
		try {
			parsed = JSON.parse(await file.text());
		} catch {
			window.alert("Fichier JSON invalide.");
			return;
		}

		if (!isBackupPayload(parsed)) {
			window.alert(
				"Ce fichier ne correspond pas à un export PC Builder valide.",
			);
			return;
		}

		const confirmed = window.confirm(
			`Importer ${parsed.options.length} composant(s) ? Cela remplacera la configuration actuelle.`,
		);
		if (!confirmed) return;

		replaceOptions(parsed.options);
		setBudget(parsed.budget ?? null);
	}

	return (
		<div className="flex gap-2">
			<button
				type="button"
				onClick={handleExport}
				className="flex items-center gap-1 rounded bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
			>
				<Download size={16} />
				Exporter
			</button>
			<button
				type="button"
				onClick={() => fileInputRef.current?.click()}
				className="flex items-center gap-1 rounded bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
			>
				<Upload size={16} />
				Importer
			</button>
			<input
				ref={fileInputRef}
				type="file"
				accept="application/json"
				className="hidden"
				onChange={handleFileChange}
			/>
		</div>
	);
}
