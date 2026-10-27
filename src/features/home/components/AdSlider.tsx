import React, {useState} from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {radius, scale} from '../../../theme';

interface AdSliderProps {
  height?: number;
  onPressItem?: (...args: any[]) => void;
}

export const AdSlider: React.FC<AdSliderProps> = ({
  height = scale(165),
}) => {
  const navigation = useNavigation<any>();
  const [width, setWidth] = useState(0);

  return (
    <View
      style={[styles.container, {height}]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      <TouchableOpacity
        style={[styles.slide, {width: width || '100%', height}]}
        activeOpacity={0.92}
        onPress={() => {
          navigation.navigate('Products', {
            screen: 'Categories',
            params: {},
            initial: false,
          });
        }}>
        <Image
          source={require('../../../../assets/axnol/banner_category_1.webp')}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#E8F2FA',
    shadowColor: '#0A3B74',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  slide: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default AdSlider;
