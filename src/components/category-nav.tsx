import { useEffect, useState } from "react";
import { CATEGORIES } from "../data/categories.ts";

export function CategoryNav() {
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{ rootMargin: "-96px 0px -70% 0px", threshold: 0 },
		);
		for (const category of CATEGORIES) {
			const el = document.getElementById(category.id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, []);

	return (
		<nav className="sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block">
			<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
				Composants
			</p>
			<ul className="space-y-1 border-l border-slate-800">
				{CATEGORIES.map((category) => (
					<li key={category.id}>
						<a
							href={`#${category.id}`}
							className={`block border-l-2 py-1 pl-3 text-sm transition-colors ${
								activeId === category.id
									? "border-emerald-400 text-emerald-400"
									: "border-transparent text-slate-400 hover:text-slate-200"
							}`}
						>
							{category.label}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
