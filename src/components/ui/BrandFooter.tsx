import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Heart } from 'lucide-react-native';
import Logo from './Logo';
import { scale, spacing } from '../../theme';

interface BrandFooterProps {
  /** Large closing text; use \n for the line break, e.g. "Every industry,\none place". */
  title: string;
  /** Show the coral heart after the last line. */
  showHeart?: boolean;
}

/**
 * Closing section for the bottom of a screen: a big soft tagline in two lines
 * with a heart after it, a divider and the Axnol logo. Pass the tagline that
 * fits the screen.
 */
export const BrandFooter: React.FC<BrandFooterProps> = ({
  title,
  showHeart = true,
}) => {
  const lines = title.split('\n');

  return (
    <View style={styles.wrap}>
      {lines.map((line, index) => {
        const isLast = index === lines.length - 1;
        return (
          <View key={`${line}-${index}`} style={styles.line}>
            <Text style={styles.title}>{line}</Text>
            {isLast && showHeart ? (
              <Heart
                size={scale(32)}
                color="#FF6F61"
                fill="#FF6F61"
                style={styles.heart}
              />
            ) : null}
          </View>
        );
      })}

      <LinearGradient
        colors={['#D3DAD7', 'rgba(211,218,215,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.divider}
      />

      <View style={styles.logoRow}>
        <Logo showEmblem={false} height={scale(42)} style={styles.logo} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: scale(44),
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: scale(36),
    lineHeight: scale(40),
    fontWeight: '800',
    color: '#D3D8DE',
    letterSpacing: -1,
  },
  heart: {
    marginLeft: scale(10),
  },
  divider: {
    height: 1.5,
    marginTop: scale(18),
    marginBottom: scale(14),
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    opacity: 0.5,
  },
});

export default BrandFooter;
