import type { Category, ComponentSpecs } from "../types/component.ts";

export type SpecFieldKey = keyof ComponentSpecs;

export type SpecFieldType = "text" | "number" | "select" | "tags";

export interface SpecFieldConfig {
	key: SpecFieldKey;
	label: string;
	type: SpecFieldType;
	options?: string[];
	optionLabels?: Record<string, string>;
	unit?: string;
	suggestions?: string[];
	showIf?: { key: SpecFieldKey; equals: string };
}

const SOCKET_SUGGESTIONS = ["AMD", "AM4", "AM5"];

const FORM_FACTOR_OPTIONS = ["ATX", "mATX", "ITX", "E-ATX"];
const FORM_FACTOR_LABELS = { mATX: "Micro ATX", ITX: "Mini ITX" };

export interface CategoryConfig {
	id: Category;
	label: string;
	specFields: SpecFieldConfig[];
	optional?: boolean;
	allowMultipleSelected?: boolean;
	groupByField?: SpecFieldKey;
}

export const CATEGORIES: CategoryConfig[] = [
	{
		id: "cpu",
		label: "Processeur (CPU)",
		specFields: [
			{
				key: "socket",
				label: "Socket",
				type: "text",
				suggestions: SOCKET_SUGGESTIONS,
			},
			{ key: "tdpWatts", label: "TDP", type: "number", unit: "W" },
		],
	},
	{
		id: "motherboard",
		label: "Carte mère",
		specFields: [
			{
				key: "socket",
				label: "Socket",
				type: "text",
				suggestions: SOCKET_SUGGESTIONS,
			},
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
				options: FORM_FACTOR_OPTIONS,
				optionLabels: FORM_FACTOR_LABELS,
			},
			{ key: "ramSlots", label: "Slots RAM", type: "number" },
			{
				key: "maxRamCapacityGb",
				label: "Capacité RAM max",
				type: "number",
				unit: "Go",
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
			{ key: "modulesCount", label: "Nombre de barrettes", type: "number" },
			{
				key: "capacityGb",
				label: "Capacité totale",
				type: "number",
				unit: "Go",
			},
		],
	},
	{
		id: "gpu",
		label: "Carte graphique (GPU)",
		specFields: [
			{ key: "tdpWatts", label: "TDP", type: "number", unit: "W" },
			{ key: "lengthMm", label: "Longueur", type: "number", unit: "mm" },
		],
	},
	{
		id: "storage",
		label: "Stockage",
		allowMultipleSelected: true,
		groupByField: "storageType",
		specFields: [
			{
				key: "storageType",
				label: "Type",
				type: "select",
				options: ["NVMe M.2", "SATA SSD", "HDD"],
			},
			{ key: "capacityGb", label: "Capacité", type: "number", unit: "Go" },
		],
	},
	{
		id: "psu",
		label: "Alimentation",
		specFields: [
			{ key: "wattage", label: "Puissance", type: "number", unit: "W" },
		],
	},
	{
		id: "case",
		label: "Boîtier",
		specFields: [
			{
				key: "supportedFormFactors",
				label: "Formats supportés",
				type: "tags",
				options: FORM_FACTOR_OPTIONS,
				optionLabels: FORM_FACTOR_LABELS,
			},
			{
				key: "maxGpuLengthMm",
				label: "Longueur GPU max",
				type: "number",
				unit: "mm",
			},
			{
				key: "maxCoolerHeightMm",
				label: "Hauteur ventirad max",
				type: "number",
				unit: "mm",
			},
		],
	},
	{
		id: "cooler",
		label: "Refroidissement",
		specFields: [
			{
				key: "coolerType",
				label: "Type",
				type: "select",
				options: ["Air", "AIO"],
				optionLabels: { Air: "Ventirad", AIO: "Watercooling" },
			},
			{
				key: "compatibleSockets",
				label: "Sockets compatibles",
				type: "tags",
				options: SOCKET_SUGGESTIONS,
			},
			{
				key: "coolerHeightMm",
				label: "Hauteur",
				type: "number",
				unit: "mm",
				showIf: { key: "coolerType", equals: "Air" },
			},
			{
				key: "radiatorSize",
				label: "Taille radiateur",
				type: "select",
				options: ["120mm", "240mm", "280mm", "360mm"],
				showIf: { key: "coolerType", equals: "AIO" },
			},
		],
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
			{ key: "sizeInches", label: "Taille", type: "number", unit: "po" },
			{ key: "resolution", label: "Résolution", type: "text" },
			{ key: "refreshRateHz", label: "Fréquence", type: "number", unit: "Hz" },
			{
				key: "panelType",
				label: "Dalle",
				type: "select",
				options: ["IPS", "VA", "TN", "OLED"],
			},
			{
				key: "vesaFormat",
				label: "Formats VESA",
				type: "tags",
				options: ["75x75", "100x100", "200x100", "200x200"],
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
				label: "Formats VESA",
				type: "tags",
				options: ["75x75", "100x100", "200x100", "200x200"],
			},
			{
				key: "maxWeightKg",
				label: "Poids max",
				type: "number",
				unit: "kg",
			},
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
				label: "Connecteurs",
				type: "tags",
				options: ["HDMI", "DisplayPort", "USB-C"],
			},
			{ key: "maxResolution", label: "Résolution max", type: "text" },
		],
	},
	{
		id: "other",
		label: "Autre",
		optional: true,
		allowMultipleSelected: true,
		groupByField: "accessoryType",
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
