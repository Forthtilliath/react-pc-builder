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
