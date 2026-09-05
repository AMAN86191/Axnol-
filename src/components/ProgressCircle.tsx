import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';

interface ProgressCircleProps {
  percent: number;
}

export const ProgressCircle = React.memo(({ percent }: ProgressCircleProps) => {
  const { t } = useTranslation();
  const size = wp('14%');
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={styles.progressCircleWrapper}>
      <Svg height={size} width={size}>
        {/* Background circle */}
        <Circle
          stroke="#F3F4F6"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <Circle
          stroke="#FF6F34"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercentText}>{percent}%</Text>
        <Text style={styles.progressSubtext}>{t('campaign.goal')}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  progressCircleWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentText: {
    fontSize: RFValue(9),
    fontWeight: '800',
    color: '#1F2937',
  },
  progressSubtext: {
    fontSize: RFValue(6.2),
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: -hp('0.2%'),
  },
});
