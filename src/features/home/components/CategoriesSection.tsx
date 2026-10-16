import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Cog,
  Droplet,
  Droplets,
  FlaskConical,
  LucideIcon,
  ShieldCheck,
  Wrench,
} from 'lucide-react-native';
import {colors, scale} from '../../../theme';
import {CategoryIcon, CategoryItem} from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';

interface CategoriesSectionProps {
  categories: CategoryItem[];
  onSeeAll?: () => void;
  onSelect: (category: CategoryItem) => void;
}

const ICONS: Record<CategoryIcon, LucideIcon> = {
  grease: Droplets,
  hydraulic: Droplet,
  gear: Cog,
  cutting: Wrench,
  rust: ShieldCheck,
  synthetic: FlaskConical,
};

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  onSeeAll,
  onSelect,
}) => (
  <>
    <HomeSectionHeader
      title="Categories"
      subtitle="Browse our product range"
      onAction={onSeeAll}
    />

    <FlatList
      horizontal
      data={categories}
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listPad}
      renderItem={({item}) => {
        const Icon = ICONS[item.icon];
        return (
          <TouchableOpacity
            style={styles.item}
            activeOpacity={0.85}
            onPress={() => onSelect(item)}>
            <View style={styles.circle}>
              <Icon size={scale(23)} color={colors.primary} strokeWidth={1.8} />
            </View>

            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>

          
          </TouchableOpacity>
        );
      }}
    />
  </>
);

const CIRCLE = scale(56);

const styles = StyleSheet.create({
  listPad: {
    gap: scale(14),
    paddingTop: scale(4),
    paddingBottom: scale(4),
    paddingRight: scale(6),
  },
  item: {
    width: scale(74),
    alignItems: 'center',
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    borderWidth: 1,
    borderColor: '#D5E7F8',
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: scale(10.5),
    fontWeight: '800',
    color: '#0F172A',
    // letterSpacing: -0.1,
    textAlign: 'center',
    // lineHeight: scale(13.5),
    marginTop: scale(8),
    minHeight: scale(27),
  },

});

export default CategoriesSection;
