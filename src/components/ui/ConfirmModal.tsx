import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {AlertTriangle} from 'lucide-react-native';
import {colors, radius, scale, shadows, spacing} from '../../theme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onCancel,
  onConfirm,
}) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    statusBarTranslucent
    onRequestClose={() => {
      if (!loading) {
        onCancel();
      }
    }}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View
          style={[
            styles.iconWrap,
            destructive ? styles.iconWrapDanger : styles.iconWrapWarning,
          ]}>
          <AlertTriangle
            size={scale(24)}
            color={destructive ? colors.danger : colors.warning}
            strokeWidth={2.2}
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            activeOpacity={0.8}
            disabled={loading}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              destructive ? styles.confirmDanger : styles.confirmPrimary,
              loading && styles.disabled,
            ]}
            activeOpacity={0.85}
            disabled={loading}
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={colors.textInverse}
              />
            ) : (
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 24, 44, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    ...shadows.large,
  },
  iconWrap: {
    width: scale(54),
    height: scale(54),
    borderRadius: scale(27),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconWrapDanger: {
    backgroundColor: colors.dangerLight,
  },
  iconWrapWarning: {
    backgroundColor: colors.warningLight,
  },
  title: {
    fontSize: scale(17),
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    fontSize: scale(12.5),
    lineHeight: scale(18),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    width: '100%',
  },
  button: {
    flex: 1,
    height: scale(42),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceAlt,
  },
  confirmPrimary: {
    backgroundColor: colors.primary,
  },
  confirmDanger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.7,
  },
  cancelText: {
    fontSize: scale(13),
    fontWeight: '700',
    color: colors.textSecondary,
  },
  confirmText: {
    fontSize: scale(13),
    fontWeight: '700',
    color: colors.textInverse,
  },
});

export default ConfirmModal;
