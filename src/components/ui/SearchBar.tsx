import React from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {Search, X} from 'lucide-react-native';
import {colors, fontSize, radius, scale, spacing, typography, verticalScale} from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search…',
}) => (
  <View style={styles.container}>
    <Search size={scale(18)} color={colors.textMuted} />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      style={styles.input}
      returnKeyType="search"
    />
    {value.length > 0 ? (
      <TouchableOpacity onPress={() => onChangeText('')} hitSlop={8}>
        <X size={scale(17)} color={colors.textMuted} />
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    minHeight: verticalScale(46),
    gap: spacing.sm,
  },
  input: {
    ...typography.regular,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
    paddingVertical: spacing.md,
  },
});

export default SearchBar;
