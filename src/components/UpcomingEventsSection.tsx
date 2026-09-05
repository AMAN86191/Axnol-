import React from 'react';
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../theme/colors';
import useHomeStore from '../zustand/useHomeStore';

export const UpcomingEventsSection = () => {
  const navigation = useNavigation();
  const { events } = useHomeStore();
  const { t } = useTranslation();
  
  if (!events || events.length === 0) {
    return null;
  }

  const event = events[0];

  // Extract dynamic event data
  const eventTitle = event.title || event.event_title || event.name || t('events.gauSevaEvent');
  const eventDate = event.date || event.event_date || event.created_at || t('events.upcoming');
  const eventAddress = event.address || event.location || event.event_location || t('events.gaushala');
  
  // Extract day/month for badge if possible
  let dateBadge = t('common.soon');
  if (eventDate.includes(',')) {
     dateBadge = eventDate.split(',')[0].trim();
  } else if (eventDate.includes(' ')) {
     dateBadge = eventDate.split(' ').slice(0, 2).join(' ');
  } else {
     dateBadge = eventDate.substring(0, 6);
  }

  const eventImage = event.image || event.event_image || event.event_img 
      ? { uri: `https://gst.tambimotors.com/${event.image || event.event_image || event.event_img}` } 
      : require('../../assets/images/event.png');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{t('upcomingSection.title')}</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('UpcomingEventsScreen' as never)}
          style={styles.viewAllBtn}
        >
          <Text style={styles.viewAllText}>{t('common.viewAll')}</Text>
          <ChevronRight size={RFValue(12)} color={Colors.primary} style={styles.chevron} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.bannerCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('UpcomingEventsScreen' as never)}
      >
        <ImageBackground 
          source={eventImage} 
          style={styles.bannerImage}
          imageStyle={styles.bannerImageStyle}
        >
          <View style={styles.overlay}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{dateBadge}</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle} numberOfLines={1}>{eventTitle}</Text>
              <View style={styles.infoRow}>
                <MapPin size={RFValue(11)} color={Colors.white} />
                <Text style={styles.infoText} numberOfLines={1}>{eventAddress}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: hp('1.5%'),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  sectionTitle: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: Colors.dark,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: RFValue(11),
    fontWeight: '600',
    color: Colors.primary,
  },
  chevron: {
    marginLeft: wp('1%'),
    marginTop: hp('0.2%'),
  },
  bannerCard: {
    width: '100%',
    height: hp('22%'),
    borderRadius: wp('4%'),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bannerImageStyle: {
    borderRadius: wp('4%'),
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: wp('4%'),
    height: '100%',
    justifyContent: 'flex-end',
  },
  badgeContainer: {
    position: 'absolute',
    top: wp('4%'),
    right: wp('4%'),
    backgroundColor: Colors.primary,
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('1%'),
  },
  badgeText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: RFValue(10),
  },
  eventInfo: {
    width: '100%',
  },
  eventTitle: {
    fontSize: RFValue(14),
    fontWeight: '700',
    color: Colors.white,
    marginBottom: hp('0.5%'),
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: RFValue(11),
    color: Colors.white,
    marginLeft: wp('1.5%'),
    fontWeight: '500',
  },
});
