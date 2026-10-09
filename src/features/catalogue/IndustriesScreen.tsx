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
import {useGetIndustriesQuery} from '../../api/services/catalogueApi';
import AppImage from '../../components/ui/AppImage';
import ScreenHeader from '../../components/ui/ScreenHeader';
import {
  colors,
  fontSize,
  radius,
  shadows,
  spacing,
  typography,
  verticalScale,
} from '../../theme';

export const IndustriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {data, isLoading} = useGetIndustriesQuery();
  return (
    <View style={styles.container}>
      <ScreenHeader title="Industries" />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={{gap: spacing.md}}
          contentContainerStyle={styles.list}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('Categories', {
                  industryId: item.id,
                  industryName: item.name,
                })
              }>
              <AppImage uri={item.image} style={styles.img} />
              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.desc} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            </TouchableOpacity>
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
  card: {
    flex: 1,
    maxWidth: '50%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.small,
  },
  img: {width: '100%', height: verticalScale(110)},
  body: {padding: spacing.md},
  name: {
    ...typography.semibold,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: fontSize.md * 1.35,
  },
  desc: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: fontSize.xs * 1.45,
    marginTop: spacing.xs,
  },
});
export default IndustriesScreen;
