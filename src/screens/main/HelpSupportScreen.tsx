import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
} from 'lucide-react-native';

import { Colors } from '../../theme/colors';
import { CommonHeader } from '../../components/CommonHeader';
import { RootStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'HelpSupportScreen'>;

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpSupportScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

  const FAQ_DATA: FAQItem[] = [
    {
      id: '1',
      category: 'donation',
      question: t('help.faq1Question'),
      answer: t('help.faq1Answer'),
    },
    {
      id: '2',
      category: 'membership',
      question: t('help.faq2Question'),
      answer: t('help.faq2Answer'),
    },
    {
      id: '3',
      category: 'visit',
      question: t('help.faq3Question'),
      answer: t('help.faq3Answer'),
    },
    {
      id: '4',
      category: 'general',
      question: t('help.faq4Question'),
      answer: t('help.faq4Answer'),
    },
  ];

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Filtered FAQs
  const filteredFaqs = FAQ_DATA.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleCall = () => {
    Linking.openURL('tel:+919911157953').catch(() => {
      Alert.alert(t('common.error'), t('help.callError'));
    });
  };

  const handleEmail = () => {
    Linking.openURL('mailto:gaumatatrust2023@gmail.com?subject=Support Request').catch(() => {
      Alert.alert(t('common.error'), t('help.emailError'));
    });
  };

  const handleOpenMap = () => {
    const address = t('help.fullAddress');
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert(t('common.error'), t('help.mapError'));
      });
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <CommonHeader title={t('help.title')} onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Quick Connect Actions */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('help.quickConnect')}</Text>
            <View style={styles.gridContainer}>
              {/* Call Support */}
              <TouchableOpacity style={styles.connectCard} onPress={handleCall} activeOpacity={0.8}>
                <View style={[styles.iconBox, { backgroundColor: '#FFEBE0' }]}>
                  <Phone size={RFValue(12)} color={Colors.primary} />
                </View>
                <Text style={styles.connectCardTitle}>{t('help.callUs')}</Text>
                <Text style={styles.connectCardSubtitle}>{t('help.phone')}</Text>
              </TouchableOpacity>

              {/* Email Support */}
              <TouchableOpacity style={styles.connectCard} onPress={handleEmail} activeOpacity={0.8}>
                <View style={[styles.iconBox, { backgroundColor: '#E2F7E9' }]}>
                  <Mail size={RFValue(12)} color="#27AE60" />
                </View>
                <Text style={styles.connectCardTitle}>{t('help.emailSupport')}</Text>
                <Text style={styles.connectCardSubtitle}>{t('help.email')}</Text>
              </TouchableOpacity>
            </View>

            {/* Address Row */}
            <TouchableOpacity style={styles.addressRow} onPress={handleOpenMap} activeOpacity={0.8}>
              <View style={[styles.iconBox, { backgroundColor: '#F3E8F9' }]}>
                <MapPin size={RFValue(12)} color="#8E44AD" />
              </View>
              <View style={styles.addressTextContainer}>
                <Text style={styles.connectCardTitle}>{t('help.visitOffice')}</Text>
                <Text style={styles.connectCardSubtitle}>{t('help.officeAddress')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Search FAQ bar */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('help.faqs')}</Text>
            <View style={styles.searchBarWrapper}>
              <Search size={RFValue(11)} color={Colors.gray} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('help.searchFaqs')}
                placeholderTextColor={Colors.lightGray}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Accordion FAQ list */}
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map(faq => {
                const isExpanded = expandedFaq === faq.id;
                return (
                  <View key={faq.id} style={styles.faqCard}>
                    <TouchableOpacity
                      style={styles.faqHeader}
                      onPress={() => toggleFaq(faq.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                      {isExpanded ? (
                        <ChevronUp size={RFValue(11)} color={Colors.gray} />
                      ) : (
                        <ChevronDown size={RFValue(11)} color={Colors.gray} />
                      )}
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.faqAnswerContainer}>
                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <HelpCircle size={RFValue(14)} color={Colors.lightGray} />
                <Text style={styles.emptyText}>{t('help.noFaqs')}</Text>
              </View>
            )}
          </View>

          {/* Raise a Support Ticket */}
          {/* <View style={[styles.sectionContainer, styles.ticketContainer]}>
            <View style={styles.ticketHeaderRow}>
              <MessageSquare size={RFValue(11)} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: wp('1.5%') }]}>
                Raise a Support Ticket
              </Text>
            </View>

            <Text style={styles.label}>Select Department</Text>
            <View style={styles.categorySelectorRow}>
              {(['general', 'donation', 'membership'] as const).map(cat => {
                const isActive = ticketCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryBadge,
                      isActive && styles.categoryBadgeActive,
                    ]}
                    onPress={() => setTicketCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        isActive && styles.categoryBadgeTextActive,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Your Message</Text>
            <View style={styles.messageInputContainer}>
              <TextInput
                style={styles.messageInput}
                placeholder="Explain your issue or question in detail..."
                placeholderTextColor={Colors.lightGray}
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmitTicket}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Text>
              {!submitting && <Send size={RFValue(10)} color={Colors.white} style={{ marginLeft: wp('1.5%') }} />}
            </TouchableOpacity>
          </View>

    
          <View style={styles.footerDetails}>
            <ShieldAlert size={RFValue(10)} color={Colors.gray} />
            <Text style={styles.footerText}>
              Typically replies within 24 hours. Working hours: 9 AM - 6 PM (IST)
            </Text>
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: wp('3%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('4%'),
  },
  sectionContainer: {
    marginBottom: hp('2%'),
  },
  sectionTitle: {
    fontSize: RFValue(10.5),
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: hp('1%'),
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  connectCard: {
    width: '48.5%',
    backgroundColor: Colors.white,
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: wp('2.5%'),
    alignItems: 'flex-start',
  },
  iconBox: {
    width: wp('7%'),
    height: wp('7%'),
    borderRadius: wp('1.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('0.8%'),
  },
  connectCardTitle: {
    fontSize: RFValue(9.5),
    fontWeight: '700',
    color: Colors.dark,
  },
  connectCardSubtitle: {
    fontSize: RFValue(8.5),
    color: Colors.gray,
    marginTop: hp('0.2%'),
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: wp('2.5%'),
    marginTop: hp('1%'),
  },
  addressTextContainer: {
    marginLeft: wp('2.5%'),
    flex: 1,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: wp('2%'),
    paddingHorizontal: wp('2.5%'),
    height: hp('4.5%'),
    marginBottom: hp('1%'),
  },
  searchIcon: {
    marginRight: wp('1.5%'),
  },
  searchInput: {
    flex: 1,
    fontSize: RFValue(9),
    color: Colors.dark,
    padding: 0,
  },
  faqCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: wp('2%'),
    marginBottom: hp('0.8%'),
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('3%'),
  },
  faqQuestion: {
    fontSize: RFValue(9),
    fontWeight: '600',
    color: Colors.dark,
    flex: 1,
    paddingRight: wp('2%'),
  },
  faqAnswerContainer: {
    paddingHorizontal: wp('3%'),
    paddingBottom: wp('3%'),
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: hp('0.8%'),
  },
  faqAnswer: {
    fontSize: RFValue(8.5),
    color: Colors.gray,
    lineHeight: hp('1.8%'),
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: hp('2%'),
  },
  emptyText: {
    fontSize: RFValue(8.5),
    color: Colors.gray,
    marginTop: hp('0.5%'),
  },
  ticketContainer: {
    backgroundColor: Colors.white,
    borderRadius: wp('2%'),
    borderWidth: 1,
    borderColor: '#EAEAEA',
    padding: wp('3%'),
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1.2%'),
  },
  label: {
    fontSize: RFValue(8.5),
    fontWeight: '700',
    color: '#555',
    marginBottom: hp('0.6%'),
  },
  categorySelectorRow: {
    flexDirection: 'row',
    marginBottom: hp('1.2%'),
  },
  categoryBadge: {
    backgroundColor: '#F5F5F5',
    paddingVertical: hp('0.6%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('1.5%'),
    marginRight: wp('1.5%'),
  },
  categoryBadgeActive: {
    backgroundColor: '#FFF2EB',
    borderWidth: 0.5,
    borderColor: Colors.primary,
  },
  categoryBadgeText: {
    fontSize: RFValue(8.5),
    fontWeight: '600',
    color: Colors.gray,
  },
  categoryBadgeTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  messageInputContainer: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    backgroundColor: '#FAFAFA',
    borderRadius: wp('1.8%'),
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.8%'),
    marginBottom: hp('1.5%'),
  },
  messageInput: {
    fontSize: RFValue(9),
    color: Colors.dark,
    padding: 0,
    height: hp('8%'),
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: hp('4.5%'),
    borderRadius: wp('1.8%'),
  },
  submitButtonDisabled: {
    backgroundColor: Colors.lightGray,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: RFValue(9.5),
    fontWeight: '700',
  },
  footerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp('1%'),
  },
  footerText: {
    fontSize: RFValue(8),
    color: Colors.gray,
    marginLeft: wp('1%'),
  },
});
