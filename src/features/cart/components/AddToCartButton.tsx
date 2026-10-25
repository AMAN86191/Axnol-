import React from 'react';
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
  onAdded?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  compact = false,
  onAdded,
  style,
}) => {
  const { add, increment, decrement, remove, items } = useCart();
  const existing = items.find(
    item => item.id === product.id && item.size === (product as any).size,
  );
  const quantity = existing?.quantity ?? 0;

  const handleAdd = async () => {
    await add({ ...(product as any), size: (product as any).size ?? product.unit }, 1);
    onAdded?.();
  };

  if (quantity > 0) {
    const handleMinus = () =>
      quantity > 1 ? decrement(existing?.id || product.id) : remove(existing?.id || product.id);

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
          onPress={() => increment(existing?.id || product.id)}>
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
  addText: {
    color: colors.textInverse,
    fontSize: scale(12),
    fontWeight: '800',
    letterSpacing: 0.1,
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
