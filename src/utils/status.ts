import {colors} from '../theme';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
    case 'in-progress':
      return {bg: colors.warningLight, text: colors.warning};
    case 'approved':
    case 'active':
    case 'delivered':
    case 'paid':
    case 'resolved':
      return {bg: colors.successLight, text: colors.success};
    case 'rejected':
    case 'inactive':
    case 'cancelled':
    case 'unpaid':
      return {bg: colors.dangerLight, text: colors.danger};
    case 'placed':
    case 'confirmed':
    case 'dispatched':
      return {bg: colors.infoLight, text: colors.info};
    case 'new':
    default:
      return {bg: colors.surfaceAlt, text: colors.textSecondary};
  }
};
