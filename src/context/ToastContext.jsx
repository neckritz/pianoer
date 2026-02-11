import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';

const ToastContext = createContext();

// Custom hook for easy access to the toast trigger
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]); // [{ header, content, fromContent, direction, id }]
    const timersRef = useRef(new Map());
    const lastContentRef = useRef('');
    const lastContentByKeyRef = useRef(new Map());
    const toastsRef = useRef([]);
    const baseDuration = 1500;
    const extendedDuration = 700;

    useEffect(() => {
        toastsRef.current = toasts;
    }, [toasts]);

    useEffect(() => {
        return () => {
            timersRef.current.forEach((timerId) => clearTimeout(timerId));
            timersRef.current.clear();
        };
    }, []);

    const showToast = useCallback((header, content, options = {}) => {
        const hasContent = typeof content !== 'undefined';
        const normalizedHeader = hasContent ? header : '';
        const normalizedContent = hasContent ? content : header;
        const toastKey = typeof options?.key === 'string' ? options.key : null;
        const existingToast = toastKey
            ? toastsRef.current.find((toast) => toast.key === toastKey)
            : null;
        const previousContent = typeof options?.fromContent === 'string'
            ? options.fromContent
            : existingToast?.content
                ?? (toastKey ? lastContentByKeyRef.current.get(toastKey) : undefined)
                ?? lastContentRef.current;
        const direction = typeof options?.direction === 'string'
            ? options.direction
            : 'up';
        const newId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const toastId = existingToast?.id ?? newId;

        if (existingToast) {
            setToasts((prev) => prev.map((toast) => {
                if (toast.id !== toastId) return toast;
                return {
                    ...toast,
                    header: normalizedHeader,
                    content: normalizedContent,
                    fromContent: previousContent || normalizedContent,
                    direction,
                };
            }));
        } else {
            setToasts((prev) => [
                ...prev,
                {
                    header: normalizedHeader,
                    content: normalizedContent,
                    fromContent: previousContent || normalizedContent,
                    direction,
                    key: toastKey ?? newId,
                    id: newId,
                },
            ]);
        }
        lastContentRef.current = normalizedContent;
        if (toastKey) {
            lastContentByKeyRef.current.set(toastKey, normalizedContent);
        }

        if (timersRef.current.has(toastId)) {
            clearTimeout(timersRef.current.get(toastId));
        }
        const duration = existingToast ? extendedDuration : baseDuration;
        const timerId = setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
            timersRef.current.delete(toastId);
        }, duration);
        timersRef.current.set(toastId, timerId);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, toasts }}>
            {children}
        </ToastContext.Provider>
    );
};
