import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { HeartHandshake, Award, ShieldCheck, MessageSquare } from 'lucide-react-native';

import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';

interface AlertItem {
  id: string;
  type: 'donation' | 'event' | 'social' | 'system';
  icon: any;
  iconColor: string;
  bgTint: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

const INITIAL_ALERTS_DATA: AlertItem[] = [
  {
    id: '1',
    type: 'donation',
    icon: HeartHandshake,
    iconColor: Colors.primary,
    bgTint: '#FFF2EB',
    title: 'Donation Received',
    message: 'Amit Roy contributed ₹2,500 for the Biogas project.',
    time: '10 mins ago',
    unread: true,
  },
  {
    id: '2',
    type: 'event',
    icon: Award,
    iconColor: '#3498db',
    bgTint: '#EAF2F8',
    title: 'Upcoming Event',
    message: 'Gopashtami Festival is scheduled for tomorrow at 8:00 AM.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: '3',
    type: 'social',
    icon: MessageSquare,
    iconColor: '#2ecc71',
    bgTint: '#E8F8F5',
    title: 'New Comment',
    message: 'Rahul Sharma commented: "Great progress, Jai Sri Krishna!"',
    time: '5 hours ago',
    unread: false,
  },
  {
    id: '4',
    type: 'system',
    icon: ShieldCheck,
    iconColor: '#e67e22',
    bgTint: '#FDEDEC',
    title: 'Health Report Updated',
    message: 'Vet updated medical records for Nandi: "Healthy and growing."',
    time: '1 day ago',
    unread: false,
  },
  {
    id: '5',
    type: 'donation',
    icon: HeartHandshake,
    iconColor: Colors.primary,
    bgTint: '#FFF2EB',
    title: 'Monthly Goal Reached',
    message: 'Daily grass contribution goal achieved 100% for this month.',
    time: '2 days ago',
    unread: false,
  }
];

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS_DATA);

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, unread: false })));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <CommonHeader
        title="Notifications"
        rightElement={
          alerts.some(a => a.unread) ? (
            <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
              <Text style={styles.markReadText}>Mark Read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {alerts.map(item => {
          const IconComponent = item.icon;
          return (
            <View
              key={item.id}
              style={[
                styles.alertCard,
                item.unread && styles.unreadCard
              ]}
            >
              {/* Icon Container */}
              <View style={[styles.iconWrapper, { backgroundColor: item.bgTint }]}>
                <IconComponent size={20} color={item.iconColor} strokeWidth={2} />
              </View>

              {/* Message Details */}
              <View style={styles.textContainer}>
                <View style={styles.alertHeaderRow}>
                  <Text style={styles.alertTitle}>{item.title}</Text>
                  <Text style={styles.alertTime}>{item.time}</Text>
                </View>
                <Text style={styles.alertMessage}>{item.message}</Text>
              </View>

              {/* Unread indicator dot */}
              {item.unread && <View style={styles.unreadDot} />}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    paddingHorizontal: wp('2%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('12%'), // Space for custom bottom tab
  },
  markReadText: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: Colors.primary,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: wp('3%'),
    borderWidth: 1,
    borderColor: Colors.border,
    padding: wp('3%'),
    marginBottom: hp('1.5%'),
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  unreadCard: {
    borderColor: '#FFD3BE', // Tint of orange border for unread alerts
    backgroundColor: '#FFFBF9', // Soft orange/warm tint for unread state
  },
  iconWrapper: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('5.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3.5%'),
  },
  textContainer: {
    flex: 1,
    paddingRight: wp('2%'),
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('0.4%'),
  },
  alertTitle: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: Colors.dark,
  },
  alertTime: {
    fontSize: RFValue(9),
    color: Colors.gray,
  },
  alertMessage: {
    fontSize: RFValue(10),
    color: '#555',
    lineHeight: hp('2%'),
  },
  unreadDot: {
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    backgroundColor: Colors.primary,
    position: 'absolute',
    right: wp('3%'),
    top: hp('1.2%'),
  },
});

export default AlertsScreen;
