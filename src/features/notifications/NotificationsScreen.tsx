import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
} from '../../api/services/documentsApi';
import {colors, radius, scale, spacing, theme} from '../../theme';
import Button from '../../components/ui/Button';
import {Bell} from 'lucide-react-native';

export const NotificationsScreen: React.FC = () => {
  const {data, isLoading} = useGetNotificationsQuery();
  const [markAll] = useMarkAllReadMutation();
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notifications</Text>
        <Button
          title="Mark All Read"
          onPress={() => markAll()}
          size="small"
          variant="ghost"
          fullWidth={false}
        />
      </View>
      <FlatList
        data={data}
        contentContainerStyle={{padding: spacing.xl, gap: spacing.sm}}
        ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
        renderItem={({item}) => (
          <View
            style={[
              styles.card,
              !item.read && {
                borderLeftColor: colors.primary,
                borderLeftWidth: 3,
              },
            ]}>
            <Bell size={scale(16)} color={colors.primary} />
            <View style={{flex: 1, marginLeft: spacing.sm}}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </View>
        )}
        keyExtractor={i => i.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xxl,
    paddingBottom: 0,
  },
  header: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xl,
    color: colors.text,
  },
  empty: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  title: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.md,
    color: colors.text,
  },
  body: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
export default NotificationsScreen;
