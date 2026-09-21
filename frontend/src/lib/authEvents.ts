type UnauthorizedListener = () => void;

let listener: UnauthorizedListener | null = null;

/**
 * @description Registers the one handler to call when a request comes back 401 after login - lets
 * axiosInstance (a plain module, outside the React tree) reach AuthContext's `logout` without a
 * circular import between them. AuthProvider registers itself on mount, clears it on unmount.
 */
export const setUnauthorizedListener = (fn: UnauthorizedListener | null): void => {
  listener = fn;
};

/**
 * @description Called by axiosInstance's response interceptor on a 401 - notifies AuthContext so
 * the app's auth state (and every route guard watching it) reacts immediately, not just storage.
 */
export const notifyUnauthorized = (): void => {
  listener?.();
};
