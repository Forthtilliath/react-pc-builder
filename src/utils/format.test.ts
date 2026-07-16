import { describe, expect, test } from "bun:test";
import { getSiteName } from "./format.ts";

describe("getSiteName", () => {
	test("strips the www. subdomain", () => {
		expect(getSiteName("https://www.amazon.fr/dp/B0G2GMZTCN")).toBe(
			"amazon.fr",
		);
	});

	test("strips other subdomains too, keeping only the last two labels", () => {
		expect(getSiteName("https://fr.aliexpress.com/item/123.html")).toBe(
			"aliexpress.com",
		);
	});

	test("returns the hostname as-is when there is no subdomain", () => {
		expect(getSiteName("https://ldlc.com/fiche/PB00123.html")).toBe("ldlc.com");
	});

	test("returns null for an undefined url", () => {
		expect(getSiteName(undefined)).toBeNull();
	});

	test("returns null for an invalid url", () => {
		expect(getSiteName("not a url")).toBeNull();
	});
});
