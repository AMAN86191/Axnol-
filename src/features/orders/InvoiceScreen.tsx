import React, {useState} from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ChevronLeft, FileText, RotateCcw} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import {toast} from '../../components/ui/ToastProvider';

const FILTER_TABS = ['All', 'Paid', 'Pending'];

const MOCK_INVOICES = [
  {
    id: 'inv1',
    invoiceNo: 'INV-2026-001',
    orderNo: 'Order #AX0003',
    date: '18 Sep 2026',
    status: 'Paid',
    amount: 53100,
  },
  {
    id: 'inv2',
    invoiceNo: 'INV-2026-002',
    orderNo: 'Order #AX0002',
    date: '22 Sep 2026',
    status: 'Pending',
    amount: 21830,
  },
  {
    id: 'inv3',
    invoiceNo: 'INV-2026-003',
    orderNo: 'Order #AX0001',
    date: '25 Sep 2026',
    status: 'Paid',
    amount: 28320,
  },
  {
    id: 'inv4',
    invoiceNo: 'INV-2026-004',
    orderNo: 'Order #AX0004',
    date: '10 Sep 2026',
    status: 'Paid',
    amount: 14760,
  },
];

export const InvoiceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filtered = MOCK_INVOICES.filter(inv => {
    if (selectedFilter === 'All') return true;
    return inv.status.toLowerCase() === selectedFilter.toLowerCase();
  });

  const handleInvoicePress = (item: (typeof MOCK_INVOICES)[0]) => {
    toast.show({
      type: 'info',
      title: 'Tax Invoice',
      message: `${item.invoiceNo} • ${item.orderNo}\nAmount: ₹${item.amount.toLocaleString('en-IN')} • Status: ${item.status}`,
      action: {
        label: 'Download PDF',
        onPress: () =>
          toast.success('Downloading', `${item.invoiceNo}.pdf downloaded`),
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + spacing.sm}]}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={scale(24)} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoices</Text>
        <TouchableOpacity style={styles.refreshBtn} activeOpacity={0.7}>
          <RotateCcw size={scale(19)} color="#1E293B" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <View style={styles.filterList}>
          {FILTER_TABS.map(tab => {
            const active = tab === selectedFilter;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterPill, active && styles.filterPillActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(tab)}>
                <Text
                  style={[
                    styles.filterPillText,
                    active && styles.filterPillTextActive,
                  ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Invoices List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, {paddingBottom: insets.bottom + scale(80)}]}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => {
          const isPaid = item.status === 'Paid';
          return (
            <TouchableOpacity
              style={styles.invoiceCard}
              activeOpacity={0.85}
              onPress={() => handleInvoicePress(item)}>
              <View style={styles.pdfIconWrap}>
                <FileText size={scale(24)} color="#EF4444" strokeWidth={2} />
              </View>

              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceNo}>{item.invoiceNo}</Text>
                <Text style={styles.orderNo}>{item.orderNo}</Text>
                <Text style={styles.invoiceDate}>{item.date}</Text>
              </View>

              <View style={styles.invoiceRight}>
                <View
                  style={[
                    styles.statusBadge,
                    {backgroundColor: isPaid ? '#DCFCE7' : '#FEF3C7'},
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      {color: isPaid ? '#16A34A' : '#D97706'},
                    ]}>
                    {item.status}
                  </Text>
                </View>
                <Text style={styles.invoiceAmount}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  backBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#0F172A',
  },
  refreshBtn: {
    padding: scale(4),
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  filterList: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.xl,
    paddingVertical: scale(6),
    borderRadius: radius.pill,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0284C7',
  },
  filterPillText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  invoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  pdfIconWrap: {
    width: scale(46),
    height: scale(46),
    borderRadius: radius.sm,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNo: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  orderNo: {
    fontSize: scale(11),
    color: '#64748B',
    marginTop: 2,
  },
  invoiceDate: {
    fontSize: scale(11),
    color: '#94A3B8',
    marginTop: 2,
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: scale(3),
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: scale(11),
    fontWeight: '700',
  },
  invoiceAmount: {
    fontSize: scale(14),
    fontWeight: '800',
    color: '#0F172A',
  },
});

export default InvoiceScreen;
