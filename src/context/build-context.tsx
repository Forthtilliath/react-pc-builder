import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
} from "react";
import { getCategoryConfig, type SpecFieldKey } from "../data/categories.ts";
import { useLocalStorage } from "../hooks/use-local-storage.ts";
import type {
	Category,
	ComponentOption,
	NewComponentOption,
} from "../types/component.ts";
import { getEffectivePrice } from "../utils/format.ts";
import { migrateOptions } from "../utils/migrate-options.ts";

export type Action =
	| {
			type: "add";
			option: Omit<ComponentOption, "updatedAt" | "priceHistory">;
	  }
	| { type: "update"; id: string; patch: Partial<ComponentOption> }
	| { type: "delete"; id: string }
	| { type: "duplicate"; id: string; newId: string }
	| { type: "select"; category: Category; id: string };

function today(): string {
	return new Date().toISOString().slice(0, 10);
}

function getGroupKey(
	option: ComponentOption | undefined,
	groupField: SpecFieldKey | undefined,
): string | undefined {
	if (!option || !groupField) return undefined;
	const value = option.specs[groupField];
	return typeof value === "string" ? value.trim().toLowerCase() : undefined;
}

export function buildReducer(
	state: ComponentOption[],
	action: Action,
): ComponentOption[] {
	switch (action.type) {
		case "add": {
			const initialPrice = getEffectivePrice(action.option);
			return [
				...state,
				{
					...action.option,
					updatedAt: today(),
					priceHistory: [{ date: today(), price: initialPrice }],
				},
			];
		}
		case "update":
			return state.map((option) => {
				if (option.id !== action.id) return option;
				const updated = { ...option, ...action.patch };
				const previousPrice = getEffectivePrice(option);
				const newPrice = getEffectivePrice(updated);
				return {
					...updated,
					updatedAt: today(),
					priceHistory:
						newPrice !== previousPrice
							? [...option.priceHistory, { date: today(), price: newPrice }]
							: option.priceHistory,
				};
			});
		case "delete":
			return state.filter((option) => option.id !== action.id);
		case "duplicate": {
			const original = state.find((option) => option.id === action.id);
			if (!original) return state;
			const copy: ComponentOption = {
				...original,
				id: action.newId,
				name: `${original.name} (copie)`,
				selected: false,
				updatedAt: today(),
				priceHistory: [{ date: today(), price: getEffectivePrice(original) }],
			};
			return [...state, copy];
		}
		case "select": {
			const config = getCategoryConfig(action.category);
			if (config.allowMultipleSelected) {
				const target = state.find((option) => option.id === action.id);
				const groupKey = getGroupKey(target, config.groupByField);
				return state.map((option) => {
					if (option.id === action.id) {
						return { ...option, selected: !option.selected };
					}
					if (
						groupKey !== undefined &&
						option.category === action.category &&
						getGroupKey(option, config.groupByField) === groupKey
					) {
						return { ...option, selected: false };
					}
					return option;
				});
			}
			return state.map((option) =>
				option.category === action.category
					? { ...option, selected: option.id === action.id }
					: option,
			);
		}
		default:
			return state;
	}
}

interface BuildContextValue {
	options: ComponentOption[];
	addOption: (data: NewComponentOption) => void;
	updateOption: (id: string, patch: Partial<ComponentOption>) => void;
	deleteOption: (id: string) => void;
	duplicateOption: (id: string) => void;
	selectOption: (category: Category, id: string) => void;
	replaceOptions: (options: ComponentOption[]) => void;
	budget: number | null;
	setBudget: (budget: number | null) => void;
}

const BuildContext = createContext<BuildContextValue | null>(null);

export function BuildProvider({ children }: { children: ReactNode }) {
	const [options, setOptions] = useLocalStorage<ComponentOption[]>(
		"pc-builder:options",
		[],
		migrateOptions,
	);
	const [budget, setBudget] = useLocalStorage<number | null>(
		"pc-builder:budget",
		null,
	);

	const dispatch = useCallback(
		(action: Action) => setOptions((prev) => buildReducer(prev, action)),
		[setOptions],
	);

	const value = useMemo<BuildContextValue>(
		() => ({
			options,
			addOption: (data) =>
				dispatch({
					type: "add",
					option: { ...data, id: crypto.randomUUID() },
				}),
			updateOption: (id, patch) => dispatch({ type: "update", id, patch }),
			deleteOption: (id) => dispatch({ type: "delete", id }),
			duplicateOption: (id) =>
				dispatch({ type: "duplicate", id, newId: crypto.randomUUID() }),
			selectOption: (category, id) =>
				dispatch({ type: "select", category, id }),
			replaceOptions: setOptions,
			budget,
			setBudget,
		}),
		[options, dispatch, setOptions, budget, setBudget],
	);

	return (
		<BuildContext.Provider value={value}>{children}</BuildContext.Provider>
	);
}

export function useBuild(): BuildContextValue {
	const ctx = useContext(BuildContext);
	if (!ctx) {
		throw new Error("useBuild must be used within a BuildProvider");
	}
	return ctx;
}
