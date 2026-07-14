import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { SpecFieldConfig } from "../data/categories.ts";
import type { ComponentOption } from "../types/component.ts";
import {
	formatDate,
	formatPrice,
	getDiscountPercent,
	getEffectivePrice,
} from "../utils/format.ts";

interface OptionCardProps {
	option: ComponentOption;
	specFields: SpecFieldConfig[];
	multiple?: boolean;
	onSelect: () => void;
	onEdit: () => void;
	onDuplicate: () => void;
	onDelete: () => void;
}

function formatSpecValue(value: unknown): string {
	if (value === undefined || value === null || value === "") return "-";
	if (Array.isArray(value)) return value.join(", ");
	return String(value);
}

export function OptionCard({
	option,
	specFields,
	multiple,
	onSelect,
	onEdit,
	onDuplicate,
	onDelete,
}: OptionCardProps) {
	const discountPercent = getDiscountPercent(option.price, option.salePrice);
	const effectivePrice = getEffectivePrice(option);

	return (
		<div
			className={`rounded-lg border p-4 transition-colors ${
				option.selected
					? "border-emerald-500 bg-emerald-500/10"
					: "border-slate-700 bg-slate-800/50"
			}`}
		>
			<div className="flex items-start justify-between gap-3">
				<label className="flex items-start gap-3 cursor-pointer">
					<input
						type={multiple ? "checkbox" : "radio"}
						checked={option.selected}
						onChange={onSelect}
						className="mt-1 accent-emerald-500"
					/>
					<div>
						<p className="font-medium text-slate-100">{option.name}</p>
						<p className="text-xs text-slate-500" title="Dernière mise à jour">
							{formatDate(option.updatedAt)}
						</p>
					</div>
				</label>
				<div className="flex flex-col items-end gap-1.5">
					<div className="flex items-center gap-1 text-slate-400">
						{option.url && (
							<a
								href={option.url}
								target="_blank"
								rel="noreferrer"
								className="p-1.5 hover:text-emerald-400"
								title="Ouvrir le lien"
							>
								<ExternalLink size={16} />
							</a>
						)}
						<button
							type="button"
							onClick={onEdit}
							className="p-1.5 hover:text-emerald-400"
							title="Modifier"
						>
							<Pencil size={16} />
						</button>
						<button
							type="button"
							onClick={onDuplicate}
							className="p-1.5 hover:text-emerald-400"
							title="Dupliquer pour comparer"
						>
							<Copy size={16} />
						</button>
						<button
							type="button"
							onClick={onDelete}
							className="p-1.5 hover:text-red-400"
							title="Supprimer"
						>
							<Trash2 size={16} />
						</button>
					</div>
					<div className="flex flex-wrap items-baseline justify-end gap-2">
						<span className="text-lg font-bold text-emerald-400">
							{formatPrice(effectivePrice)}
						</span>
						{discountPercent !== null && (
							<>
								<span className="text-sm text-slate-500 line-through">
									{formatPrice(option.price)}
								</span>
								<span className="rounded bg-red-500/15 px-1.5 py-0.5 text-xs font-semibold text-red-400">
									-{discountPercent}%
								</span>
							</>
						)}
					</div>
				</div>
			</div>
			{specFields.length > 0 && (
				<dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400 sm:grid-cols-3">
					{specFields.map((field) => (
						<div key={field.key}>
							<dt className="inline text-slate-500">{field.label}: </dt>
							<dd className="inline">
								{formatSpecValue(option.specs[field.key])}
							</dd>
						</div>
					))}
				</dl>
			)}
			{option.notes && (
				<p className="mt-2 text-xs text-slate-500 italic">{option.notes}</p>
			)}
		</div>
	);
}
