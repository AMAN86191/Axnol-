import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';

export const QuoteCard = React.memo(() => {
  const { t } = useTranslation();

  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteIcon}>“</Text>
      <Text style={styles.quoteText}>
        {t('quote.sanskrit')} | {t('quote.english')}
      </Text>
      <Text style={styles.quoteAuthor}>{t('quote.author')}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  quoteCard: {
    backgroundColor: '#FFFBF9',
    borderRadius: wp('4%'),
    paddingHorizontal: wp('4.5%'),
    paddingVertical: hp('1.8%'),
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    borderLeftWidth: 3,
    borderLeftColor: '#FF6F34',
    position: 'relative',
  },
  quoteIcon: {
    fontSize: RFValue(28),
    color: 'rgba(255, 111, 52, 0.1)',
    position: 'absolute',
    top: hp('0.5%'),
    left: wp('3%'),
    fontWeight: '900',
  },
  quoteText: {
    fontSize: RFValue(9.5),
    color: '#4B5563',
    lineHeight: hp('1.8%'),
    fontStyle: 'italic',
    fontWeight: '500',
    paddingLeft: wp('1.5%'),
  },
  quoteAuthor: {
    fontSize: RFValue(8.5),
    color: '#9CA3AF',
    fontWeight: '700',
    textAlign: 'right',
    marginTop: hp('0.6%'),
  },
});
