import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Heart, Sparkles } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';

interface WelcomeNewUserCardProps {
  onDonatePress: () => void;
}

export const WelcomeNewUserCard = React.memo(({ onDonatePress }: WelcomeNewUserCardProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Sparkles size={RFValue(14)} color="#FF6F34" />
          <Text style={styles.title}>{t('welcome.title')}</Text>
        </View>
        <Text style={styles.description}>
          {t('welcome.subtitle')}
        </Text>
        <TouchableOpacity style={styles.button} onPress={onDonatePress} activeOpacity={0.8}>
          <Heart size={RFValue(12)} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{t('welcome.makeFirstDonation')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    backgroundColor: '#FFF8F2',
    borderRadius: wp('4%'),
    borderWidth: 1,
    borderColor: '#FFEBE0',
    overflow: 'hidden',
  },
  content: {
    padding: wp('4%'),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  title: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: '#FF6F34',
    marginLeft: wp('1.5%'),
  },
  description: {
    fontSize: RFValue(9.5),
    color: '#4B5563',
    lineHeight: hp('1.8%'),
    marginBottom: hp('2%'),
  },
  button: {
    backgroundColor: '#FF6F34',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.2%'),
    borderRadius: wp('2%'),
    alignSelf: 'flex-start',
    paddingHorizontal: wp('4%'),
  },
  buttonIcon: {
    marginRight: wp('1.5%'),
  },
  buttonText: {
    color: '#FFF',
    fontSize: RFValue(10.5),
    fontWeight: '700',
  },
});
