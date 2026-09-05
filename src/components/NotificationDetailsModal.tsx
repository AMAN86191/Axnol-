import React, { useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { BellRing, Calendar, Clock, FileText, X, ArrowRight, CalendarDays } from 'lucide-react-native';

export interface NotificationDetailData {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  payload?: {
    event_id?: string | number;
    screen?: string;
    event_date?: string;
    event_time?: string;
    [key: string]: any;
  };
}

interface NotificationDetailsModalProps {
  visible: boolean;
  data: NotificationDetailData | null;
  onClose: () => void;
}

const COLORS = {
  primaryOrange: '#FF6B35',
  darkNavy: '#111827',
  secondaryText: '#6B7280',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
  white: '#FFFFFF',
};

const formatEventDate = (payload: any, fallback: string) => {
  const raw = payload?.event_date || payload?.date || '';
  if (raw) {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  }
  if (fallback) {
    const date = new Date(fallback);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  }
  return '';
};

const formatEventTime = (payload: any, fallback: string) => {
  const raw = payload?.event_time || payload?.time || '';
  if (raw) {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    const parts = raw.split(':');
    if (parts.length >= 2) {
      let hour = parseInt(parts[0], 10);
      const minute = parts[1];
      if (!isNaN(hour) && minute !== undefined) {
        const suffix = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minute} ${suffix}`;
      }
    }
  }
  if (fallback) {
    const date = new Date(fallback);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  }
  return '';
};

const formatMetaTimestamp = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return diffDay === 1 ? 'Yesterday' : `${diffDay}d ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDetailsBody = (description: string) => {
  let text = description || '';
  let pre = text;
  let highlight = '';
  let post = '';

  const atPos = text.indexOf(' at ');
  const onPos = text.lastIndexOf(' on ');

  if (atPos >= 0 && onPos > atPos) {
    pre = text.slice(0, atPos + 4);
    highlight = text.slice(atPos + 4, onPos);
    post = text.slice(onPos);
  } else if (atPos >= 0) {
    pre = text.slice(0, atPos + 4);
    highlight = text.slice(atPos + 4);
  }

  let joinText = '';
  if (post.includes('Join us!')) {
    post = post.replace('Join us!', '').trim();
    joinText = 'Join us!';
  } else if (highlight.includes('Join us!')) {
    highlight = highlight.replace('Join us!', '').trim();
    joinText = 'Join us!';
  } else if (pre.includes('Join us!')) {
    pre = pre.replace('Join us!', '').trim();
    joinText = 'Join us!';
  }

  return { pre, highlight, post, joinText };
};

export const NotificationDetailsModal = React.memo(
  ({ visible, data, onClose }: NotificationDetailsModalProps) => {
    const eventDate = useMemo(() => formatEventDate(data?.payload, data?.time || ''), [data]);
    const eventTime = useMemo(() => formatEventTime(data?.payload, data?.time || ''), [data]);
    const metaTimestamp = useMemo(() => formatMetaTimestamp(data?.time || ''), [data]);

    const details = useMemo(() => formatDetailsBody(data?.description || ''), [data]);

    const title = data?.title || 'Notification';

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.overlay}>
          <TouchableOpacity style={styles.backdropDismiss} onPress={onClose} activeOpacity={1} />

          <View style={styles.modalContainer}>
            {/* Top Right Blob */}
            <View style={styles.topRightBlob} />
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <View style={styles.bellBadge}>
                  <BellRing size={RFValue(20)} color={COLORS.white} strokeWidth={2.2} />
                </View>

                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>Notification Details</Text>
                  <Text style={styles.headerSubtitle}>Stay updated with the latest information</Text>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={RFValue(18)} color={COLORS.darkNavy} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Event section */}
              <View style={styles.eventBadgePill}>
                <Text style={styles.eventBadgeText}>Upcoming Event</Text>
              </View>

              <Text style={styles.eventTitle}>{title}</Text>

              {/* Date & Time card */}
              <View style={styles.dateTimeCard}>
                <View style={styles.dateTimeCol}>
                  <View style={styles.dateTimeIconWrap}>
                    <Calendar size={RFValue(16)} color={COLORS.primaryOrange} strokeWidth={2} />
                  </View>
                  <Text style={styles.dateTimeLabel}>Event Date</Text>
                  <Text style={styles.dateTimeValue} numberOfLines={1}>
                    {eventDate || '—'}
                  </Text>
                </View>

                <View style={styles.dateTimeDivider} />

                <View style={styles.dateTimeCol}>
                  <View style={styles.dateTimeIconWrap}>
                    <Clock size={RFValue(16)} color={COLORS.primaryOrange} strokeWidth={2} />
                  </View>
                  <Text style={styles.dateTimeLabel}>Time</Text>
                  <Text style={styles.dateTimeValue} numberOfLines={1}>
                    {eventTime || '—'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Details section */}
              <View style={styles.detailsSection}>
                <View style={styles.detailsHeaderRow}>
                  <View style={styles.detailsIconWrap}>
                    <FileText size={RFValue(14)} color={'#6B7280'} strokeWidth={2} />
                  </View>
                  <Text style={styles.detailsHeading}>Details</Text>
                </View>
                <Text style={styles.detailsBody}>
                  {details.pre}
                  {details.highlight ? (
                    <Text style={styles.detailsHighlight}>{details.highlight}</Text>
                  ) : null}
                  {details.post}
                </Text>
                {details.joinText ? (
                  <Text style={styles.joinText}>
                    {details.joinText} <Text style={styles.detailsEmoji}>🎉</Text>
                  </Text>
                ) : null}

                {/* Calendar Graphic on the right */}
                <View style={styles.graphicContainer}>
                  <View style={styles.graphicBlob} />
                  <View style={styles.graphicCalendarBox}>
                    <CalendarDays size={RFValue(32)} color={COLORS.primaryOrange} strokeWidth={1.5} />
                  </View>
                  {/* Decorative sprinkles */}
                  <View style={[styles.sprinkle, styles.sprinkle1]} />
                  <View style={[styles.sprinkle, styles.sprinkle2]} />
                  <View style={[styles.sprinkle, styles.sprinkle3]} />
                </View>
              </View>

              {metaTimestamp ? (
                <Text style={styles.metaTimestamp}>{metaTimestamp}</Text>
              ) : null}
            </ScrollView>

            {/* CTA */}
            <View style={styles.ctaContainer}>
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaText}>Got it</Text>
                <ArrowRight size={RFValue(18)} color={COLORS.white} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: wp('5%'),
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: wp('7.5%'),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    paddingHorizontal: wp('5.5%'),
    paddingTop: hp('2.4%'),
    paddingBottom: hp('1.6%'),
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  topRightBlob: {
    position: 'absolute',
    top: -wp('15%'),
    right: -wp('10%'),
    width: wp('45%'),
    height: wp('45%'),
    borderRadius: wp('22.5%'),
    backgroundColor: '#FFF5F0',
    zIndex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellBadge: {
    width: wp('12.5%'),
    height: wp('12.5%'),
    borderRadius: wp('3.5%'),
    backgroundColor: COLORS.primaryOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3.5%'),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primaryOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerText: {
    flex: 1,
    marginRight: wp('2%'),
  },
  headerTitle: {
    fontSize: RFValue(10.5),
    fontWeight: '800',
    color: COLORS.darkNavy,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: RFValue(7),
    color: COLORS.secondaryText,
    marginTop: hp('0.3%'),
  },
  closeBtn: {
    width: wp('8.5%'),
    height: wp('8.5%'),
    borderRadius: wp('4.25%'),
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: wp('5.5%'),
    paddingTop: hp('2.2%'),
    paddingBottom: hp('1.6%'),
  },
  eventBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1E9',
    borderRadius: wp('1.5%'),
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
  },
  eventBadgeText: {
    fontSize: RFValue(6.65),
    fontWeight: '700',
    color: COLORS.primaryOrange,
    letterSpacing: 0.3,
  },
  eventTitle: {
    fontSize: RFValue(14),
    fontWeight: '800',
    color: COLORS.darkNavy,
    marginTop: hp('1.2%'),
    lineHeight: hp('2.9%'),
    letterSpacing: -0.4,
  },
  dateTimeCard: {
    flexDirection: 'row',
    backgroundColor: '#FBFCFE',
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('2.5%'),
    marginTop: hp('2%'),
    minHeight: hp('8.5%'),
  },
  dateTimeCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('1%'),
  },
  dateTimeIconWrap: {
    marginBottom: hp('0.6%'),
  },
  dateTimeLabel: {
    fontSize: RFValue(6.3),
    color: COLORS.secondaryText,
    fontWeight: '600',
    marginBottom: hp('0.3%'),
  },
  dateTimeValue: {
    fontSize: RFValue(9.1),
    color: COLORS.darkNavy,
    fontWeight: '700',
    textAlign: 'center',
  },
  dateTimeDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: COLORS.border,
    marginHorizontal: wp('2%'),
    marginVertical: hp('0.5%'),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginVertical: hp('2.2%'),
  },
  detailsSection: {
    position: 'relative',
    paddingRight: wp('22%'),
    minHeight: hp('12%'),
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsIconWrap: {
    width: wp('6%'),
    height: wp('6%'),
    borderRadius: wp('3%'),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2%'),
  },
  detailsHeading: {
    fontSize: RFValue(9.1),
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  detailsBody: {
    fontSize: RFValue(10),
    color: COLORS.secondaryText,
    lineHeight: hp('2%'),
    marginTop: hp('1.2%'),
    width: '90%',
  },
  detailsHighlight: {
    color: COLORS.darkNavy,
    fontWeight: '800',
  },
  joinText: {
    fontSize: RFValue(9),
    color: COLORS.secondaryText,
    lineHeight: hp('2.4%'),
    marginTop: hp('1%'),
  },
  detailsEmoji: {
    fontWeight: '400',
  },
  graphicContainer: {
    position: 'absolute',
    right: -wp('2%'),
    bottom: -hp('1%'),
    width: wp('25%'),
    height: wp('25%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  graphicBlob: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: wp('12.5%'),
    backgroundColor: '#FFF5F0',
  },
  graphicCalendarBox: {
    width: wp('14%'),
    height: wp('14%'),
    backgroundColor: COLORS.white,
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  sprinkle: {
    position: 'absolute',
    backgroundColor: COLORS.primaryOrange,
    borderRadius: 2,
  },
  sprinkle1: {
    width: 6,
    height: 3,
    top: '20%',
    left: '10%',
    transform: [{ rotate: '-45deg' }],
  },
  sprinkle2: {
    width: 3,
    height: 6,
    bottom: '20%',
    left: '5%',
    transform: [{ rotate: '45deg' }],
  },
  sprinkle3: {
    width: 4,
    height: 4,
    bottom: '30%',
    right: '15%',
    borderRadius: 2,
  },
  metaTimestamp: {
    fontSize: RFValue(6.3),
    color: '#9CA3AF',
    marginTop: hp('1.6%'),
    textAlign: 'right',
  },
  ctaContainer: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('1%'),
    paddingBottom: hp('2%'),
    backgroundColor: COLORS.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryOrange,
    height: hp('4%'),
    minHeight: 54,
    borderRadius: wp('3.2%'),
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primaryOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  ctaText: {
    color: COLORS.white,
    fontSize: RFValue(10.5),
    fontWeight: '700',
    marginRight: wp('1%'),
    letterSpacing: 0.2,
  },
});
