import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Tag} from 'lucide-react-native';
import {useGetPricingRequestsQuery} from '../../api/services/pricingApi';
import {PricingRequest} from '../../api/types';
import AppImage from '../../components/ui/AppImage';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ScreenHeader from '../../components/ui/ScreenHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const PricingRequestsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState('All');
  const {data, isLoading} = useGetPricingRequestsQuery({
    status: filter === 'All' ? undefined : filter.toLowerCase(),
  });

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Pricing Requests"
        onBack={() => navigation.goBack()}
      />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.chips}>
              {FILTERS.map(f => {
                const active = f === filter;
                return (
                  <TouchableOpacity
                    key={f}
                    activeOpacity={0.8}
                    onPress={() => setFilter(f)}
                    style={[styles.chip, active && styles.chipActive]}>
                    <Text
                      style={[styles.chipText, active && styles.chipTextActive]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon={Tag}
              title="No pricing requests"
              subtitle="Request dealer pricing from any product page"
            />
          }
          renderItem={({item}) => <RequestCard item={item} />}
        />
      )}
    </View>
  );
};

const RequestCard: React.FC<{item: PricingRequest}> = ({item}) => (
  <Card>
    <View style={styles.topRow}>
      <AppImage uri={item.productImage} style={styles.img} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.productName}
        </Text>
        <Text style={styles.qty}>
          Qty {item.quantity} {item.unit}
        </Text>
      </View>
      <StatusBadge status={item.status} />
    </View>
    <View style={styles.priceRow}>
      {item.targetPrice ? (
        <Text style={styles.target}>
          Target ₹{item.targetPrice.toLocaleString('en-IN')}
        </Text>
      ) : null}
      {item.approvedPrice ? (
        <Text style={styles.approved}>
          Approved ₹{item.approvedPrice.toLocaleString('en-IN')}
        </Text>
      ) : null}
    </View>
    {item.adminRemark ? (
      <View style={styles.remarkBox}>
        <Text style={styles.remark}>{item.adminRemark}</Text>
      </View>
    ) : null}
    <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
  </Card>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  chipTextActive: {
    ...typography.semibold,
    color: colors.textInverse,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  img: {
    width: scale(50),
    height: scale(50),
    borderRadius: radius.sm,
  },
  info: {flex: 1},
  name: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: fontSize.sm * 1.4,
  },
  qty: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  target: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  approved: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.success,
  },
  remarkBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  remark: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: fontSize.xs * 1.5,
  },
  date: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});

export default PricingRequestsScreen;
