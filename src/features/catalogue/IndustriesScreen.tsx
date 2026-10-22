import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppImage from '../../components/ui/AppImage';
import { radius, scale, spacing } from '../../theme';
import CommonHeader from '../../components/ui/CommonHeader';
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading';
import { INDUSTRIES_DATA } from './industriesData';
import IndustriesSkeleton from './components/IndustriesSkeleton';

const COLUMNS = 3;

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size));
  }
  return rows;
};

export const IndustriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const loading = useSimulatedLoading();

  const filtered = INDUSTRIES_DATA.filter(
    item => !search || item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CommonHeader title="Industries" />

      {loading ? (
        <IndustriesSkeleton />
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Search size={scale(18)} color="#718096" strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search industries"
                placeholderTextColor="#718096"
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + scale(80) },
            ]}
          >
            {filtered.length === 0 ? (
              <Text style={styles.emptyText}>No industries found</Text>
            ) : (
              chunk(filtered, COLUMNS).map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                  {row.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.tile}
                      activeOpacity={0.8}
                      onPress={() =>
                        navigation.navigate('IndustryDetails', {
                          industryId: item.id,
                        })
                      }
                    >
                      <View style={styles.imageWrap}>
                        <AppImage
                          uri={item.image}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      </View>
                      <Text style={styles.tileTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {Array.from({ length: COLUMNS - row.length }).map((_, i) => (
                    <View key={`fill-${i}`} style={styles.tileFill} />
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  searchBarContainer: {
    // backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: scale(44),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E3E8EF',
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: spacing.sm,
    fontSize: scale(13),
    color: '#172033',
    paddingVertical: 0,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
  },
  tileFill: {
    flex: 1,
  },
  imageWrap: {
    width: '100%',
    height: scale(78),
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tileTitle: {
    fontSize: scale(11),
    fontWeight: '400',
    color: '#172033',
    marginTop: scale(8),
    marginBottom: scale(2),
  },
  emptyText: {
    textAlign: 'center',
    fontSize: scale(12.5),
    color: '#718096',
    paddingVertical: spacing.xl,
  },
});

export default IndustriesScreen;
