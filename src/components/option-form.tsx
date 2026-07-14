import { type FormEvent, useState } from "react";
import type { CategoryConfig, SpecFieldConfig } from "../data/categories.ts";
import type {
	ComponentOption,
	ComponentSpecs,
	NewComponentOption,
} from "../types/component.ts";

interface OptionFormProps {
	category: CategoryConfig;
	initial?: ComponentOption;
	onSubmit: (data: NewComponentOption) => void;
	onCancel: () => void;
}

type SpecFormValues = Record<string, string>;

function specsToFormValues(
	fields: SpecFieldConfig[],
	specs: ComponentSpecs | undefined,
): SpecFormValues {
	const values: SpecFormValues = {};
	for (const field of fields) {
		const raw = specs?.[field.key];
		if (raw === undefined) {
			values[field.key] = "";
		} else if (Array.isArray(raw)) {
			values[field.key] = raw.join(", ");
		} else {
			values[field.key] = String(raw);
		}
	}
	return values;
}

function formValuesToSpecs(
	fields: SpecFieldConfig[],
	values: SpecFormValues,
): ComponentSpecs {
	const specs: ComponentSpecs = {};
	for (const field of fields) {
		const raw = values[field.key]?.trim();
		if (!raw) continue;
		if (field.type === "number") {
			// biome-ignore lint/suspicious/noExplicitAny: dynamic spec key assignment
			(specs as any)[field.key] = Number(raw);
		} else if (field.type === "tags") {
			// biome-ignore lint/suspicious/noExplicitAny: dynamic spec key assignment
			(specs as any)[field.key] = raw
				.split(",")
				.map((part) => part.trim())
				.filter(Boolean);
		} else {
			// biome-ignore lint/suspicious/noExplicitAny: dynamic spec key assignment
			(specs as any)[field.key] = raw;
		}
	}
	return specs;
}

export function OptionForm({
	category,
	initial,
	onSubmit,
	onCancel,
}: OptionFormProps) {
	const [name, setName] = useState(initial?.name ?? "");
	const [price, setPrice] = useState(initial ? String(initial.price) : "");
	const [url, setUrl] = useState(initial?.url ?? "");
	const [dateAdded, setDateAdded] = useState(
		initial?.dateAdded ?? new Date().toISOString().slice(0, 10),
	);
	const [notes, setNotes] = useState(initial?.notes ?? "");
	const [specValues, setSpecValues] = useState<SpecFormValues>(() =>
		specsToFormValues(category.specFields, initial?.specs),
	);

	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		onSubmit({
			category: category.id,
			name: name.trim(),
			price: Number(price) || 0,
			url: url.trim() || undefined,
			dateAdded,
			notes: notes.trim() || undefined,
			selected: initial?.selected ?? false,
			specs: formValuesToSpecs(category.specFields, specValues),
		});
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="mt-3 space-y-3 rounded-lg border border-slate-700 bg-slate-800 p-4"
		>
			<div className="grid gap-3 sm:grid-cols-2">
				<label className="text-sm text-slate-300">
					Nom
					<input
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
					/>
				</label>
				<label className="text-sm text-slate-300">
					Prix (€)
					<input
						required
						type="number"
						min="0"
						step="0.01"
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
					/>
				</label>
				<label className="text-sm text-slate-300">
					Lien
					<input
						type="url"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://..."
						className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
					/>
				</label>
				<label className="text-sm text-slate-300">
					Date
					<input
						type="date"
						value={dateAdded}
						onChange={(e) => setDateAdded(e.target.value)}
						className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
					/>
				</label>
			</div>

			{category.specFields.length > 0 && (
				<div className="grid gap-3 sm:grid-cols-3">
					{category.specFields.map((field) => {
						const fieldId = `spec-${category.id}-${field.key}`;
						return (
							<label
								key={field.key}
								htmlFor={fieldId}
								className="text-sm text-slate-300"
							>
								{field.label}
								{field.type === "select" ? (
									<select
										id={fieldId}
										value={specValues[field.key] ?? ""}
										onChange={(e) =>
											setSpecValues((prev) => ({
												...prev,
												[field.key]: e.target.value,
											}))
										}
										className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
									>
										<option value="">-</option>
										{field.options?.map((opt) => (
											<option key={opt} value={opt}>
												{opt}
											</option>
										))}
									</select>
								) : (
									<input
										id={fieldId}
										type={field.type === "number" ? "number" : "text"}
										value={specValues[field.key] ?? ""}
										onChange={(e) =>
											setSpecValues((prev) => ({
												...prev,
												[field.key]: e.target.value,
											}))
										}
										className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
									/>
								)}
							</label>
						);
					})}
				</div>
			)}

			<label className="block text-sm text-slate-300">
				Notes
				<textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					rows={2}
					className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
				/>
			</label>

			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onCancel}
					className="rounded px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700"
				>
					Annuler
				</button>
				<button
					type="submit"
					className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
				>
					{initial ? "Enregistrer" : "Ajouter"}
				</button>
			</div>
		</form>
	);
}
