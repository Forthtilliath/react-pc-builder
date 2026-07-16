import type { Category, ComponentOption } from "../types/component.ts";

export type CompatibilityStatus = "ok" | "warning" | "error" | "info";

export interface CompatibilityCheck {
	id: string;
	label: string;
	status: CompatibilityStatus;
	message: string;
}

export const DEFAULT_PSU_SAFETY_MARGIN = 1.2;

function findSelected(
	options: ComponentOption[],
	category: Category,
): ComponentOption | undefined {
	return options.find(
		(option) => option.category === category && option.selected,
	);
}

function socketCheck(
	cpu: ComponentOption | undefined,
	motherboard: ComponentOption | undefined,
): CompatibilityCheck {
	const id = "socket";
	const label = "Socket CPU / carte mère";
	if (!cpu || !motherboard) {
		return {
			id,
			label,
			status: "info",
			message: "Sélectionne un CPU et une carte mère pour vérifier.",
		};
	}
	if (!cpu.specs.socket || !motherboard.specs.socket) {
		return {
			id,
			label,
			status: "info",
			message: "Renseigne le socket du CPU et de la carte mère.",
		};
	}
	if (
		cpu.specs.socket.trim().toLowerCase() ===
		motherboard.specs.socket.trim().toLowerCase()
	) {
		return {
			id,
			label,
			status: "ok",
			message: `Socket ${cpu.specs.socket} compatible.`,
		};
	}
	return {
		id,
		label,
		status: "error",
		message: `Socket CPU (${cpu.specs.socket}) différent du socket carte mère (${motherboard.specs.socket}).`,
	};
}

function ramTypeCheck(
	ram: ComponentOption | undefined,
	motherboard: ComponentOption | undefined,
): CompatibilityCheck {
	const id = "ram-type";
	const label = "Type de RAM";
	if (!ram || !motherboard) {
		return {
			id,
			label,
			status: "info",
			message: "Sélectionne une RAM et une carte mère pour vérifier.",
		};
	}
	if (!ram.specs.ramType || !motherboard.specs.ramType) {
		return {
			id,
			label,
			status: "info",
			message: "Renseigne le type de RAM sur la carte mère et la RAM.",
		};
	}
	if (ram.specs.ramType === motherboard.specs.ramType) {
		return {
			id,
			label,
			status: "ok",
			message: `RAM ${ram.specs.ramType} compatible avec la carte mère.`,
		};
	}
	return {
		id,
		label,
		status: "error",
		message: `RAM ${ram.specs.ramType} incompatible avec la carte mère (${motherboard.specs.ramType} attendu).`,
	};
}

function ramCapacityCheck(
	ram: ComponentOption | undefined,
	motherboard: ComponentOption | undefined,
): CompatibilityCheck {
	const id = "ram-capacity";
	const label = "Capacité / slots RAM";
	if (!ram || !motherboard) {
		return {
			id,
			label,
			status: "info",
			message: "Sélectionne une RAM et une carte mère pour vérifier.",
		};
	}
	const { modulesCount, capacityGb } = ram.specs;
	const { ramSlots, maxRamCapacityGb } = motherboard.specs;
	if (
		modulesCount === undefined ||
		capacityGb === undefined ||
		ramSlots === undefined ||
		maxRamCapacityGb === undefined
	) {
		return {
			id,
			label,
			status: "info",
			message:
				"Renseigne le nombre de barrettes/la capacité de la RAM et les slots/la capacité max de la carte mère.",
		};
	}
	if (modulesCount > ramSlots) {
		return {
			id,
			label,
			status: "error",
			message: `${modulesCount} barrettes ne tiennent pas dans les ${ramSlots} slots de la carte mère.`,
		};
	}
	if (capacityGb > maxRamCapacityGb) {
		return {
			id,
			label,
			status: "error",
			message: `${capacityGb} Go dépasse la capacité RAM max de la carte mère (${maxRamCapacityGb} Go).`,
		};
	}
	return {
		id,
		label,
		status: "ok",
		message: `${modulesCount} barrette${modulesCount > 1 ? "s" : ""} (${capacityGb} Go) compatibles avec la carte mère.`,
	};
}

function formFactorCheck(
	motherboard: ComponentOption | undefined,
	pcCase: ComponentOption | undefined,
): CompatibilityCheck {
	const id = "form-factor";
	const label = "Format carte mère / boîtier";
	if (!motherboard || !pcCase) {
		return {
			id,
			label,
			status: "info",
			message: "Sélectionne une carte mère et un boîtier pour vérifier.",
		};
	}
	const supported = pcCase.specs.supportedFormFactors;
	if (!motherboard.specs.formFactor || !supported || supported.length === 0) {
		return {
			id,
			label,
			status: "info",
			message:
				"Renseigne le format de la carte mère et les formats supportés par le boîtier.",
		};
	}
	if (supported.includes(motherboard.specs.formFactor)) {
		return {
			id,
			label,
			status: "ok",
			message: `Format ${motherboard.specs.formFactor} supporté par le boîtier.`,
		};
	}
	return {
		id,
		label,
		status: "error",
		message: `Format ${motherboard.specs.formFactor} non supporté par le boîtier (${supported.join(", ")}).`,
	};
}

function wattageCheck(
	cpu: ComponentOption | undefined,
	gpu: ComponentOption | undefined,
	psu: ComponentOption | undefined,
	safetyMargin: number,
): CompatibilityCheck {
	const id = "wattage";
	const label = "Puissance alimentation";
	if (!cpu || !psu) {
		return {
			id,
			label,
			status: "info",
			message: "Sélectionne un CPU et une alimentation pour vérifier.",
		};
	}
	if (cpu.specs.tdpWatts === undefined || psu.specs.wattage === undefined) {
		return {
			id,
			label,
			status: "info",
			message: "Renseigne le TDP du CPU et la puissance de l'alimentation.",
		};
	}
	if (gpu && gpu.specs.tdpWatts === undefined) {
		return {
			id,
			label,
			status: "info",
			message: "Renseigne le TDP du GPU sélectionné pour affiner le calcul.",
		};
	}
	const estimated = cpu.specs.tdpWatts + (gpu?.specs.tdpWatts ?? 0);
	const required = Math.ceil(estimated * safetyMargin);
	if (psu.specs.wattage >= required) {
		return {
			id,
			label,
			status: "ok",
			message: `Alimentation ${psu.specs.wattage} W suffisante (~${required} W recommandés avec marge).`,
		};
	}
	return {
		id,
		label,
		status: "warning",
		message: `Alimentation ${psu.specs.wattage} W potentiellement insuffisante (~${required} W recommandés avec marge).`,
	};
}

function gpuLengthCheck(
	gpu: ComponentOption | undefined,
	pcCase: ComponentOption | undefined,
): CompatibilityCheck {
	const id = "gpu-length";
	const label = "Encombrement GPU / boîtier";
	if (!gpu) {
		return {
			id,
			label,
			status: "info",
			message: "Aucun GPU dédié sélectionné.",
		};
	}
	if (!pcCase) {
		return {
			id,
			label,
			status: "info",
			message: "Sélectionne un boîtier pour vérifier.",
		};
	}
	if (
		gpu.specs.lengthMm === undefined ||
		pcCase.specs.maxGpuLengthMm === undefined
	) {
		return {
			id,
			label,
			status: "info",
			message:
				"Renseigne la longueur du GPU et la longueur GPU max du boîtier.",
		};
	}
	if (gpu.specs.lengthMm <= pcCase.specs.maxGpuLengthMm) {
		return {
			id,
			label,
			status: "ok",
			message: `GPU (${gpu.specs.lengthMm} mm) tient dans le boîtier (max ${pcCase.specs.maxGpuLengthMm} mm).`,
		};
	}
	return {
		id,
		label,
		status: "error",
		message: `GPU (${gpu.specs.lengthMm} mm) trop long pour le boîtier (max ${pcCase.specs.maxGpuLengthMm} mm).`,
	};
}

function coolerHeightCheck(
	cooler: ComponentOption | undefined,
	pcCase: ComponentOption | undefined,
): CompatibilityCheck {
	const id = "cooler-height";
	const label = "Hauteur ventirad / boîtier";
	if (!cooler) {
		return {
			id,
			label,
			status: "info",
			message: "Aucun ventirad sélectionné.",
		};
	}
	if (!pcCase) {
		return {
			id,
			label,
			status: "info",
			message: "Sélectionne un boîtier pour vérifier.",
		};
	}
	if (cooler.specs.coolerType === "AIO") {
		return {
			id,
			label,
			status: "info",
			message:
				"Refroidissement AIO : la hauteur ne s'applique pas (vérifie plutôt l'emplacement du radiateur dans le boîtier).",
		};
	}
	if (
		cooler.specs.coolerHeightMm === undefined ||
		pcCase.specs.maxCoolerHeightMm === undefined
	) {
		return {
			id,
			label,
			status: "info",
			message:
				"Renseigne la hauteur du ventirad et la hauteur ventirad max du boîtier.",
		};
	}
	if (cooler.specs.coolerHeightMm <= pcCase.specs.maxCoolerHeightMm) {
		return {
			id,
			label,
			status: "ok",
			message: `Ventirad (${cooler.specs.coolerHeightMm} mm) tient dans le boîtier (max ${pcCase.specs.maxCoolerHeightMm} mm).`,
		};
	}
	return {
		id,
		label,
		status: "error",
		message: `Ventirad (${cooler.specs.coolerHeightMm} mm) trop haut pour le boîtier (max ${pcCase.specs.maxCoolerHeightMm} mm).`,
	};
}

function vesaCheck(
	monitor: ComponentOption | undefined,
	monitorArm: ComponentOption | undefined,
): CompatibilityCheck {
	const id = "vesa";
	const label = "VESA écran / bras";
	if (!monitor || !monitorArm) {
		return {
			id,
			label,
			status: "info",
			message: "Sélectionne un écran et un bras d'écran pour vérifier.",
		};
	}
	const monitorFormats = monitor.specs.vesaFormat;
	const armFormats = monitorArm.specs.vesaFormat;
	if (
		!monitorFormats ||
		monitorFormats.length === 0 ||
		!armFormats ||
		armFormats.length === 0
	) {
		return {
			id,
			label,
			status: "info",
			message: "Renseigne les formats VESA de l'écran et du bras.",
		};
	}
	const normalizedMonitorFormats = monitorFormats.map((format) =>
		format.trim().toLowerCase(),
	);
	const common = armFormats.filter((format) =>
		normalizedMonitorFormats.includes(format.trim().toLowerCase()),
	);
	if (common.length > 0) {
		return {
			id,
			label,
			status: "ok",
			message: `Format VESA compatible (${common.join(", ")}).`,
		};
	}
	return {
		id,
		label,
		status: "error",
		message: `Aucun format VESA commun entre l'écran (${monitorFormats.join(", ")}) et le bras (${armFormats.join(", ")}).`,
	};
}

export function checkCompatibility(
	options: ComponentOption[],
	psuSafetyMargin: number = DEFAULT_PSU_SAFETY_MARGIN,
): CompatibilityCheck[] {
	const cpu = findSelected(options, "cpu");
	const gpu = findSelected(options, "gpu");
	const motherboard = findSelected(options, "motherboard");
	const ram = findSelected(options, "ram");
	const psu = findSelected(options, "psu");
	const pcCase = findSelected(options, "case");
	const cooler = findSelected(options, "cooler");
	const monitor = findSelected(options, "monitor");
	const monitorArm = findSelected(options, "monitor-arm");

	return [
		socketCheck(cpu, motherboard),
		ramTypeCheck(ram, motherboard),
		ramCapacityCheck(ram, motherboard),
		formFactorCheck(motherboard, pcCase),
		wattageCheck(cpu, gpu, psu, psuSafetyMargin),
		gpuLengthCheck(gpu, pcCase),
		coolerHeightCheck(cooler, pcCase),
		vesaCheck(monitor, monitorArm),
	];
}
