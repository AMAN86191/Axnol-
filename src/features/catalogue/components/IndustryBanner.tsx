import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Download } from 'lucide-react-native';
import AppImage from '../../../components/ui/AppImage';
import { colors, radius, scale, spacing } from '../../../theme';

const BROCHURE_URL = 'https://axnol.tambimotors.com/about';

interface IndustryBannerProps {
  title: string;
  description?: string;
  image: string;
  tags?: string[];
  downloadLabel?: string;
  onDownload?: () => void;
  /** Banner height; defaults to the full-size banner. */
  height?: number;
  /** Small accent line above the title. */
  showAccentLine?: boolean;
  /** Which side the brochure button sits on. */
  buttonAlign?: 'left' | 'right';
}

export const IndustryBanner: React.FC<IndustryBannerProps> = ({
  title,
  description,
  image,
  tags = [],
  downloadLabel = 'Download Brochure',
  onDownload,
  height = scale(228),
  showAccentLine = true,
  buttonAlign = 'right',
}) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    Linking.openURL(BROCHURE_URL).catch(() => {});
  };

  return (
    <View style={[styles.hero, { height }]}>
      <AppImage uri={image} style={styles.image} resizeMode="cover" />

      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(4,16,30,0.04)',
          'rgba(4,16,30,0.32)',
          'rgba(4,16,30,0.9)',
        ]}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {showAccentLine ? <View style={styles.accentLine} /> : null}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={3}>
            {description}
          </Text>
        ) : null}

        <View
          style={[styles.footer, buttonAlign === 'left' && styles.footerLeft]}
        >
          {tags.length > 0 ? (
            <View style={styles.tagRow}>
              {tags.slice(0, 3).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.downloadBtn}
            activeOpacity={0.85}
            onPress={handleDownload}
          >
            <Download
              size={scale(12)}
              color={colors.primary}
              strokeWidth={2.6}
            />
            <Text style={styles.downloadText} numberOfLines={1}>
              {downloadLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hero: {
    height: scale(228),
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#0B2A46',
    shadowColor: '#0A3B74',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topRow: {
    position: 'absolute',
    top: scale(12),
    left: scale(12),
    right: scale(12),
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    paddingHorizontal: scale(9),
    paddingVertical: scale(4),
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  badgeDot: {
    width: scale(5),
    height: scale(5),
    borderRadius: scale(3),
    backgroundColor: '#7DD3FC',
  },
  badgeText: {
    fontSize: scale(8.5),
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#FFFFFF',
  },
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: scale(13),
  },
  accentLine: {
    width: scale(28),
    height: scale(3),
    borderRadius: scale(2),
    backgroundColor: '#38BDF8',
    marginBottom: scale(7),
  },
  title: {
    fontSize: scale(19),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    lineHeight: scale(24),
  },
  description: {
    fontSize: scale(11),
    lineHeight: scale(15.5),
    color: 'rgba(255,255,255,0.82)',
    marginTop: scale(4),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(8),
    marginTop: scale(10),
  },
  footerLeft: {
    justifyContent: 'flex-start',
    marginTop: scale(14),
  },
  tagRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(5),
  },
  tag: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  tagText: {
    fontSize: scale(8.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    height: scale(32),
    paddingHorizontal: scale(11),
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
  },
  downloadText: {
    fontSize: scale(9.5),
    fontWeight: '800',
    color: colors.primary,
  },
});

export default IndustryBanner;
