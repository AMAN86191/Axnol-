import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {FileText} from 'lucide-react-native';
import {useGetOrderInvoiceQuery} from '../../api/services/ordersApi';
import {OrdersStackParamList} from '../../navigation/types';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import {colors, fontSize, radius, spacing, typography} from '../../theme';

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const InvoiceScreen: React.FC = () => {
  const route = useRoute<RouteProp<OrdersStackParamList, 'Invoice'>>();
  const navigation = useNavigation<any>();
  const {data: invoice, isLoading, isError} = useGetOrderInvoiceQuery(
    route.params.orderId,
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Invoice" onBack={() => navigation.goBack()} />
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (isError || !invoice) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Invoice" onBack={() => navigation.goBack()} />
        <EmptyState
          icon={FileText}
          title="Invoice not available"
          subtitle="The invoice will be generated once the order is processed"
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Invoice" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.rowBetween}>
            <Text style={styles.heading}>TAX INVOICE</Text>
            <StatusBadge status={invoice.status} />
          </View>
          <Text style={styles.invoiceNo}>{invoice.invoiceNo}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.date)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.blockTitle}>Buyer Details</Text>
          <View style={styles.buyerBox}>
            <Text style={styles.buyerName}>{invoice.buyer.name}</Text>
            {invoice.buyer.company ? (
              <Text style={styles.buyerLine}>{invoice.buyer.company}</Text>
            ) : null}
            {invoice.buyer.address ? (
              <Text style={styles.buyerLine}>{invoice.buyer.address}</Text>
            ) : null}
            {invoice.buyer.gstin ? (
              <Text style={styles.buyerLine}>
                GSTIN: {invoice.buyer.gstin}
              </Text>
            ) : null}
          </View>
        </Card>

        <Card>
          <Text style={styles.blockTitle}>Items</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.thProduct, styles.th]}>Product</Text>
            <Text style={[styles.thQty, styles.th]}>Qty</Text>
            <Text style={[styles.thAmount, styles.th]}>Amount</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View
              key={`${item.productId}-${index}`}
              style={[
                styles.tableRow,
                index === invoice.items.length - 1 && styles.tableRowLast,
              ]}>
              <Text style={styles.tdProduct} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.tdQty}>{item.quantity}</Text>
              <Text style={styles.tdAmount}>
                ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                ₹{invoice.subtotal.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax (GST)</Text>
              <Text style={styles.totalValue}>
                ₹{invoice.tax.toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>Total</Text>
              <Text style={styles.grandValue}>
                ₹{invoice.total.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </Card>

        <Text style={styles.footerNote}>
          This is a computer generated invoice.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    ...typography.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    letterSpacing: 0.5,
  },
  invoiceNo: {
    ...typography.semibold,
    fontSize: fontSize.md,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  metaLabel: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  metaValue: {
    ...typography.medium,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  blockTitle: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  buyerBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  buyerName: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  buyerLine: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: fontSize.xs * 1.5,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  th: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  thProduct: {flex: 2},
  thQty: {flex: 1, textAlign: 'center'},
  thAmount: {flex: 1, textAlign: 'right'},
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableRowLast: {borderBottomWidth: 0},
  tdProduct: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 2,
    paddingRight: spacing.sm,
  },
  tdQty: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  tdAmount: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  totals: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  grandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  grandLabel: {
    ...typography.semibold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  grandValue: {
    ...typography.bold,
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  footerNote: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default InvoiceScreen;
