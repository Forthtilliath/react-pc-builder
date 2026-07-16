import { beforeEach, describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { BuildProvider } from "../context/build-context.tsx";
import { ToastProvider } from "../context/toast-context.tsx";
import { getCategoryConfig } from "../data/categories.ts";
import type { ComponentOption } from "../types/component.ts";
import { CategorySection } from "./category-section.tsx";

function makeStoredOption(
	overrides: Partial<ComponentOption>,
): ComponentOption {
	return {
		id: crypto.randomUUID(),
		category: "other",
		name: "Option",
		price: 10,
		updatedAt: "2026-01-01",
		selected: false,
		purchased: false,
		specs: {},
		priceHistory: [{ date: "2026-01-01", price: 10 }],
		...overrides,
	};
}

function seedOptions(options: ComponentOption[]) {
	localStorage.setItem("pc-builder:options", JSON.stringify(options));
}

function getCheckbox(name: RegExp): HTMLInputElement {
	return screen.getByRole("checkbox", { name }) as HTMLInputElement;
}

function renderOtherSection() {
	return render(
		<ToastProvider>
			<BuildProvider>
				<CategorySection category={getCategoryConfig("other")} />
			</BuildProvider>
		</ToastProvider>,
	);
}

beforeEach(() => {
	localStorage.clear();
});

describe("CategorySection", () => {
	test("renders the category label and version count", () => {
		seedOptions([
			makeStoredOption({
				name: "Manette A",
				specs: { accessoryType: "Manette" },
			}),
		]);
		renderOtherSection();
		expect(screen.getByText("Autre")).toBeTruthy();
		expect(screen.getByText(/1 version/)).toBeTruthy();
	});

	test("selecting one option deselects the sibling with the same accessory type", () => {
		seedOptions([
			makeStoredOption({
				name: "Manette A",
				selected: true,
				specs: { accessoryType: "Manette" },
			}),
			makeStoredOption({
				name: "Manette B",
				selected: false,
				specs: { accessoryType: "Manette" },
			}),
		]);
		renderOtherSection();

		const checkboxA = getCheckbox(/Manette A/);
		const checkboxB = getCheckbox(/Manette B/);
		expect(checkboxA.checked).toBe(true);
		expect(checkboxB.checked).toBe(false);

		fireEvent.click(checkboxB);

		expect(checkboxA.checked).toBe(false);
		expect(checkboxB.checked).toBe(true);
	});

	test("options in different accessory-type groups can both stay selected", () => {
		seedOptions([
			makeStoredOption({
				name: "Manette A",
				selected: false,
				specs: { accessoryType: "Manette" },
			}),
			makeStoredOption({
				name: "Multiprise",
				selected: true,
				specs: { accessoryType: "Multiprise" },
			}),
		]);
		renderOtherSection();

		const gamepad = getCheckbox(/Manette A/);
		fireEvent.click(gamepad);

		const powerStrip = getCheckbox(/Multiprise/);
		expect(gamepad.checked).toBe(true);
		expect(powerStrip.checked).toBe(true);
	});
});
