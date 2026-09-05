import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LayoutGrid, HeartHandshake } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';

interface ProfileTabsProps {
  activeTab: 'posts' | 'contributions';
  onTabPress: (tab: 'posts' | 'contributions') => void;
}

export const ProfileTabs = React.memo(({ activeTab, onTabPress }: ProfileTabsProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'posts' && styles.activeTabButton]}
        onPress={() => onTabPress('posts')}
        activeOpacity={0.7}
      >
        <LayoutGrid size={RFValue(11.5)} color={activeTab === 'posts' ? '#FF6F34' : '#6B7280'} strokeWidth={2.2} />
        <Text style={[styles.tabButtonText, activeTab === 'posts' && styles.activeTabButtonText]}>{t('profile.myPosts')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'contributions' && styles.activeTabButton]}
        onPress={() => onTabPress('contributions')}
        activeOpacity={0.7}
      >
        <HeartHandshake size={RFValue(11.5)} color={activeTab === 'contributions' ? '#FF6F34' : '#6B7280'} strokeWidth={2.2} />
        <Text style={[styles.tabButtonText, activeTab === 'contributions' && styles.activeTabButtonText]}>{t('profile.contributions')}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: wp('4%'),
    marginTop: hp('2.5%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('1%'),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1%'),
    borderRadius: wp('2%'),
  },
  activeTabButton: {
    backgroundColor: '#FFF5F0',
  },
  tabButtonText: {
    fontSize: wp('3%'),
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: wp('1.5%'),
  },
  activeTabButtonText: {
    color: '#FF6F34',
    fontWeight: '700',
  },
});
