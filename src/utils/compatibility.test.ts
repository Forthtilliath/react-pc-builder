import { describe, expect, test } from "bun:test";
import { makeOption } from "../test/make-option.ts";
import { checkCompatibility } from "./compatibility.ts";

function getCheck(results: ReturnType<typeof checkCompatibility>, id: string) {
	const check = results.find((c) => c.id === id);
	if (!check) throw new Error(`check "${id}" not found`);
	return check;
}

describe("checkCompatibility", () => {
	test("returns info for every check when nothing is selected", () => {
		const results = checkCompatibility([]);
		expect(results).toHaveLength(5);
		for (const check of results) {
			expect(check.status).toBe("info");
		}
	});

	test("ignores unselected options", () => {
		const options = [
			makeOption("cpu", { specs: { socket: "AM5" }, selected: false }),
			makeOption("motherboard", { specs: { socket: "AM5" } }),
		];
		expect(getCheck(checkCompatibility(options), "socket").status).toBe("info");
	});

	describe("socket check", () => {
		test("ok when CPU and motherboard sockets match (case-insensitive)", () => {
			const options = [
				makeOption("cpu", { specs: { socket: "AM5" } }),
				makeOption("motherboard", { specs: { socket: "am5" } }),
			];
			expect(getCheck(checkCompatibility(options), "socket").status).toBe("ok");
		});

		test("error when sockets differ", () => {
			const options = [
				makeOption("cpu", { specs: { socket: "AM5" } }),
				makeOption("motherboard", { specs: { socket: "LGA1700" } }),
			];
			expect(getCheck(checkCompatibility(options), "socket").status).toBe(
				"error",
			);
		});

		test("info when a socket spec is missing", () => {
			const options = [
				makeOption("cpu", { specs: {} }),
				makeOption("motherboard", { specs: { socket: "AM5" } }),
			];
			expect(getCheck(checkCompatibility(options), "socket").status).toBe(
				"info",
			);
		});
	});

	describe("ram type check", () => {
		test("ok when types match", () => {
			const options = [
				makeOption("ram", { specs: { ramType: "DDR5" } }),
				makeOption("motherboard", { specs: { ramType: "DDR5" } }),
			];
			expect(getCheck(checkCompatibility(options), "ram-type").status).toBe(
				"ok",
			);
		});

		test("error when types differ", () => {
			const options = [
				makeOption("ram", { specs: { ramType: "DDR4" } }),
				makeOption("motherboard", { specs: { ramType: "DDR5" } }),
			];
			expect(getCheck(checkCompatibility(options), "ram-type").status).toBe(
				"error",
			);
		});
	});

	describe("form factor check", () => {
		test("ok when the case supports the motherboard's form factor", () => {
			const options = [
				makeOption("motherboard", { specs: { formFactor: "ATX" } }),
				makeOption("case", {
					specs: { supportedFormFactors: ["ATX", "mATX"] },
				}),
			];
			expect(getCheck(checkCompatibility(options), "form-factor").status).toBe(
				"ok",
			);
		});

		test("error when the case does not support the motherboard's form factor", () => {
			const options = [
				makeOption("motherboard", { specs: { formFactor: "ATX" } }),
				makeOption("case", {
					specs: { supportedFormFactors: ["mATX", "ITX"] },
				}),
			];
			expect(getCheck(checkCompatibility(options), "form-factor").status).toBe(
				"error",
			);
		});
	});

	describe("wattage check", () => {
		test("ok when PSU wattage covers CPU + GPU TDP with the safety margin", () => {
			const options = [
				makeOption("cpu", { specs: { tdpWatts: 100 } }),
				makeOption("gpu", { specs: { tdpWatts: 200 } }),
				// required = ceil((100 + 200) * 1.2) = 360
				makeOption("psu", { specs: { wattage: 400 } }),
			];
			expect(getCheck(checkCompatibility(options), "wattage").status).toBe(
				"ok",
			);
		});

		test("warning when PSU wattage is below the required margin", () => {
			const options = [
				makeOption("cpu", { specs: { tdpWatts: 100 } }),
				makeOption("gpu", { specs: { tdpWatts: 200 } }),
				makeOption("psu", { specs: { wattage: 300 } }),
			];
			expect(getCheck(checkCompatibility(options), "wattage").status).toBe(
				"warning",
			);
		});

		test("ignores GPU TDP when no GPU is selected", () => {
			const options = [
				makeOption("cpu", { specs: { tdpWatts: 100 } }),
				// required without GPU = ceil(100 * 1.2) = 120
				makeOption("psu", { specs: { wattage: 150 } }),
			];
			expect(getCheck(checkCompatibility(options), "wattage").status).toBe(
				"ok",
			);
		});

		test("info when a GPU is selected but its TDP is not filled in", () => {
			const options = [
				makeOption("cpu", { specs: { tdpWatts: 100 } }),
				makeOption("gpu", { specs: {} }),
				makeOption("psu", { specs: { wattage: 750 } }),
			];
			expect(getCheck(checkCompatibility(options), "wattage").status).toBe(
				"info",
			);
		});
	});

	describe("gpu length check", () => {
		test("ok when the GPU fits in the case", () => {
			const options = [
				makeOption("gpu", { specs: { lengthMm: 300 } }),
				makeOption("case", { specs: { maxGpuLengthMm: 330 } }),
			];
			expect(getCheck(checkCompatibility(options), "gpu-length").status).toBe(
				"ok",
			);
		});

		test("error when the GPU is longer than the case allows", () => {
			const options = [
				makeOption("gpu", { specs: { lengthMm: 340 } }),
				makeOption("case", { specs: { maxGpuLengthMm: 330 } }),
			];
			expect(getCheck(checkCompatibility(options), "gpu-length").status).toBe(
				"error",
			);
		});

		test("info when no GPU is selected", () => {
			const options = [makeOption("case", { specs: { maxGpuLengthMm: 330 } })];
			expect(getCheck(checkCompatibility(options), "gpu-length").status).toBe(
				"info",
			);
		});
	});
});
