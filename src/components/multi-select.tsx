import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MultiSelectProps {
	options: string[];
	selected: string[];
	onChange: (values: string[]) => void;
	optionLabels?: Record<string, string>;
	placeholder?: string;
}

export function MultiSelect({
	options,
	selected,
	onChange,
	optionLabels,
	placeholder = "Choisir...",
}: MultiSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	function toggle(option: string) {
		const next = selected.includes(option)
			? selected.filter((value) => value !== option)
			: [...selected, option];
		onChange(next);
	}

	const selectedLabels = selected.map(
		(value) => optionLabels?.[value] ?? value,
	);

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="mt-1 flex w-full items-center justify-between gap-2 rounded border border-slate-600 bg-slate-900 py-1 pr-2 pl-2 text-left text-slate-100"
			>
				<span
					className={`truncate ${selected.length > 0 ? "pr-5" : ""} ${selected.length === 0 ? "text-slate-500" : ""}`}
				>
					{selected.length > 0 ? selectedLabels.join(", ") : placeholder}
				</span>
				<ChevronDown size={14} className="shrink-0 text-slate-500" />
			</button>
			{selected.length > 0 && (
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation();
						onChange([]);
					}}
					className="-translate-y-1/2 absolute top-1/2 right-6 text-slate-500 hover:text-slate-200"
					title="Effacer la sélection"
				>
					<X size={14} />
				</button>
			)}
			{isOpen && (
				<div className="absolute z-20 mt-1 w-full rounded border border-slate-600 bg-slate-800 p-1 shadow-lg">
					{options.map((option) => (
						<label
							key={option}
							className="flex items-center gap-2 rounded px-2 py-1 text-sm text-slate-200 hover:bg-slate-700"
						>
							<input
								type="checkbox"
								checked={selected.includes(option)}
								onChange={() => toggle(option)}
								className="accent-emerald-500"
							/>
							{optionLabels?.[option] ?? option}
						</label>
					))}
				</div>
			)}
		</div>
	);
}
