import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Calendar, MapPin, Clock, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import useHomeStore from '../../zustand/useHomeStore';
import { useTranslation } from 'react-i18next';

const UpcomingEventsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { events } = useHomeStore();

  const renderEventCard = ({ item }: { item: any }) => {
    const eventTitle = item.title || item.event_title || item.name || t('events.gauSevaEvent');
    const eventDate = item.date || item.event_date || item.created_at || t('events.upcoming');
    const eventAddress = item.address || item.location || item.event_location || t('events.gaushala');
    const eventTime = item.time || item.event_time || t('events.time');
    const eventDescription = item.description || item.event_description || t('events.joinUs');

    let dateBadge = t('common.soon');
    if (eventDate.includes(',')) {
       dateBadge = eventDate.split(',')[0].trim();
    } else if (eventDate.includes(' ')) {
       dateBadge = eventDate.split(' ').slice(0, 2).join(' ');
    } else {
       dateBadge = eventDate.substring(0, 6);
    }

    const eventImage = item.image || item.event_image || item.event_img 
        ? { uri: `https://gst.tambimotors.com/${item.image || item.event_image || item.event_img}` } 
        : require('../../../assets/images/event.png');

    return (
      <View style={styles.card}>
        <Image source={eventImage} style={styles.cardImage} />
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{dateBadge}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{eventTitle}</Text>

          <View style={styles.infoRow}>
            <Calendar size={RFValue(12)} color={Colors.primary} />
            <Text style={styles.infoText}>{eventDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={RFValue(12)} color={Colors.primary} />
            <Text style={styles.infoText}>{eventTime}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={RFValue(12)} color={Colors.primary} />
            <Text style={styles.infoText} numberOfLines={1}>{eventAddress}</Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>{eventDescription}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <CommonHeader title={t('events.upcomingEvents')} onBackPress={() => navigation.goBack()} />

      <FlatList
        data={events}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={renderEventCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default UpcomingEventsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    paddingHorizontal: wp('3%'),
    paddingTop: wp('2%'),
    paddingBottom: hp('5%'),
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  cardImage: {
    width: '100%',
    height: hp('22%'),
    resizeMode: 'cover',
  },
  dateBadge: {
    position: 'absolute',
    top: wp('4%'),
    right: wp('4%'),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
    elevation: 2,
  },
  dateBadgeText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: RFValue(11),
  },
  cardContent: {
    paddingHorizontal: wp('4%'),
    paddingVertical: wp('1%'),
  },
  cardTitle: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: hp('1%'),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  infoText: {
    fontSize: RFValue(10.5),
    color: Colors.gray,
    marginLeft: wp('2.5%'),
    fontWeight: '600',
  },
  description: {
    fontSize: RFValue(10.5),
    color: Colors.gray,
    marginTop: hp('1%'),
    marginBottom: hp('1%'),
    lineHeight: RFValue(16),
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: hp('1.8%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  registerBtnText: {
    color: Colors.white,
    fontSize: RFValue(14),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
