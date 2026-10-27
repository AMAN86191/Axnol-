import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast, {ToastAction, ToastData, ToastType} from './Toast';
import {spacing} from '../../theme';

interface ShowOptions {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastContextValue {
  show: (options: ShowOptions) => string;
  hide: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel?: string,
  ) => string;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

let globalToast: ToastContextValue | null = null;

/** Imperative toast helper usable from anywhere (no hook needed). */
export const toast = {
  show: (options: ShowOptions) => globalToast?.show(options) ?? '',
  hide: (id: string) => globalToast?.hide(id),
  success: (title: string, message?: string) =>
    globalToast?.success(title, message) ?? '',
  error: (title: string, message?: string) =>
    globalToast?.error(title, message) ?? '',
  info: (title: string, message?: string) =>
    globalToast?.info(title, message) ?? '',
  warning: (title: string, message?: string) =>
    globalToast?.warning(title, message) ?? '',
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel?: string,
  ) => globalToast?.confirm(title, message, onConfirm, confirmLabel) ?? '',
};

const MAX_TOASTS = 3;

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const counter = useRef(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e =>
      setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const hide = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((options: ShowOptions) => {
    const id = `toast-${Date.now()}-${counter.current++}`;
    const item: ToastData = {
      id,
      type: options.type ?? 'info',
      title: options.title,
      message: options.message,
      action: options.action,
      duration: options.action
        ? 0
        : options.duration ?? (options.type === 'error' ? 5000 : 3500),
    };
    setToasts(prev => {
      const next = [...prev, item];
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });
    return id;
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      hide,
      success: (title, message) => show({type: 'success', title, message}),
      error: (title, message) => show({type: 'error', title, message}),
      info: (title, message) => show({type: 'info', title, message}),
      warning: (title, message) => show({type: 'warning', title, message}),
      confirm: (title, message, onConfirm, confirmLabel = 'Confirm') =>
        show({
          type: 'warning',
          title,
          message,
          action: {label: confirmLabel, onPress: onConfirm, style: 'destructive'},
        }),
    }),
    [show, hide],
  );

  useEffect(() => {
    globalToast = value;
    return () => {
      if (globalToast === value) {
        globalToast = null;
      }
    };
  }, [value]);

  const bottomOffset = keyboardHeight > 0 ? keyboardHeight + spacing.md : 0;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="box-none"
        style={[
          styles.host,
          {top: insets.top + spacing.sm, bottom: bottomOffset},
        ]}>
        {toasts.map(t => (
          <Toast key={t.id} data={t} onClose={hide} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

/** Optional hook; components that can't use context should import `toast`. */
export const useToast = (): ToastContextValue => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
  },
});

export default ToastProvider;
