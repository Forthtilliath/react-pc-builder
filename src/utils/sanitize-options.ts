import { CATEGORIES, getCategoryConfig } from "../data/categories.ts";
import type {
	Category,
	ComponentOption,
	ComponentSpecs,
	PricePoint,
} from "../types/component.ts";

const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.id));

function isValidCategory(value: unknown): value is Category {
	return typeof value === "string" && VALID_CATEGORIES.has(value);
}

function asString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

function asFiniteNumber(value: unknown): number | undefined {
	return typeof value === "number" && Number.isFinite(value)
		? value
		: undefined;
}

function todayIso(): string {
	return new Date().toISOString().slice(0, 10);
}

// Keeps only the spec keys the category actually defines, and only when the
// stored value has the type that field expects — anything else (wrong type,
// unknown key, garbage from a hand-edited or corrupted file) is dropped
// instead of being carried into arithmetic/compatibility checks that assume
// well-typed specs.
function sanitizeSpecs(category: Category, rawSpecs: unknown): ComponentSpecs {
	const specs: Record<string, unknown> = {};
	if (!rawSpecs || typeof rawSpecs !== "object") return specs as ComponentSpecs;
	const raw = rawSpecs as Record<string, unknown>;
	for (const field of getCategoryConfig(category).specFields) {
		const value = raw[field.key];
		if (value === undefined) continue;
		if (field.type === "number") {
			const num = asFiniteNumber(value);
			if (num !== undefined) specs[field.key] = num;
		} else if (field.type === "tags") {
			if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
				specs[field.key] = value;
			}
		} else if (typeof value === "string") {
			specs[field.key] = value;
		}
	}
	return specs as ComponentSpecs;
}

function isValidPricePoint(value: unknown): value is PricePoint {
	return (
		!!value &&
		typeof value === "object" &&
		typeof (value as PricePoint).date === "string" &&
		asFiniteNumber((value as PricePoint).price) !== undefined
	);
}

function sanitizePriceHistory(
	value: unknown,
	fallbackPrice: number,
	fallbackDate: string,
): PricePoint[] {
	if (Array.isArray(value)) {
		const points = value.filter(isValidPricePoint);
		if (points.length > 0) return points;
	}
	return [{ date: fallbackDate, price: fallbackPrice }];
}

// Turns arbitrary parsed JSON (a corrupted localStorage value, a hand-edited
// backup file...) into well-formed ComponentOptions. Entries that can't be
// placed anywhere (missing/unknown category) are dropped; every other field
// gets a safe default instead of letting a bad type reach the rest of the app.
export function sanitizeOptions(value: unknown): ComponentOption[] {
	if (!Array.isArray(value)) return [];

	const seenIds = new Set<string>();
	const result: ComponentOption[] = [];

	for (const item of value) {
		if (!item || typeof item !== "object") continue;
		const raw = item as Record<string, unknown>;
		if (!isValidCategory(raw.category)) continue;
		const category = raw.category;

		let id = asString(raw.id);
		if (!id || seenIds.has(id)) id = crypto.randomUUID();
		seenIds.add(id);

		const price = asFiniteNumber(raw.price) ?? 0;
		const salePrice = asFiniteNumber(raw.salePrice);
		const updatedAt = asString(raw.updatedAt) ?? todayIso();

		result.push({
			id,
			category,
			name: asString(raw.name) ?? "",
			price,
			salePrice,
			url: asString(raw.url),
			imageUrl: asString(raw.imageUrl),
			updatedAt,
			selected: raw.selected === true,
			purchased: raw.purchased === true,
			notes: asString(raw.notes),
			specs: sanitizeSpecs(category, raw.specs),
			priceHistory: sanitizePriceHistory(
				raw.priceHistory,
				salePrice ?? price,
				updatedAt,
			),
		});
	}

	return result;
}
