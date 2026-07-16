import { type FormEvent, useState } from "react";
import type {
	CategoryConfig,
	SpecFieldConfig,
	SpecFieldKey,
} from "../data/categories.ts";
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

function parseSpecFieldValue(
	field: SpecFieldConfig,
	raw: string,
): string | number | string[] {
	switch (field.type) {
		case "number":
			return Number(raw);
		case "tags":
			return raw
				.split(",")
				.map((part) => part.trim())
				.filter(Boolean);
		default:
			return raw;
	}
}

function formValuesToSpecs(
	fields: SpecFieldConfig[],
	values: SpecFormValues,
): ComponentSpecs {
	const specs: Partial<Record<SpecFieldKey, string | number | string[]>> = {};
	for (const field of fields) {
		const raw = values[field.key]?.trim();
		if (!raw) continue;
		specs[field.key] = parseSpecFieldValue(field, raw);
	}
	return specs as ComponentSpecs;
}

export function OptionForm({
	category,
	initial,
	onSubmit,
	onCancel,
}: OptionFormProps) {
	const [name, setName] = useState(initial?.name ?? "");
	const [price, setPrice] = useState(initial ? String(initial.price) : "");
	const [salePrice, setSalePrice] = useState(
		initial?.salePrice ? String(initial.salePrice) : "",
	);
	const [url, setUrl] = useState(initial?.url ?? "");
	const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
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
			salePrice: salePrice.trim() ? Number(salePrice) : undefined,
			url: url.trim() || undefined,
			imageUrl: imageUrl.trim() || undefined,
			notes: notes.trim() || undefined,
			selected: initial?.selected ?? false,
			purchased: initial?.purchased ?? false,
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
					Prix soldé (€)
					<input
						type="number"
						min="0"
						step="0.01"
						value={salePrice}
						onChange={(e) => setSalePrice(e.target.value)}
						placeholder="si promo en cours"
						className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
					/>
				</label>
				<label className="text-sm text-slate-300">
					URL de l'image
					<input
						type="url"
						value={imageUrl}
						onChange={(e) => setImageUrl(e.target.value)}
						placeholder="https://..."
						className="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-slate-100"
					/>
				</label>
			</div>

			{category.specFields.length > 0 && (
				<div className="grid gap-3 sm:grid-cols-3">
					{category.specFields.map((field) => {
						const fieldId = `spec-${category.id}-${field.key}`;

						if (field.type === "tags" && field.options) {
							const selectedValues = (specValues[field.key] ?? "")
								.split(",")
								.map((v) => v.trim())
								.filter(Boolean);
							return (
								<div key={field.key} className="text-sm text-slate-300">
									{field.label}
									<div className="mt-1 flex flex-wrap gap-2">
										{field.options.map((opt) => {
											const checked = selectedValues.includes(opt);
											return (
												<label
													key={opt}
													className="flex items-center gap-1.5 rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-slate-200"
												>
													<input
														type="checkbox"
														checked={checked}
														onChange={() => {
															const next = checked
																? selectedValues.filter((v) => v !== opt)
																: [...selectedValues, opt];
															setSpecValues((prev) => ({
																...prev,
																[field.key]: next.join(", "),
															}));
														}}
														className="accent-emerald-500"
													/>
													{opt}
												</label>
											);
										})}
									</div>
								</div>
							);
						}

						return (
							<label
								key={field.key}
								htmlFor={fieldId}
								className="text-sm text-slate-300"
							>
								{field.label}
								{field.unit ? ` (${field.unit})` : ""}
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
										placeholder={
											field.type === "tags"
												? "Séparés par une virgule"
												: undefined
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
