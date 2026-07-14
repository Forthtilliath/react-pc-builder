import type { Category, ComponentOption } from "../types/component.ts";

let counter = 0;

export function makeOption(
	category: Category,
	overrides: Partial<ComponentOption> = {},
): ComponentOption {
	counter += 1;
	return {
		id: `test-${counter}`,
		category,
		name: `Option ${counter}`,
		price: 0,
		updatedAt: "2026-01-01",
		selected: true,
		purchased: false,
		specs: {},
		priceHistory: [],
		...overrides,
	};
}
