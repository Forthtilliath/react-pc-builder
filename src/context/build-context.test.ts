import { describe, expect, test } from "bun:test";
import { makeOption } from "../test/make-option.ts";
import { buildReducer } from "./build-context.tsx";

const todayStr = () => new Date().toISOString().slice(0, 10);

describe("buildReducer", () => {
	test("add appends the option, stamping updatedAt with today's date", () => {
		const option = makeOption("cpu", { updatedAt: "2020-01-01" });
		const state = buildReducer([], { type: "add", option });
		expect(state).toEqual([{ ...option, updatedAt: todayStr() }]);
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
});
