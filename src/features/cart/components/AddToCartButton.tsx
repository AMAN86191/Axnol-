import React, {useEffect, useRef, useState} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Minus, Plus, ShoppingCart } from 'lucide-react-native';
import { colors, radius, scale } from '../../../theme';
import { CartItem } from '../cartSlice';
import {
  getCartItemMutationKey,
  getCartProductMutationKey,
  useCart,
} from '../useCart';

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>;
  compact?: boolean;
  disabled?: boolean;
  onAdded?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  compact = false,
  disabled = false,
  onAdded,
  style,
}) => {
  const {
    add,
    increment,
    decrement,
    remove,
    items,
    isMutating,
    getDisplayQuantity,
  } = useCart();
  const busyRef = useRef(false);
  const productKey = String(product.productId ?? product.id);
  const rateChartKey =
    product.rateChartId !== undefined &&
    product.rateChartId !== null &&
    String(product.rateChartId).trim()
      ? String(product.rateChartId)
      : undefined;
  const rawSize = product.size ?? product.unit;
  const sizeKey =
    rawSize && rawSize !== 'Unit' ? String(rawSize) : undefined;
  const existing = items.find(item => {
    if (String(item.productId ?? item.id) !== productKey) {
      return false;
    }
    if (rateChartKey) {
      return (
        item.rateChartId !== undefined &&
        item.rateChartId !== null &&
        String(item.rateChartId) === rateChartKey
      );
    }
    if (sizeKey) {
      return (
        (item.rateChartId === undefined || item.rateChartId === null) &&
        String(item.size ?? item.unit ?? '') === sizeKey
      );
    }
    return item.rateChartId === undefined || item.rateChartId === null;
  });
  const quantity = existing ? getDisplayQuantity(existing) : 0;
  const itemId = existing?.cartItemId ?? existing?.id ?? product.id;
  const mutationPending = isMutating([
    getCartProductMutationKey(product),
    getCartItemMutationKey(itemId),
  ]);
  const interactionDisabled = disabled || mutationPending;
  // Just added: shown at once, but the server has not given it an id yet.
  const syncing = !!existing && existing.cartItemId == null;

  const run = async (action: () => Promise<unknown> | unknown) => {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    try {
      await action();
    } finally {
      busyRef.current = false;
    }
  };

  const handleAdd = () =>
    run(async () => {
      const size = sizeKey;
      const added = await add({ ...(product as any), size }, 1);
      if (added) {
        onAdded?.();
      }
    });

  // Taking the last unit off: show 0 for a moment, then quietly the Add button.
  const [zeroPhase, setZeroPhase] = useState<'none' | 'zero' | 'add'>('none');
  const zeroTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (zeroTimer.current) {
        clearTimeout(zeroTimer.current);
      }
    },
    [],
  );

  // Once the item is really gone, the normal Add button takes over.
  useEffect(() => {
    if (!existing && zeroPhase !== 'none') {
      setZeroPhase('none');
    }
  }, [existing, zeroPhase]);

  const handleMinus = () => {
    if (quantity > 1) {
      return run(() => decrement(itemId));
    }
    setZeroPhase('zero');
    zeroTimer.current = setTimeout(() => setZeroPhase('add'), 350);
    return run(async () => {
      const removed = await remove(itemId);
      if (!removed) {
        // Could not remove it: go back to showing the real quantity.
        if (zeroTimer.current) {
          clearTimeout(zeroTimer.current);
        }
        setZeroPhase('none');
      }
    });
  };

  const handlePlus = () => run(() => increment(itemId));

  if (disabled) {
    return (
      <TouchableOpacity
        style={[styles.addBtn, compact && styles.addBtnCompact, styles.addBtnDisabled, style]}
        activeOpacity={1}
        disabled
        accessibilityState={{disabled: true}}>
        <ShoppingCart
          size={scale(13)}
          color="#94A3B8"
          strokeWidth={2.4}
        />
        <Text style={[styles.addText, compact && styles.addTextCompact, styles.addTextDisabled]}>
          Add
        </Text>
      </TouchableOpacity>
    );
  }

  // Taps stay live while a request runs: they are grouped into one update.
  if (zeroPhase === 'zero' || (quantity > 0 && zeroPhase === 'none')) {
    return (
      <View
        style={[
          styles.stepper,
          compact && styles.stepperCompact,
          syncing && styles.stepperSyncing,
          style,
        ]}>
        <TouchableOpacity
          style={styles.stepBtn}
          activeOpacity={0.7}
          disabled={syncing}
          accessibilityState={{disabled: syncing}}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          onPress={handleMinus}>
          <Minus
            size={scale(14)}
            color={colors.primary}
            strokeWidth={3}
          />
        </TouchableOpacity>
        <Text style={[styles.qtyText, compact && styles.qtyTextCompact]}>
          {zeroPhase === 'zero' ? 0 : quantity}
        </Text>
        <TouchableOpacity
          style={styles.stepBtn}
          activeOpacity={0.7}
          disabled={syncing}
          accessibilityState={{disabled: syncing}}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          onPress={handlePlus}>
          <Plus
            size={scale(14)}
            color={colors.primary}
            strokeWidth={3}
          />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.addBtn,
        compact && styles.addBtnCompact,
        mutationPending && styles.addBtnPending,
        style,
      ]}
      activeOpacity={0.85}
      disabled={interactionDisabled}
      accessibilityState={{disabled: interactionDisabled}}
      onPress={handleAdd}>
      <ShoppingCart
        size={scale(13)}
        color={mutationPending ? '#64748B' : colors.textInverse}
        strokeWidth={2.4}
      />
      <Text
        style={[
          styles.addText,
          compact && styles.addTextCompact,
          mutationPending && styles.addTextDisabled,
        ]}>
        Add
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: scale(9),
    paddingHorizontal: scale(12),
  },
  addBtnCompact: {
    paddingVertical: scale(7),
    paddingHorizontal: scale(8),
    gap: scale(4),
  },
  addBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  addBtnPending: {
    backgroundColor: '#E2E8F0',
    opacity: 0.8,
  },
  addText: {
    color: colors.textInverse,
    fontSize: scale(12),
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  addTextDisabled: {
    color: '#64748B',
  },
  addTextCompact: {
    fontSize: scale(10.5),
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: scale(5),
    paddingHorizontal: scale(8),
  },
  stepperCompact: {
    paddingVertical: scale(4),
    paddingHorizontal: scale(6),
  },
  stepperSyncing: {
    opacity: 0.7,
  },
  stepBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: scale(22),
    minHeight: scale(22),
  },
  qtyText: {
    color: colors.primary,
    fontSize: scale(13),
    fontWeight: '800',
  },
  qtyTextCompact: {
    fontSize: scale(12),
  },
});

export default AddToCartButton;
