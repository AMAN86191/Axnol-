import React, {useEffect, useState} from 'react';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Minus, Plus} from 'lucide-react-native';
import {radius, scale} from '../../../theme';

interface EditableQuantityProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'compact' | 'regular';
  busy?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const EditableQuantity: React.FC<EditableQuantityProps> = ({
  value,
  onChange,
  min = 1,
  max = 999,
  size = 'compact',
  busy = false,
  style,
}) => {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!busy) {
      setDraft(String(value));
    }
  }, [busy, value]);

  const parseDraft = () => {
    const parsed = parseInt(draft, 10);
    return Number.isNaN(parsed) ? value : parsed;
  };

  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  const commit = () => {
    if (busy) {
      setDraft(String(value));
      return;
    }
    const next = clamp(parseDraft());
    setDraft(String(next));
    if (next !== value) {
      onChange(next);
    }
  };

  const step = (delta: number) => {
    if (busy) {
      return;
    }
    const next = clamp(parseDraft() + delta);
    setDraft(String(next));
    if (next !== value) {
      onChange(next);
    }
  };

  const canDecrement = clamp(parseDraft()) > min;
  const canIncrement = clamp(parseDraft()) < max;
  const isRegular = size === 'regular';

  return (
    <View
      style={[
        styles.stepper,
        isRegular && styles.stepperRegular,
        focused && styles.stepperFocused,
        busy && styles.stepperBusy,
        style,
      ]}>
      <TouchableOpacity
        style={[styles.btn, isRegular && styles.btnRegular]}
        activeOpacity={0.7}
        hitSlop={{top: 6, bottom: 6, left: 4, right: 4}}
        disabled={busy || !canDecrement}
        accessibilityState={{disabled: busy || !canDecrement}}
        onPress={() => step(-1)}>
        <Minus
          size={scale(isRegular ? 17 : 14)}
          color={canDecrement ? '#0F172A' : '#CBD5E1'}
          strokeWidth={2.6}
        />
      </TouchableOpacity>

      <TextInput
        style={[
          styles.input,
          isRegular ? styles.inputRegular : styles.inputCompact,
          focused && styles.inputFocused,
        ]}
        value={draft}
        editable={!busy}
        onChangeText={text => setDraft(text.replace(/[^0-9]/g, ''))}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commit();
        }}
        onSubmitEditing={commit}
        keyboardType="number-pad"
        returnKeyType="done"
        maxLength={3}
        selectTextOnFocus
        textAlign="center"
        underlineColorAndroid="transparent"
        accessibilityLabel="Quantity"
      />

      <TouchableOpacity
        style={[styles.btn, isRegular && styles.btnRegular]}
        activeOpacity={0.7}
        hitSlop={{top: 6, bottom: 6, left: 4, right: 4}}
        disabled={busy || !canIncrement}
        accessibilityState={{disabled: busy || !canIncrement}}
        onPress={() => step(1)}>
        <Plus
          size={scale(isRegular ? 17 : 14)}
          color={canIncrement ? '#0F172A' : '#CBD5E1'}
          strokeWidth={2.6}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scale(32),
    borderRadius: radius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  stepperRegular: {
    height: scale(44),
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
  },
  stepperFocused: {
    borderColor: '#0A4D8C',
    shadowColor: '#0A4D8C',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 2,
  },
  stepperBusy: {
    opacity: 0.6,
  },
  btn: {
    width: scale(30),
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRegular: {
    width: scale(42),
  },
  input: {
    height: '100%',
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontWeight: '800',
    color: '#0F172A',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputCompact: {
    width: scale(38),
    fontSize: scale(13),
  },
  inputRegular: {
    minWidth: scale(46),
    fontSize: scale(15),
    fontWeight: '700',
  },
  inputFocused: {
    backgroundColor: '#F0F7FF',
    color: '#0A4D8C',
  },
});

export default EditableQuantity;
