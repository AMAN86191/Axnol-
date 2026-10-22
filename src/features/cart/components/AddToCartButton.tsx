import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Check, ShoppingCart } from 'lucide-react-native';
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
  const { add, items } = useCart();
  const quantity = items.find(item => item.id === product.id)?.quantity ?? 0;

  const handleAdd = () => {
    add(product, 1);
    onAdded?.();
  };

  if (quantity > 0) {
    return (
      <TouchableOpacity
        style={[
          styles.addedBtn,
          compact && styles.addedBtnCompact,
          style,
        ]}
        activeOpacity={0.85}
        onPress={handleAdd}>
        <Check size={scale(13)} color="#0B7A3B" strokeWidth={3} />
        <Text style={[styles.addedText, compact && styles.addedTextCompact]}>
          Added
        </Text>
      </TouchableOpacity>
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
  addedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    backgroundColor: '#E7F6EE',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#0B7A3B',
    paddingVertical: scale(9),
    paddingHorizontal: scale(12),
  },
  addedBtnCompact: {
    paddingVertical: scale(7),
    paddingHorizontal: scale(8),
    gap: scale(4),
  },
  addedText: {
    color: '#0B7A3B',
    fontSize: scale(12),
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  addedTextCompact: {
    fontSize: scale(10.5),
  },
});

export default AddToCartButton;
