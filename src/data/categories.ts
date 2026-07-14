import type { Category, ComponentSpecs } from "../types/component.ts";

export type SpecFieldKey = keyof ComponentSpecs;

export type SpecFieldType = "text" | "number" | "select" | "tags";

export interface SpecFieldConfig {
	key: SpecFieldKey;
	label: string;
	type: SpecFieldType;
	options?: string[];
}

export interface CategoryConfig {
	id: Category;
	label: string;
	specFields: SpecFieldConfig[];
	optional?: boolean;
	allowMultipleSelected?: boolean;
}

export const CATEGORIES: CategoryConfig[] = [
	{
		id: "cpu",
		label: "Processeur (CPU)",
		specFields: [
			{ key: "socket", label: "Socket", type: "text" },
			{ key: "tdpWatts", label: "TDP (W)", type: "number" },
		],
	},
	{
		id: "motherboard",
		label: "Carte mère",
		specFields: [
			{ key: "socket", label: "Socket", type: "text" },
			{
				key: "ramType",
				label: "Type de RAM supporté",
				type: "select",
				options: ["DDR4", "DDR5"],
			},
			{
				key: "formFactor",
				label: "Format",
				type: "select",
				options: ["ATX", "mATX", "ITX"],
			},
		],
	},
	{
		id: "ram",
		label: "Mémoire (RAM)",
		specFields: [
			{
				key: "ramType",
				label: "Type",
				type: "select",
				options: ["DDR4", "DDR5"],
			},
		],
	},
	{
		id: "gpu",
		label: "Carte graphique (GPU)",
		specFields: [
			{ key: "tdpWatts", label: "TDP (W)", type: "number" },
			{ key: "lengthMm", label: "Longueur (mm)", type: "number" },
		],
	},
	{
		id: "storage",
		label: "Stockage",
		specFields: [],
	},
	{
		id: "psu",
		label: "Alimentation",
		specFields: [{ key: "wattage", label: "Puissance (W)", type: "number" }],
	},
	{
		id: "case",
		label: "Boîtier",
		specFields: [
			{
				key: "supportedFormFactors",
				label: "Formats supportés (séparés par une virgule)",
				type: "tags",
			},
			{
				key: "maxGpuLengthMm",
				label: "Longueur GPU max (mm)",
				type: "number",
			},
		],
	},
	{
		id: "cooler",
		label: "Refroidissement",
		specFields: [{ key: "socket", label: "Socket compatible", type: "text" }],
	},
	{
		id: "keyboard",
		label: "Clavier",
		optional: true,
		specFields: [
			{
				key: "connectivity",
				label: "Connectivité",
				type: "select",
				options: ["Filaire", "Sans-fil", "Bluetooth"],
			},
			{
				key: "layout",
				label: "Disposition",
				type: "select",
				options: ["AZERTY", "QWERTY"],
			},
		],
	},
	{
		id: "mouse",
		label: "Souris",
		optional: true,
		specFields: [
			{
				key: "connectivity",
				label: "Connectivité",
				type: "select",
				options: ["Filaire", "Sans-fil", "Bluetooth"],
			},
			{ key: "dpi", label: "DPI", type: "number" },
		],
	},
	{
		id: "monitor",
		label: "Écran",
		optional: true,
		specFields: [
			{ key: "sizeInches", label: "Taille (pouces)", type: "number" },
			{ key: "resolution", label: "Résolution", type: "text" },
			{ key: "refreshRateHz", label: "Fréquence (Hz)", type: "number" },
			{
				key: "panelType",
				label: "Dalle",
				type: "select",
				options: ["IPS", "VA", "TN", "OLED"],
			},
		],
	},
	{
		id: "monitor-arm",
		label: "Bras d'écran",
		optional: true,
		specFields: [
			{
				key: "vesaFormat",
				label: "Formats VESA (séparés par une virgule)",
				type: "tags",
			},
			{ key: "maxWeightKg", label: "Poids max (kg)", type: "number" },
		],
	},
	{
		id: "kvm-switch",
		label: "Switch écrans (KVM)",
		optional: true,
		specFields: [
			{ key: "portsCount", label: "Nombre d'écrans supportés", type: "number" },
			{
				key: "connectorType",
				label: "Connecteurs (séparés par une virgule)",
				type: "tags",
			},
			{ key: "maxResolution", label: "Résolution max", type: "text" },
		],
	},
	{
		id: "other",
		label: "Autre",
		optional: true,
		allowMultipleSelected: true,
		specFields: [
			{ key: "accessoryType", label: "Type d'accessoire", type: "text" },
		],
	},
];

export function getCategoryConfig(id: Category): CategoryConfig {
	const config = CATEGORIES.find((category) => category.id === id);
	if (!config) {
		throw new Error(`Unknown category: ${id}`);
	}
	return config;
}
