import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";

interface Toast {
	id: string;
	message: string;
}

interface ToastContextValue {
	notify: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const notify = useCallback((message: string) => {
		const id = crypto.randomUUID();
		setToasts((prev) => [...prev, { id, message }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, TOAST_DURATION_MS);
	}, []);

	return (
		<ToastContext.Provider value={{ notify }}>
			{children}
			<div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className="pointer-events-auto rounded-lg border border-emerald-500/40 bg-slate-900 px-4 py-2 text-sm text-emerald-300 shadow-lg"
					>
						{toast.message}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast(): ToastContextValue {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return ctx;
}
