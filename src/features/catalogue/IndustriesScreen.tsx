import React, {useState} from 'react';
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {ChevronRight, Search} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppImage from '../../components/ui/AppImage';
import {radius, scale, spacing} from '../../theme';
import CommonHeader from '../../components/ui/CommonHeader';
import {useSimulatedLoading} from '../../hooks/useSimulatedLoading';
import IndustriesSkeleton from './components/IndustriesSkeleton';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md * 2) / 3;

const INDUSTRIES_DATA = [
  {
    id: 'ind2',
    name: 'Automotive',
    subtitle: 'Engine & vehicle care',
    image: 'ind_automotive',
  },
  {
    id: 'ind1',
    name: 'Industrial',
    subtitle: 'Machinery protection',
    image: 'ind_industrial',
  },
  {
    id: 'ind4',
    name: 'Marine',
    subtitle: 'Marine engine care',
    image: 'ind_marine',
  },
  {
    id: 'ind6',
    name: 'Construction',
    subtitle: 'Heavy equipment',
    image: 'ind_construction',
  },
  {
    id: 'ind3',
    name: 'Agriculture',
    subtitle: 'Farm equipment',
    image: 'ind_agricultural',
  },
  {
    id: 'ind8',
    name: 'Energy',
    subtitle: 'Power generation',
    image: 'ind_energy',
  },
];

export const IndustriesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const loading = useSimulatedLoading();

  const filtered = INDUSTRIES_DATA.filter(
    item =>
      !search || item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

   <CommonHeader title='Industries' />

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

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[styles.listContent, {paddingBottom: insets.bottom + scale(80)}]}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPressIn={() => setActiveId(item.id)}
            onPressOut={() => setActiveId(null)}
            onPress={() =>
              navigation.navigate('Products', {
                title: item.name,
                industryId: item.id,
              })
            }>
            <View style={styles.imageWrap}>
              <AppImage uri={item.image} style={styles.image} resizeMode="cover" />
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.arrowBadge}>
                <ChevronRight
                  size={scale(12)}
                  color={activeId === item.id ? '#0D4F82' : '#1264A3'}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
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
    gap: spacing.md,
  },
  columnWrapper: {
    gap: spacing.md,
  },
  card: {
    flex: 1,
    maxWidth: CARD_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E3E8EF',
    overflow: 'hidden',
  },
  imageWrap: {
    width: '100%',
    height: scale(88),
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection:"row",
    paddingVertical: spacing.sm,
    paddingHorizontal: scale(6),
    gap: scale(5),
  },
  cardTitle: {
    fontSize: scale(10.5),
    fontWeight: '700',
    color: '#172033',
    textAlign: 'center',
  },
  arrowBadge: {
    width: scale(20),
    height: scale(20),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#1264A3',
    shadowOffset: {width: 0, height: scale(2)},
    shadowOpacity: 0.15,
    shadowRadius: scale(4),
    elevation: 2,
  },
});

export default IndustriesScreen;
