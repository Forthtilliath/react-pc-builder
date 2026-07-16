import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useState,
} from "react";

interface ToastAction {
	label: string;
	onClick: () => void;
}

interface Toast {
	id: string;
	message: string;
	action?: ToastAction;
}

interface ToastContextValue {
	notify: (message: string, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 2500;
const ACTION_TOAST_DURATION_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const notify = useCallback(
		(message: string, action?: ToastAction) => {
			const id = crypto.randomUUID();
			setToasts((prev) => [...prev, { id, message, action }]);
			setTimeout(
				() => dismiss(id),
				action ? ACTION_TOAST_DURATION_MS : TOAST_DURATION_MS,
			);
		},
		[dismiss],
	);

	return (
		<ToastContext.Provider value={{ notify }}>
			{children}
			<div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className="pointer-events-auto flex items-center gap-3 rounded-lg border border-emerald-500/40 bg-slate-900 px-4 py-2 text-sm text-emerald-300 shadow-lg"
					>
						<span>{toast.message}</span>
						{toast.action && (
							<button
								type="button"
								onClick={() => {
									toast.action?.onClick();
									dismiss(toast.id);
								}}
								className="font-semibold text-emerald-200 underline hover:text-white"
							>
								{toast.action.label}
							</button>
						)}
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
