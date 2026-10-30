import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import AddNotification, {AddNotificationData, AddNotificationType} from './AddNotification';

interface ShowAddOptions {
  type?: AddNotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface AddNotificationContextValue {
  show: (options: ShowAddOptions) => string;
}

const AddNotificationContext = createContext<AddNotificationContextValue | null>(null);

export const useAddNotification = () => {
  const ctx = useContext(AddNotificationContext);
  if (!ctx) throw new Error('useAddNotification must be used within AddNotificationProvider');
  return ctx;
};

export const AddNotificationProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [items, setItems] = useState<AddNotificationData[]>([]);
  const counter = useRef(0);

  const show = useCallback((options: ShowAddOptions) => {
    const id = `addn-${Date.now()}-${counter.current++}`;
    const item: AddNotificationData = {
      id,
      type: options.type ?? 'success',
      title: options.title,
      message: options.message,
      duration: options.duration ?? 1800,
    };
    setItems(prev => {
      const next = [...prev, item];
      return next.slice(next.length > 3 ? next.length - 3 : 0);
    });
    return id;
  }, []);

  const hide = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const value = useMemo(() => ({show}), [show]);

  return (
    <AddNotificationContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={styles.host}>
        {items.map(item => (
          <AddNotification key={item.id} data={item} onClose={hide} />
        ))}
      </View>
    </AddNotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

export default AddNotificationProvider;
