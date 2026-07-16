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

// "purchased" is a new required field; older records simply didn't have it.
function defaultPurchasedFalse(raw: RawOption): RawOption {
	if ("purchased" in raw) return raw;
	return { ...raw, purchased: false };
}

// "priceHistory" is a new required field; seed it with the currently known price
// (dated at the option's last known update) instead of starting it empty.
function defaultPriceHistory(raw: RawOption): RawOption {
	if ("priceHistory" in raw) return raw;
	const price = typeof raw.price === "number" ? raw.price : 0;
	const salePrice = typeof raw.salePrice === "number" ? raw.salePrice : price;
	const date =
		typeof raw.updatedAt === "string"
			? raw.updatedAt
			: new Date().toISOString().slice(0, 10);
	return {
		...raw,
		priceHistory: [{ date, price: Math.min(price, salePrice) }],
	};
}

// Coolers used the shared single-value "socket" spec (like CPUs/motherboards), but a
// cooler often fits several sockets, so it moved to its own "compatibleSockets" array.
function migrateCoolerSocket(raw: RawOption): RawOption {
	if (raw.category !== "cooler") return raw;
	const specs = raw.specs;
	if (!specs || typeof specs !== "object") return raw;
	if (!("socket" in specs) || "compatibleSockets" in specs) return raw;
	const { socket, ...rest } = specs as Record<string, unknown>;
	const compatibleSockets =
		typeof socket === "string"
			? socket
					.split(",")
					.map((value) => value.trim())
					.filter(Boolean)
			: [];
	return { ...raw, specs: { ...rest, compatibleSockets } };
}

const MIGRATIONS: Array<(raw: RawOption) => RawOption> = [
	renameDateAddedToUpdatedAt,
	normalizeArraySpecs,
	defaultPurchasedFalse,
	defaultPriceHistory,
	migrateCoolerSocket,
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
