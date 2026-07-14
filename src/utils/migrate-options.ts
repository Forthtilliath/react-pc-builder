import type { ComponentOption } from "../types/component.ts";

type RawOption = Record<string, unknown>;

// Renamed in this app's history: "dateAdded" (manually set) -> "updatedAt" (auto-stamped).
function renameDateAddedToUpdatedAt(raw: RawOption): RawOption {
	if ("dateAdded" in raw && !("updatedAt" in raw)) {
		const { dateAdded, ...rest } = raw;
		return { ...rest, updatedAt: dateAdded };
	}
	return raw;
}

// connectorType and vesaFormat moved from a single string to a string[] to support
// components with multiple values (e.g. a KVM switch with both DisplayPort and HDMI).
function normalizeArraySpecs(raw: RawOption): RawOption {
	const specs = raw.specs;
	if (!specs || typeof specs !== "object") return raw;
	const migratedSpecs: Record<string, unknown> = { ...specs };
	for (const key of ["connectorType", "vesaFormat"] as const) {
		if (typeof migratedSpecs[key] === "string") {
			migratedSpecs[key] = [migratedSpecs[key]];
		}
	}
	return { ...raw, specs: migratedSpecs };
}

const MIGRATIONS: Array<(raw: RawOption) => RawOption> = [
	renameDateAddedToUpdatedAt,
	normalizeArraySpecs,
];

// Each step only touches shapes it recognizes as outdated, so re-running all of them is idempotent.
export function migrateOptions(value: unknown): ComponentOption[] {
	if (!Array.isArray(value)) return [];
	return value.map((item) => {
		let migrated = item as RawOption;
		for (const migrate of MIGRATIONS) {
			migrated = migrate(migrated);
		}
		return migrated;
	}) as unknown as ComponentOption[];
}
