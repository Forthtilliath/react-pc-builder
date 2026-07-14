import { Plus } from "lucide-react";
import { useState } from "react";
import { useBuild } from "../context/build-context.tsx";
import { useToast } from "../context/toast-context.tsx";
import type { CategoryConfig } from "../data/categories.ts";
import type { ComponentOption } from "../types/component.ts";
import { formatPrice, getEffectivePrice } from "../utils/format.ts";
import { OptionCard } from "./option-card.tsx";
import { OptionForm } from "./option-form.tsx";

interface CategorySectionProps {
	category: CategoryConfig;
}

export function CategorySection({ category }: CategorySectionProps) {
	const {
		options,
		addOption,
		updateOption,
		deleteOption,
		duplicateOption,
		selectOption,
	} = useBuild();
	const { notify } = useToast();
	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const categoryOptions = options.filter((o) => o.category === category.id);
	const selectedOptions = categoryOptions.filter((o) => o.selected);
	const selectedTotal = selectedOptions.reduce(
		(sum, o) => sum + getEffectivePrice(o),
		0,
	);
	const editingOption: ComponentOption | undefined = editingId
		? categoryOptions.find((o) => o.id === editingId)
		: undefined;

	const groups: Map<string, ComponentOption[]> | null =
		category.allowMultipleSelected ? new Map() : null;
	if (groups) {
		for (const option of categoryOptions) {
			const rawValue = category.groupByField
				? option.specs[category.groupByField]
				: undefined;
			const groupLabel =
				typeof rawValue === "string" && rawValue.trim()
					? rawValue.trim()
					: "Sans type";
			const group = groups.get(groupLabel);
			if (group) {
				group.push(option);
			} else {
				groups.set(groupLabel, [option]);
			}
		}
	}

	function renderOption(option: ComponentOption) {
		return editingId === option.id ? (
			<OptionForm
				key={option.id}
				category={category}
				initial={option}
				onSubmit={(data) => {
					updateOption(option.id, data);
					setEditingId(null);
				}}
				onCancel={() => setEditingId(null)}
			/>
		) : (
			<OptionCard
				key={option.id}
				option={option}
				specFields={category.specFields}
				multiple={category.allowMultipleSelected}
				onSelect={() => selectOption(category.id, option.id)}
				onEdit={() => {
					setIsAdding(false);
					setEditingId(option.id);
				}}
				onDuplicate={() => {
					duplicateOption(option.id);
					notify(`"${option.name}" dupliqué`);
				}}
				onDelete={() => deleteOption(option.id)}
				onTogglePurchased={() =>
					updateOption(option.id, { purchased: !option.purchased })
				}
			/>
		);
	}

	return (
		<section
			id={category.id}
			className="scroll-mt-24 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
		>
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-slate-100">
						{category.label}
					</h2>
					<p className="text-sm text-slate-500">
						{categoryOptions.length} version
						{categoryOptions.length > 1 ? "s" : ""}
						{selectedOptions.length > 0
							? ` · sélectionné${selectedOptions.length > 1 ? "s" : ""} : ${formatPrice(selectedTotal)}`
							: " · aucune sélection"}
					</p>
				</div>
				<button
					type="button"
					onClick={() => {
						setEditingId(null);
						setIsAdding((prev) => !prev);
					}}
					className="flex items-center gap-1 rounded bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
				>
					<Plus size={16} />
					Ajouter une version
				</button>
			</div>

			{groups ? (
				<div className="mt-4 space-y-4">
					{[...groups.entries()].map(([groupLabel, groupOptions]) => (
						<div key={groupLabel}>
							<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
								{groupLabel}
							</h3>
							<div className="space-y-3">
								{groupOptions.map((option) => renderOption(option))}
							</div>
						</div>
					))}
				</div>
			) : (
				categoryOptions.length > 0 && (
					<div className="mt-4 space-y-3">
						{categoryOptions.map((option) => renderOption(option))}
					</div>
				)
			)}

			{isAdding && !editingOption && (
				<OptionForm
					category={category}
					onSubmit={(data) => {
						addOption(data);
						setIsAdding(false);
					}}
					onCancel={() => setIsAdding(false)}
				/>
			)}
		</section>
	);
}
