export function formatPrice(value: number): string {
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "EUR",
	}).format(value);
}

export function formatDate(iso: string): string {
	if (!iso) return "";
	return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
		new Date(iso),
	);
}

export function getDiscountPercent(
	price: number,
	salePrice: number | undefined,
): number | null {
	if (salePrice === undefined || salePrice >= price) return null;
	return Math.round((1 - salePrice / price) * 100);
}

export function getEffectivePrice(option: {
	price: number;
	salePrice?: number;
}): number {
	return option.salePrice ?? option.price;
}

export function getSiteName(url: string | undefined): string | null {
	if (!url) return null;
	try {
		const labels = new URL(url).hostname.split(".");
		return labels.slice(-2).join(".");
	} catch {
		return null;
	}
}
