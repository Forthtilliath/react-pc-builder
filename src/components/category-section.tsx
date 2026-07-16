import { ChevronDown, ChevronRight, Plus, Search } from "lucide-react";
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
		replaceOptions,
		collapsedCategories,
		setCategoryCollapsed,
	} = useBuild();
	const { notify } = useToast();
	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [selectedOnly, setSelectedOnly] = useState(false);
	const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">(
		"default",
	);

	const categoryOptions = options.filter((o) => o.category === category.id);
	const isCollapsed =
		collapsedCategories[category.id] ?? categoryOptions.length === 0;
	const selectedOptions = categoryOptions.filter((o) => o.selected);
	const selectedTotal = selectedOptions.reduce(
		(sum, o) => sum + getEffectivePrice(o),
		0,
	);
	const editingOption: ComponentOption | undefined = editingId
		? categoryOptions.find((o) => o.id === editingId)
		: undefined;

	const normalizedSearch = search.trim().toLowerCase();
	const visibleOptions = categoryOptions
		.filter((o) => !selectedOnly || o.selected)
		.filter((o) => o.name.toLowerCase().includes(normalizedSearch))
		.sort((a, b) => {
			if (sortBy === "price-asc") {
				return getEffectivePrice(a) - getEffectivePrice(b);
			}
			if (sortBy === "price-desc") {
				return getEffectivePrice(b) - getEffectivePrice(a);
			}
			return 0;
		});

	const groups: Map<string, ComponentOption[]> | null =
		category.allowMultipleSelected ? new Map() : null;
	if (groups) {
		for (const option of visibleOptions) {
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
				onDelete={() => {
					const originalIndex = options.indexOf(option);
					deleteOption(option.id);
					notify(`"${option.name}" supprimé`, {
						label: "Annuler",
						onClick: () => {
							replaceOptions((prev) => {
								if (prev.some((o) => o.id === option.id)) return prev;
								const insertAt = Math.min(
									originalIndex === -1 ? prev.length : originalIndex,
									prev.length,
								);
								return [
									...prev.slice(0, insertAt),
									option,
									...prev.slice(insertAt),
								];
							});
						},
					});
				}}
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
			<div className="flex flex-wrap items-center justify-between gap-2">
				<button
					type="button"
					onClick={() => setCategoryCollapsed(category.id, !isCollapsed)}
					className="flex items-center gap-2 text-left"
				>
					{isCollapsed ? (
						<ChevronRight size={18} className="shrink-0 text-slate-500" />
					) : (
						<ChevronDown size={18} className="shrink-0 text-slate-500" />
					)}
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
				</button>
				<button
					type="button"
					onClick={() => {
						setEditingId(null);
						setIsAdding((prev) => !prev);
						setCategoryCollapsed(category.id, false);
					}}
					className="flex items-center gap-1 rounded bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700"
				>
					<Plus size={16} />
					Ajouter une version
				</button>
			</div>

			{!isCollapsed && (
				<>
					{categoryOptions.length > 1 && (
						<div className="mt-3 flex flex-wrap items-center gap-2">
							<div className="relative">
								<Search
									size={14}
									className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-slate-500"
								/>
								<input
									type="text"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Rechercher..."
									className="w-40 rounded border border-slate-600 bg-slate-900 py-1 pr-2 pl-7 text-sm text-slate-100"
								/>
							</div>
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
								className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm text-slate-100"
							>
								<option value="default">Trier par...</option>
								<option value="price-asc">Prix croissant</option>
								<option value="price-desc">Prix décroissant</option>
							</select>
							<label className="flex items-center gap-1.5 text-sm text-slate-400">
								<input
									type="checkbox"
									checked={selectedOnly}
									onChange={(e) => setSelectedOnly(e.target.checked)}
									className="accent-emerald-500"
								/>
								Sélectionné uniquement
							</label>
						</div>
					)}

					{categoryOptions.length > 0 && visibleOptions.length === 0 && (
						<p className="mt-3 text-sm text-slate-500">Aucun résultat.</p>
					)}

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
						visibleOptions.length > 0 && (
							<div className="mt-4 space-y-3">
								{visibleOptions.map((option) => renderOption(option))}
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
				</>
			)}
		</section>
	);
}
