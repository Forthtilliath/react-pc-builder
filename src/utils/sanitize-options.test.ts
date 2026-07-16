import { describe, expect, test } from "bun:test";
import { sanitizeOptions } from "./sanitize-options.ts";

describe("sanitizeOptions", () => {
	test("returns an empty array for non-array input", () => {
		expect(sanitizeOptions(undefined)).toEqual([]);
		expect(sanitizeOptions(null)).toEqual([]);
		expect(sanitizeOptions("garbage")).toEqual([]);
		expect(sanitizeOptions(42)).toEqual([]);
		expect(sanitizeOptions({})).toEqual([]);
	});

	test("drops entries that aren't objects", () => {
		expect(sanitizeOptions([null, 42, "x", true, []])).toEqual([]);
	});

	test("drops entries with a missing or unknown category", () => {
		const result = sanitizeOptions([
			{ id: "1", name: "CPU", price: 100 },
			{ id: "2", name: "CPU", price: 100, category: "toaster" },
			{ id: "3", name: "CPU", price: 100, category: "cpu" },
		]);
		expect(result).toHaveLength(1);
		expect(result[0]?.id).toBe("3");
	});

	test("regenerates a missing or non-string id", () => {
		const result = sanitizeOptions([
			{ category: "cpu", name: "CPU", price: 100 },
			{ category: "cpu", name: "CPU", price: 100, id: 42 },
		]);
		expect(result).toHaveLength(2);
		for (const option of result) {
			expect(typeof option.id).toBe("string");
			expect(option.id.length).toBeGreaterThan(0);
		}
	});

	test("regenerates duplicate ids so every option stays addressable", () => {
		const result = sanitizeOptions([
			{ id: "dup", category: "cpu", name: "CPU 1", price: 100 },
			{ id: "dup", category: "cpu", name: "CPU 2", price: 200 },
		]);
		expect(result).toHaveLength(2);
		expect(result[0]?.id).not.toBe(result[1]?.id);
	});

	test("defaults name and price when missing or wrong type", () => {
		const [option] = sanitizeOptions([
			{ id: "1", category: "cpu", name: 123, price: "not a number" },
		]);
		expect(option?.name).toBe("");
		expect(option?.price).toBe(0);
	});

	test("drops salePrice when it isn't a finite number", () => {
		const [option] = sanitizeOptions([
			{ id: "1", category: "cpu", name: "CPU", price: 100, salePrice: "50" },
		]);
		expect(option?.salePrice).toBeUndefined();
	});

	test("defaults updatedAt when missing or wrong type", () => {
		const [option] = sanitizeOptions([
			{ id: "1", category: "cpu", name: "CPU", price: 100, updatedAt: 12345 },
		]);
		expect(typeof option?.updatedAt).toBe("string");
		expect(option?.updatedAt.length).toBeGreaterThan(0);
	});

	test("coerces selected/purchased to booleans", () => {
		const [option] = sanitizeOptions([
			{
				id: "1",
				category: "cpu",
				name: "CPU",
				price: 100,
				selected: "true",
				purchased: 1,
			},
		]);
		expect(option?.selected).toBe(false);
		expect(option?.purchased).toBe(false);
	});

	test("keeps only known spec keys with the expected type", () => {
		const [option] = sanitizeOptions([
			{
				id: "1",
				category: "cpu",
				name: "Ryzen 7 9800X3D",
				price: 480,
				specs: {
					socket: "AM5",
					tdpWatts: "not a number",
					unknownField: "should be dropped",
				},
			},
		]);
		expect(option?.specs.socket).toBe("AM5");
		expect(option?.specs.tdpWatts).toBeUndefined();
		expect(option?.specs).not.toHaveProperty("unknownField");
	});

	test("drops a tags spec field unless every entry is a string", () => {
		const [option] = sanitizeOptions([
			{
				id: "1",
				category: "case",
				name: "Boîtier",
				price: 80,
				specs: { supportedFormFactors: ["ATX", 42, "mATX"] },
			},
		]);
		expect(option?.specs.supportedFormFactors).toBeUndefined();
	});

	test("filters invalid priceHistory entries and falls back to a seeded one", () => {
		const [withGarbage] = sanitizeOptions([
			{
				id: "1",
				category: "cpu",
				name: "CPU",
				price: 300,
				priceHistory: [
					{ date: "2026-01-01", price: 300 },
					{ date: "2026-02-01", price: "oops" },
					"garbage",
				],
			},
		]);
		expect(withGarbage?.priceHistory).toEqual([
			{ date: "2026-01-01", price: 300 },
		]);

		const [allInvalid] = sanitizeOptions([
			{
				id: "1",
				category: "cpu",
				name: "CPU",
				price: 300,
				updatedAt: "2026-03-01",
				priceHistory: "not an array",
			},
		]);
		expect(allInvalid?.priceHistory).toEqual([
			{ date: "2026-03-01", price: 300 },
		]);
	});
});
