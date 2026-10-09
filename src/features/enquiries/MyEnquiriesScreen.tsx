import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MessageSquareText} from 'lucide-react-native';
import {useGetEnquiriesQuery} from '../../api/services/enquiriesApi';
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

export const MyEnquiriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {data, isLoading} = useGetEnquiriesQuery();

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Enquiries" onBack={() => navigation.goBack()} />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon={MessageSquareText}
              title="No enquiries yet"
              subtitle="Send an enquiry from any product or the contact page"
            />
          }
          renderItem={({item}) => (
            <Card>
              <View style={styles.topRow}>
                <View
                  style={[
                    styles.typeChip,
                    item.type === 'contact'
                      ? styles.typeContact
                      : styles.typeProduct,
                  ]}>
                  <Text
                    style={[
                      styles.typeText,
                      item.type === 'contact'
                        ? styles.typeTextContact
                        : styles.typeTextProduct,
                    ]}>
                    {item.type === 'product' ? 'Product' : 'Contact'}
                  </Text>
                </View>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </View>
              {item.subject ? (
                <Text style={styles.subject} numberOfLines={2}>
                  {item.subject}
                </Text>
              ) : null}
              {item.productName ? (
                <Text style={styles.product} numberOfLines={1}>
                  {item.productName}
                </Text>
              ) : null}
              <Text style={styles.message} numberOfLines={2}>
                {item.message}
              </Text>
              <View style={styles.bottomRow}>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                <StatusBadge status={item.status} />
              </View>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeChip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  typeProduct: {backgroundColor: colors.infoLight},
  typeContact: {backgroundColor: colors.successLight},
  typeText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
  },
  typeTextProduct: {color: colors.info},
  typeTextContact: {color: colors.success},
  subject: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.sm,
    lineHeight: fontSize.sm * 1.4,
  },
  product: {
    ...typography.medium,
    fontSize: fontSize.xs,
    color: colors.accentDark,
    marginTop: spacing.xs,
  },
  message: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: fontSize.xs * 1.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  date: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});

export default MyEnquiriesScreen;
