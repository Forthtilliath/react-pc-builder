export type Category =
	| "cpu"
	| "gpu"
	| "motherboard"
	| "ram"
	| "storage"
	| "psu"
	| "case"
	| "cooler"
	| "keyboard"
	| "mouse"
	| "monitor"
	| "monitor-arm"
	| "kvm-switch"
	| "other";

export interface ComponentSpecs {
	socket?: string;
	ramType?: "DDR4" | "DDR5";
	formFactor?: string;
	supportedFormFactors?: string[];
	tdpWatts?: number;
	wattage?: number;
	lengthMm?: number;
	maxGpuLengthMm?: number;
	connectivity?: "Filaire" | "Sans-fil" | "Bluetooth";
	layout?: "AZERTY" | "QWERTY";
	dpi?: number;
	sizeInches?: number;
	resolution?: string;
	refreshRateHz?: number;
	panelType?: "IPS" | "VA" | "TN" | "OLED";
	vesaFormat?: string[];
	maxWeightKg?: number;
	portsCount?: number;
	maxResolution?: string;
	connectorType?: string[];
	accessoryType?: string;
	storageType?: "NVMe M.2" | "SATA SSD" | "HDD";
	ramSlots?: number;
	maxRamCapacityGb?: number;
	modulesCount?: number;
	capacityGb?: number;
	coolerHeightMm?: number;
	maxCoolerHeightMm?: number;
}

export interface PricePoint {
	date: string;
	price: number;
}

export interface ComponentOption {
	id: string;
	category: Category;
	name: string;
	price: number;
	salePrice?: number;
	url?: string;
	imageUrl?: string;
	updatedAt: string;
	selected: boolean;
	purchased: boolean;
	notes?: string;
	specs: ComponentSpecs;
	priceHistory: PricePoint[];
}

export type NewComponentOption = Omit<
	ComponentOption,
	"id" | "updatedAt" | "priceHistory"
>;
