import React, {useRef} from 'react';
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
import { useCart } from '../useCart';

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
  const { add, increment, decrement, remove, items } = useCart();
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
  const quantity = existing?.quantity ?? 0;
  const itemId = existing?.cartItemId ?? existing?.id ?? product.id;

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

  const handleMinus = () =>
    run(() => (quantity > 1 ? decrement(itemId) : remove(itemId)));

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

  if (quantity > 0) {
    return (
      <View
        style={[styles.stepper, compact && styles.stepperCompact, style]}>
        <TouchableOpacity
          style={styles.stepBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          onPress={handleMinus}>
          <Minus size={scale(14)} color={colors.primary} strokeWidth={3} />
        </TouchableOpacity>
        <Text style={[styles.qtyText, compact && styles.qtyTextCompact]}>
          {quantity}
        </Text>
        <TouchableOpacity
          style={styles.stepBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          onPress={handlePlus}>
          <Plus size={scale(14)} color={colors.primary} strokeWidth={3} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.addBtn, compact && styles.addBtnCompact, style]}
      activeOpacity={0.85}
      onPress={handleAdd}>
      <ShoppingCart
        size={scale(13)}
        color={colors.textInverse}
        strokeWidth={2.4}
      />
      <Text style={[styles.addText, compact && styles.addTextCompact]}>
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
