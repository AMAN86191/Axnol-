import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useGetOrdersQuery} from '../../api/services/ordersApi';
import {colors, radius, rfValue, spacing, theme} from '../../theme';
import {getStatusColor} from '../../utils/status';

export const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {data, isLoading} = useGetOrdersQuery();
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Orders</Text>
      <FlatList
        data={data}
        contentContainerStyle={{padding: spacing.xl, gap: spacing.md}}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet</Text>}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('OrderDetails', {orderId: item.id})
            }>
            <View style={styles.rowBetween}>
              <Text style={styles.orderNo}>{item.orderNo}</Text>
              <View
                style={[
                  styles.badge,
                  {backgroundColor: getStatusColor(item.status).bg},
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    {color: getStatusColor(item.status).text},
                  ]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.items}>{item.items.length} item(s)</Text>
            <Text style={styles.total}>₹ {item.total.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={i => i.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  header: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xl,
    color: colors.text,
    padding: spacing.xxl,
    paddingBottom: 0,
  },
  empty: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNo: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.md,
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  badgeText: {...theme.typography.bold, fontSize: rfValue(10)},
  items: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  total: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.md,
    color: colors.primary,
    marginTop: spacing.sm,
  },
});
export default OrdersScreen;
