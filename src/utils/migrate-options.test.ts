import { describe, expect, test } from "bun:test";
import { migrateOptions } from "./migrate-options.ts";

describe("migrateOptions", () => {
	test("returns an empty array for non-array input", () => {
		expect(migrateOptions(undefined)).toEqual([]);
		expect(migrateOptions({})).toEqual([]);
	});

	test("renames dateAdded to updatedAt", () => {
		const [migrated] = migrateOptions([
			{ id: "1", name: "CPU", dateAdded: "2025-01-01", specs: {} },
		]);
		expect(migrated?.updatedAt).toBe("2025-01-01");
		expect(migrated).not.toHaveProperty("dateAdded");
	});

	test("leaves updatedAt untouched when already present", () => {
		const [migrated] = migrateOptions([
			{ id: "1", name: "CPU", updatedAt: "2026-05-01", specs: {} },
		]);
		expect(migrated?.updatedAt).toBe("2026-05-01");
	});

	test("wraps a string connectorType/vesaFormat into an array", () => {
		const [migrated] = migrateOptions([
			{
				id: "1",
				name: "KVM",
				updatedAt: "2026-01-01",
				specs: { connectorType: "HDMI", vesaFormat: "100x100" },
			},
		]);
		expect(migrated?.specs.connectorType).toEqual(["HDMI"]);
		expect(migrated?.specs.vesaFormat).toEqual(["100x100"]);
	});

	test("leaves an already-array connectorType/vesaFormat untouched", () => {
		const [migrated] = migrateOptions([
			{
				id: "1",
				name: "KVM",
				updatedAt: "2026-01-01",
				specs: {
					connectorType: ["HDMI", "DisplayPort"],
					vesaFormat: ["75x75", "100x100"],
				},
			},
		]);
		expect(migrated?.specs.connectorType).toEqual(["HDMI", "DisplayPort"]);
		expect(migrated?.specs.vesaFormat).toEqual(["75x75", "100x100"]);
	});

	test("defaults purchased to false when missing", () => {
		const [migrated] = migrateOptions([
			{ id: "1", name: "CPU", updatedAt: "2026-01-01", specs: {} },
		]);
		expect(migrated?.purchased).toBe(false);
	});

	test("leaves purchased untouched when already present", () => {
		const [migrated] = migrateOptions([
			{
				id: "1",
				name: "CPU",
				updatedAt: "2026-01-01",
				purchased: true,
				specs: {},
			},
		]);
		expect(migrated?.purchased).toBe(true);
	});

	test("seeds priceHistory with the current price when missing", () => {
		const [migrated] = migrateOptions([
			{
				id: "1",
				name: "CPU",
				updatedAt: "2026-03-01",
				price: 300,
				specs: {},
			},
		]);
		expect(migrated?.priceHistory).toEqual([
			{ date: "2026-03-01", price: 300 },
		]);
	});

	test("seeds priceHistory using the lower of price/salePrice", () => {
		const [migrated] = migrateOptions([
			{
				id: "1",
				name: "CPU",
				updatedAt: "2026-03-01",
				price: 300,
				salePrice: 250,
				specs: {},
			},
		]);
		expect(migrated?.priceHistory).toEqual([
			{ date: "2026-03-01", price: 250 },
		]);
	});

	test("leaves priceHistory untouched when already present", () => {
		const [migrated] = migrateOptions([
			{
				id: "1",
				name: "CPU",
				updatedAt: "2026-03-01",
				price: 300,
				priceHistory: [{ date: "2020-01-01", price: 999 }],
				specs: {},
			},
		]);
		expect(migrated?.priceHistory).toEqual([
			{ date: "2020-01-01", price: 999 },
		]);
	});

	test("moves a cooler's single socket string into compatibleSockets", () => {
		const [migrated] = migrateOptions([
			{
				id: "1",
				name: "Noctua NH-D15",
				category: "cooler",
				updatedAt: "2026-01-01",
				specs: { socket: "AM4, AM5" },
			},
		]);
		expect(migrated?.specs.compatibleSockets).toEqual(["AM4", "AM5"]);
		expect(migrated?.specs).not.toHaveProperty("socket");
	});

	test("leaves compatibleSockets untouched when already present", () => {
		const [migrated] = migrateOptions([
			{
				id: "1",
				name: "Noctua NH-D15",
				category: "cooler",
				updatedAt: "2026-01-01",
				specs: { compatibleSockets: ["AM5"] },
			},
		]);
		expect(migrated?.specs.compatibleSockets).toEqual(["AM5"]);
	});

	test("does not touch socket for non-cooler categories", () => {
		const [migrated] = migrateOptions([
			{
				id: "1",
				name: "Ryzen 7 9800X3D",
				category: "cpu",
				updatedAt: "2026-01-01",
				specs: { socket: "AM5" },
			},
		]);
		expect(migrated?.specs.socket).toBe("AM5");
		expect(migrated?.specs).not.toHaveProperty("compatibleSockets");
	});

	test("is idempotent when run twice on already-migrated data", () => {
		const once = migrateOptions([
			{ id: "1", name: "CPU", dateAdded: "2025-01-01", specs: {} },
		]);
		const twice = migrateOptions(once);
		expect(twice).toEqual(once);
	});
});
