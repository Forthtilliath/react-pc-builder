import { useEffect, useState } from "react";

export function useLocalStorage<T>(
	key: string,
	initialValue: T,
	migrate?: (parsed: unknown) => T,
) {
	const [value, setValue] = useState<T>(() => {
		try {
			const stored = window.localStorage.getItem(key);
			if (!stored) return initialValue;
			const parsed = JSON.parse(stored);
			return migrate ? migrate(parsed) : (parsed as T);
		} catch {
			return initialValue;
		}
	});

	useEffect(() => {
		window.localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue] as const;
}
