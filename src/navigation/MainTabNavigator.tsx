import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Heart, Plus, Crown, User as UserIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import HomeScreen from '../screens/main/HomeScreen';
import DonateScreen from '../screens/main/DonateScreen';
import AddScreen from '../screens/main/AddScreen';
import JoinMembershipScreen from '../screens/main/JoinMembershipScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { Colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RFValue } from 'react-native-responsive-fontsize';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  
  return (
    <View style={[
      styles.tabBarContainer,
      {
        marginBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom / 2,
      },
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let IconComponent = Home;
        let label = t('tabs.home');

        if (route.name === 'Home') {
          IconComponent = Home;
          label = t('tabs.home');
        } else if (route.name === 'Donate') {
          IconComponent = Heart;
          label = t('tabs.donate');
        } else if (route.name === 'Add') {
          IconComponent = Plus;
          label = t('tabs.create');
        } else if (route.name === 'Membership') {
          IconComponent = Crown;
          label = t('tabs.membership');
        } else if (route.name === 'Profile') {
          IconComponent = UserIcon;
          label = t('tabs.profile');
        }

        // Special render for Center Add/Create Button
        if (route.name === 'Add') {
          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View style={styles.createIconContainer}>
                <Plus color={Colors.white} size={RFValue(20)} strokeWidth={3} />
              </View>
              <Text style={styles.createTabText}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        }

        // Normal Tabs
        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={[styles.tabItemInner, isFocused && styles.activeTabBackground]}>
              <IconComponent
                color={isFocused ? Colors.primary : Colors.white}
                fill={isFocused ? Colors.primary : 'none'}
                size={RFValue(18)}
                strokeWidth={isFocused ? 2.5 : 2}
              />
              <Text style={isFocused ? styles.activeTabText : styles.inactiveTabText}>
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Donate" component={DonateScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Membership" component={JoinMembershipScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#153029',
    height: hp('7.5%'),
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: wp('2%'),
    position: 'absolute',
    bottom: hp('3%'),
    left: wp('3%'),
    right: wp('3%'),
    borderRadius: wp('5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.2%'),
    width: wp('16%'),
    borderRadius: wp('2.5%'),
  },
  activeTabBackground: {
    // backgroundColor: '#FFF2EB', // Pale orange
  },
  createIconContainer: {
    width: wp('13%'),
    height: wp('13%'),
    borderRadius: wp('6.5%'),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('0.5%'),
    marginTop: hp('-3%'), // Pop up
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  activeTabText: {
    color: Colors.primary,
    fontSize: RFValue(8),
    fontWeight: '700',
    marginTop: hp('0.5%'),
  },
  inactiveTabText: {
    color: Colors.white,
    fontSize: RFValue(8),
    fontWeight: '600',
    marginTop: hp('0.5%'),
  },
  createTabText: {
    color: Colors.white,
    fontSize: RFValue(8.5),
    fontWeight: '600',
    marginTop: hp('0.2%'),
  }
});
