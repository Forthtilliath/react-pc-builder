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

	useEffect(() => {
		function handleStorageEvent(event: StorageEvent) {
			if (event.key !== key || event.storageArea !== window.localStorage) {
				return;
			}
			if (event.newValue === null) {
				setValue(initialValue);
				return;
			}
			try {
				const parsed = JSON.parse(event.newValue);
				setValue(migrate ? migrate(parsed) : (parsed as T));
			} catch {
				// ignore malformed value written by another tab
			}
		}
		window.addEventListener("storage", handleStorageEvent);
		return () => window.removeEventListener("storage", handleStorageEvent);
	}, [key, initialValue, migrate]);

	return [value, setValue] as const;
}
