import React from 'react';
import {Image, ImageProps, StyleProp, View, ImageStyle} from 'react-native';
import {resolveImage} from '../../assets/images';
import {colors} from '../../theme';

interface AppImageProps extends Omit<ImageProps, 'source'> {
  /** Local image key (see src/assets/images.ts) or remote http(s) url */
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
}

export const AppImage: React.FC<AppImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  ...rest
}) => {
  const source = uri?.startsWith('http') ? {uri} : resolveImage(uri);
  if (!source) {
    return <View style={[style, styles.fallback]} />;
  }
  return <Image {...rest} source={source} style={style} resizeMode={resizeMode} />;
};

const styles = {
  fallback: {backgroundColor: colors.primaryLight},
};

export default AppImage;
