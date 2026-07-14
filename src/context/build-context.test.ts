import { describe, expect, test } from "bun:test";
import { makeOption } from "../test/make-option.ts";
import { buildReducer } from "./build-context.tsx";

const todayStr = () => new Date().toISOString().slice(0, 10);

describe("buildReducer", () => {
	test("add appends the option, stamping updatedAt and seeding priceHistory with today's date", () => {
		const option = makeOption("cpu", { updatedAt: "2020-01-01", price: 100 });
		const state = buildReducer([], { type: "add", option });
		expect(state).toEqual([
			{
				...option,
				updatedAt: todayStr(),
				priceHistory: [{ date: todayStr(), price: 100 }],
			},
		]);
	});

	test("update merges the patch into the matching option", () => {
		const option = makeOption("cpu", { price: 100 });
		const state = buildReducer([option], {
			type: "update",
			id: option.id,
			patch: { price: 150 },
		});
		expect(state[0]?.price).toBe(150);
	});

	test("update appends a price history point when the effective price changes", () => {
		const option = makeOption("cpu", {
			price: 100,
			priceHistory: [{ date: "2020-01-01", price: 100 }],
		});
		const state = buildReducer([option], {
			type: "update",
			id: option.id,
			patch: { price: 150 },
		});
		expect(state[0]?.priceHistory).toEqual([
			{ date: "2020-01-01", price: 100 },
			{ date: todayStr(), price: 150 },
		]);
	});

	test("update does not append a price history point when the effective price is unchanged", () => {
		const option = makeOption("cpu", {
			price: 100,
			priceHistory: [{ date: "2020-01-01", price: 100 }],
		});
		const state = buildReducer([option], {
			type: "update",
			id: option.id,
			patch: { notes: "still the same price" },
		});
		expect(state[0]?.priceHistory).toEqual([
			{ date: "2020-01-01", price: 100 },
		]);
	});

	test("update refreshes updatedAt to today's date", () => {
		const option = makeOption("cpu", { updatedAt: "2020-01-01" });
		const state = buildReducer([option], {
			type: "update",
			id: option.id,
			patch: { price: 150 },
		});
		expect(state[0]?.updatedAt).toBe(todayStr());
	});

	test("delete removes the matching option", () => {
		const option = makeOption("cpu");
		const state = buildReducer([option], { type: "delete", id: option.id });
		expect(state).toHaveLength(0);
	});

	test("duplicate copies the option as unselected with a new id", () => {
		const option = makeOption("cpu", { selected: true, name: "Ryzen" });
		const state = buildReducer([option], {
			type: "duplicate",
			id: option.id,
			newId: "copy-1",
		});
		expect(state).toHaveLength(2);
		const copy = state.find((o) => o.id === "copy-1");
		expect(copy?.selected).toBe(false);
		expect(copy?.name).toBe("Ryzen (copie)");
	});

	describe("select — single-selection categories", () => {
		test("selecting one option deselects all others in the same category", () => {
			const a = makeOption("cpu", { id: "a", selected: true });
			const b = makeOption("cpu", { id: "b", selected: false });
			const state = buildReducer([a, b], {
				type: "select",
				category: "cpu",
				id: "b",
			});
			expect(state.find((o) => o.id === "a")?.selected).toBe(false);
			expect(state.find((o) => o.id === "b")?.selected).toBe(true);
		});

		test("does not affect options from a different category", () => {
			const cpu = makeOption("cpu", { id: "cpu-1", selected: true });
			const gpu = makeOption("gpu", { id: "gpu-1", selected: true });
			const state = buildReducer([cpu, gpu], {
				type: "select",
				category: "cpu",
				id: "cpu-1",
			});
			expect(state.find((o) => o.id === "gpu-1")?.selected).toBe(true);
		});
	});

	describe('select — multi-selection category ("other")', () => {
		test("toggles the clicked option without affecting other accessory-type groups", () => {
			const gamepad = makeOption("other", {
				id: "gamepad",
				selected: false,
				specs: { accessoryType: "Manette" },
			});
			const powerStrip = makeOption("other", {
				id: "power-strip",
				selected: true,
				specs: { accessoryType: "Multiprise" },
			});
			const state = buildReducer([gamepad, powerStrip], {
				type: "select",
				category: "other",
				id: "gamepad",
			});
			expect(state.find((o) => o.id === "gamepad")?.selected).toBe(true);
			expect(state.find((o) => o.id === "power-strip")?.selected).toBe(true);
		});

		test("selecting one option deselects other options with the same accessory type", () => {
			const gamepadA = makeOption("other", {
				id: "gamepad-a",
				selected: true,
				specs: { accessoryType: "Manette" },
			});
			const gamepadB = makeOption("other", {
				id: "gamepad-b",
				selected: false,
				specs: { accessoryType: "Manette" },
			});
			const state = buildReducer([gamepadA, gamepadB], {
				type: "select",
				category: "other",
				id: "gamepad-b",
			});
			expect(state.find((o) => o.id === "gamepad-a")?.selected).toBe(false);
			expect(state.find((o) => o.id === "gamepad-b")?.selected).toBe(true);
		});

		test("clicking an already-selected option toggles it off", () => {
			const gamepad = makeOption("other", {
				id: "gamepad",
				selected: true,
				specs: { accessoryType: "Manette" },
			});
			const state = buildReducer([gamepad], {
				type: "select",
				category: "other",
				id: "gamepad",
			});
			expect(state.find((o) => o.id === "gamepad")?.selected).toBe(false);
		});

		test("accessory type matching is case-insensitive and trims whitespace", () => {
			const gamepadA = makeOption("other", {
				id: "gamepad-a",
				selected: true,
				specs: { accessoryType: " manette " },
			});
			const gamepadB = makeOption("other", {
				id: "gamepad-b",
				selected: false,
				specs: { accessoryType: "Manette" },
			});
			const state = buildReducer([gamepadA, gamepadB], {
				type: "select",
				category: "other",
				id: "gamepad-b",
			});
			expect(state.find((o) => o.id === "gamepad-a")?.selected).toBe(false);
		});

		test("items without an accessory type are independent of each other", () => {
			const a = makeOption("other", { id: "a", selected: true, specs: {} });
			const b = makeOption("other", { id: "b", selected: false, specs: {} });
			const state = buildReducer([a, b], {
				type: "select",
				category: "other",
				id: "b",
			});
			expect(state.find((o) => o.id === "a")?.selected).toBe(true);
			expect(state.find((o) => o.id === "b")?.selected).toBe(true);
		});
	});

	describe("select — multi-selection category (storage)", () => {
		test("an NVMe drive and a SATA drive can both stay selected", () => {
			const nvme = makeOption("storage", {
				id: "nvme",
				selected: false,
				specs: { storageType: "NVMe M.2" },
			});
			const sata = makeOption("storage", {
				id: "sata",
				selected: true,
				specs: { storageType: "SATA SSD" },
			});
			const state = buildReducer([nvme, sata], {
				type: "select",
				category: "storage",
				id: "nvme",
			});
			expect(state.find((o) => o.id === "nvme")?.selected).toBe(true);
			expect(state.find((o) => o.id === "sata")?.selected).toBe(true);
		});

		test("selecting a second NVMe drive deselects the first one", () => {
			const nvmeA = makeOption("storage", {
				id: "nvme-a",
				selected: true,
				specs: { storageType: "NVMe M.2" },
			});
			const nvmeB = makeOption("storage", {
				id: "nvme-b",
				selected: false,
				specs: { storageType: "NVMe M.2" },
			});
			const state = buildReducer([nvmeA, nvmeB], {
				type: "select",
				category: "storage",
				id: "nvme-b",
			});
			expect(state.find((o) => o.id === "nvme-a")?.selected).toBe(false);
			expect(state.find((o) => o.id === "nvme-b")?.selected).toBe(true);
		});
	});
});
