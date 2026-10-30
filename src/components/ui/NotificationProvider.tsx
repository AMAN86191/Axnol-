import React, {createContext, useCallback, useContext, useMemo, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import AnimatedCartToast from '../../features/cart/components/AnimatedCartToast';
import AnimatedWishlistToast from '../../features/wishlist/components/AnimatedWishlistToast';

interface CartProduct {
  id?: string | number;
  name?: string;
  image?: string;
}

interface WishlistPayload {
  productName?: string;
  action: 'added' | 'removed';
}

interface NotificationContextValue {
  showCartNotification: (payload?: CartProduct | {product?: CartProduct}) => void;
  showWishlistNotification: (payload: WishlistPayload) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useAppNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useAppNotification must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [cartVisible, setCartVisible] = useState(false);
  const [wishlistVisible, setWishlistVisible] = useState(false);
  const [cartProduct, setCartProduct] = useState<CartProduct | undefined>();
  const [wishlistPayload, setWishlistPayload] = useState<WishlistPayload>({action: 'added'});
  const cartTimer = useRef<NodeJS.Timeout | null>(null);
  const wishlistTimer = useRef<NodeJS.Timeout | null>(null);

  const showCartNotification = useCallback((payload?: CartProduct | {product?: CartProduct}) => {
    if (cartTimer.current) clearTimeout(cartTimer.current);
    const product = (payload as any)?.product ?? payload;
    setCartProduct(product);
    setCartVisible(false);
    requestAnimationFrame(() => setCartVisible(true));
  }, []);

  const showWishlistNotification = useCallback((payload: WishlistPayload) => {
    if (wishlistTimer.current) clearTimeout(wishlistTimer.current);
    setWishlistPayload(payload);
    setWishlistVisible(false);
    requestAnimationFrame(() => setWishlistVisible(true));
  }, []);

  const value = useMemo(() => ({showCartNotification, showWishlistNotification}), [showCartNotification, showWishlistNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={styles.host}>
        <AnimatedCartToast visible={cartVisible} product={cartProduct} onHide={() => setCartVisible(false)} />
        <AnimatedWishlistToast
          visible={wishlistVisible}
          action={wishlistPayload.action}
          productName={wishlistPayload.productName}
          onHide={() => setWishlistVisible(false)}
        />
      </View>
    </NotificationContext.Provider>
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

export default NotificationProvider;
