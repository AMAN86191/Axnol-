import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Download, Award, ShieldCheck, Calendar, User, Hash, Check, Share2 } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useTranslation } from 'react-i18next';
import Share from 'react-native-share';
import { generateAndDownloadPDF, generatePdfFile } from '../utils/pdfGenerator';
import { Colors } from '../theme/colors';

interface MembershipCertificateCardProps {
  memberDetails: {
    name: string;
    memberId: string;
    tier: string;
    joinedDate: string;
    endDate: string;
    status: string;
    verified: string;
    impact: string;
  };
  onShare?: () => void;
}

const loadLogoDataUri = async (): Promise<string> => {
  const logoSource = Image.resolveAssetSource(require('../../assets/images/logo/logo.png'));
  try {
    const uri = logoSource.uri;
    if (uri.startsWith('file://')) {
      const logoBase64 = await ReactNativeBlobUtil.fs.readFile(uri.replace('file://', ''), 'base64');
      return `data:image/png;base64,${logoBase64}`;
    }
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      const res = await fetch(uri);
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.log('Error loading logo for PDF:', error);
  }
  return '';
};

export const MembershipCertificateCard = ({ memberDetails, onShare }: MembershipCertificateCardProps) => {
  const { t } = useTranslation();
  const [sharing, setSharing] = useState(false);
  const buildCertificateHtml = async () => {
    const logoDataUri = await loadLogoDataUri();
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8" />
          <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            @page { size: letter portrait; margin: 0; }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              width: 100vw;
              background-color: #ffffff;
              font-family: 'Montserrat', sans-serif;
            }
            .certificate-outer {
              width: 700px;
              height: 800px;
              padding: 40px;
              background-color: #faf7f2;
              border: 16px solid #ffffff;
              box-shadow: inset 0 0 0 2px #eae0d5;
              box-sizing: border-box;
              position: relative;
            }
            .certificate-inner-border {
              border: 2px solid #e0d5c1;
              padding: 30px;
              height: 100%;
              width: 100%;
              box-sizing: border-box;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              align-items: center;
              position: relative;
            }
            .cert-logo { width: 80px; height: 80px; }
            .cert-header { text-align: center; width: 100%; }
            .trust-name { font-size: 28px; color: #5c4033; letter-spacing: 1px; margin-bottom: 8px; text-transform: uppercase; }
            .cert-subheader { font-size: 15px; font-weight: 700; color: #ff6c3c; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 27px; }
            .presented-text { font-size: 16px; font-style: italic; color: #6b7280; margin-bottom: 17px; }
            .member-name { font-size: 34px; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; width: 80%; margin: 0 auto 20px auto; min-width: 300px; }
            .description { font-size: 15px; line-height: 1.8; color: #475569; padding: 0 20px; margin-bottom: 10px; text-align: center; }
            .meta-container { display: flex; justify-content: space-around; width: 100%; text-align: center; font-size: 11px; margin-bottom: 24px; }
            .meta-column { width: 50%; }
            .meta-label { display: block; text-transform: uppercase; color: #94a3b8;font-weight: bold; font-size: 11px; letter-spacing: 0.5px; margin-bottom: 4px; }
            .meta-value { font-weight: 700; color: #1e293b; font-size: 14px; }
            .meta-value-mono { font-family: monospace; }
            .cert-footer { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0 16px; padding-top: 8px; position: relative; box-sizing: border-box; }
            .signature-col { width: 35%; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 10px; }
            .handwritten { font-family: 'Great Vibes', cursive; font-size: 26px; color: #1e293b; display: block; line-height: 1; margin-bottom: 5px; }
            .sig-title { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
            .seal-column { width: 20%; display: flex; align-items: center; justify-content: center; }
            .seal-circle { width: 65px; height: 65px; background-color: #ff6c3c; border-radius: 50%; border: 3px double #ffffff; display: flex; align-items: center; justify-content: center; }
          </style>
        </head>
        <body>
          <div class="certificate-outer">
            <div class="certificate-inner-border">

              <div class="cert-header">
                <div style="margin-bottom: 12px;">
                  ${logoDataUri
        ? `<img class="cert-logo" src="${logoDataUri}" alt="logo" />`
        : `<svg class="cert-logo" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ff6c3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="8" r="6"></circle>
                            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                          </svg>`}
                </div>
                <h2 class="trust-name">${t('certificate.trustName')}</h2>
                <h4 class="cert-subheader">${t('certificate.certificateOf', { tier: memberDetails.tier })}</h4>
                <p class="presented-text">${t('certificate.presentedTo')}</p>
                <h1 class="member-name">${memberDetails.name}</h1>
                <p class="description">${t('certificate.description')}</p>
              </div>

              <div style="width: 100%;">
                <div class="meta-container">
                  <div class="meta-column">
                    <span class="meta-label">${t('certificate.memberId')}</span>
                    <span class="meta-value meta-value-mono">${memberDetails.memberId}</span>
                  </div>
                  <div class="meta-column">
                    <span class="meta-label">${t('certificate.dateOfIssuance')}</span>
                    <span class="meta-value">${memberDetails.joinedDate}</span>
                  </div>
                </div>

                <div class="cert-footer">
                  <div class="signature-col">
                    <span class="handwritten">${t('certificate.presidentName')}</span>
                    <span class="sig-title">${t('certificate.president')}</span>
                  </div>

                  <div class="seal-column">
                    <div class="seal-circle">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
                        <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.133 9.21l8.2-1.192z"/>
                      </svg>
                    </div>
                  </div>

                  <div class="signature-col">
                    <span class="handwritten">${t('certificate.generalSecretaryName')}</span>
                    <span class="sig-title">${t('certificate.generalSecretary')}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </body>
      </html>
    `;
    return htmlContent;
  };

  const handleDownload = async () => {
    const htmlContent = await buildCertificateHtml();
    generateAndDownloadPDF(htmlContent, `Membership_Certificate_${memberDetails.memberId}`);
  };

  const defaultShare = async () => {
    try {
      setSharing(true);
      const htmlContent = await buildCertificateHtml();
      const fileName = `Membership_Certificate_${memberDetails.memberId}`;
      const generatedPath = await generatePdfFile(htmlContent, fileName);

      let sharePath = generatedPath;

      // react-native-share's Android FileProvider only exposes the app cache dir.
      // Copy the PDF from internal Documents into the cache dir so it can be shared.
      if (Platform.OS === 'android') {
        const cacheDir = ReactNativeBlobUtil.fs.dirs.CacheDir;
        const cachedPath = `${cacheDir}/${fileName}_${Date.now()}.pdf`;
        await ReactNativeBlobUtil.fs.cp(generatedPath, cachedPath);
        sharePath = cachedPath;
      }

      await Share.open({
        url: `file://${sharePath}`,
        type: 'application/pdf',
        title: t('common.share'),
        failOnCancel: false,
      });
    } catch (error: any) {
      if (error?.message && error.message.toLowerCase().includes('cancel')) {
        // User dismissed the share sheet - not an error
        return;
      }
      console.log('Share error:', error);
      Alert.alert(t('common.error'), t('certificate.shareFailed'));
    } finally {
      setSharing(false);
    }
  };

  const handleSharePress = onShare || defaultShare;

  return (
    <View style={styles.container}>
      {/* Certificate Card View */}
      <View style={styles.certificateOuterContainer}>
        <View style={styles.certificateBorder}>
          <View style={styles.certificateInnerBorder}>
            {/* Trust Badge Header */}
            <View style={styles.certHeader}>
              <Image
                source={require('../../assets/images/logo/logo.png')}
                style={styles.certBadgeLogo}
                resizeMode="contain"
              />
              <Text style={styles.certTrustName}>{t('certificate.trustName')}</Text>
              <Text style={styles.certSubHeader}>{t('certificate.certificateOf', { tier: memberDetails.tier })}</Text>
            </View>

            {/* Presented To */}
            <View style={styles.certBody}>
              <Text style={styles.certPresentedText}>{t('certificate.presentedTo')}</Text>
              <Text style={styles.certMemberName}>{memberDetails.name}</Text>
              <Text style={styles.certDescription}>
                {t('certificate.description')}
              </Text>
            </View>

            {/* Certificate Metadata */}
            <View style={styles.certMetaContainer}>
              <View style={styles.certMetaColumn}>
                <Text style={styles.certMetaLabel}>{t('certificate.memberId')}</Text>
                <Text style={styles.certMetaValue}>{memberDetails.memberId}</Text>
              </View>
              <View style={styles.certMetaColumn}>
                <Text style={styles.certMetaLabel}>{t('certificate.dateOfIssuance')}</Text>
                <Text style={styles.certMetaValue}>{memberDetails.joinedDate}</Text>
              </View>
            </View>

            {/* Signatures & Seal */}
            <View style={styles.certFooter}>
              <View style={styles.signatureCol}>
                <View style={styles.sigLine} />
                <View style={styles.sigNameWrap}>
                  <Text style={styles.handwrittenSig}>{t('certificate.presidentName')}</Text>
                </View>
                <Text style={styles.sigTitle}>{t('certificate.president')}</Text>
              </View>

              {/* Gold Seal Svg */}
              <View style={styles.sealWrapper}>
                <Svg width={wp('13%')} height={wp('13%')} viewBox="0 0 100 100">
                  <Circle cx="50" cy="50" r="45" fill={Colors.primary} stroke="#D97706" strokeWidth="2" />
                  <Circle cx="50" cy="50" r="38" fill="transparent" stroke="#FFF" strokeWidth="1.5" strokeDasharray="3,3" />
                  <Path d="M50 20 L58 40 L78 40 L62 52 L68 72 L50 60 L32 72 L38 52 L22 40 L42 40 Z" fill="#FFF" />
                </Svg>
              </View>

              <View style={styles.signatureCol}>
                <View style={styles.sigLine} />
                <View style={styles.sigNameWrap}>
                  <Text style={styles.handwrittenSig}>{t('certificate.generalSecretaryName')}</Text>
                </View>
                <Text style={styles.sigTitle}>{t('certificate.generalSecretary')}</Text>
              </View>
            </View>

          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.85}>
          <Download size={RFValue(12)} color="#FFF" style={{ marginRight: wp('1.5%') }} />
          <Text style={styles.downloadBtnText}>{t('certificate.downloadPdf')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={handleSharePress} activeOpacity={0.85} disabled={sharing}>
          {sharing ? (
            <ActivityIndicator size="small" color="#FF6F34" style={{ marginRight: wp('1.5%') }} />
          ) : (
            <Share2 size={RFValue(12)} color="#FF6F34" style={{ marginRight: wp('1.5%') }} />
          )}
          <Text style={styles.shareBtnText}>{sharing ? t('certificate.preparingPdf') : t('common.share')}</Text>
        </TouchableOpacity>
      </View>

      {/* Membership Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>{t('certificate.membershipDetails')}</Text>

        {/* Detail Item Row 1 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <User size={RFValue(10.5)} color="#FF6F34" />
            </View>
            <View>
              <Text style={styles.detailLabel}>{t('certificate.name')}</Text>
              <Text style={styles.detailValue}>{memberDetails.name}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <Hash size={RFValue(10.5)} color="#FF6F34" />
            </View>
            <View>
              <Text style={styles.detailLabel}>{t('certificate.memberId')}</Text>
              <Text style={styles.detailValue}>{memberDetails.memberId}</Text>
            </View>
          </View>
        </View>

        {/* Detail Item Row 2 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <Award size={RFValue(10.5)} color="#FF6F34" />
            </View>
            <View>
              <Text style={styles.detailLabel}>{t('certificate.membershipTier')}</Text>
              <Text style={styles.detailValue}>{memberDetails.tier}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <Calendar size={RFValue(10.5)} color="#FF6F34" />
            </View>
            <View>
              <Text style={styles.detailLabel}>{t('certificate.memberSince')}</Text>
              <Text style={styles.detailValue}>{memberDetails.joinedDate}</Text>
            </View>
          </View>
        </View>

        {/* Detail Item Row 3 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <Calendar size={RFValue(10.5)} color="#FF6F34" />
            </View>
            <View>
              <Text style={styles.detailLabel}>{t('certificate.validTill')}</Text>
              <Text style={styles.detailValue}>{memberDetails.endDate}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <ShieldCheck size={RFValue(10.5)} color="#FF6F34" />
            </View>
            <View>
              <Text style={styles.detailLabel}>{t('certificate.status')}</Text>
              <Text style={styles.detailValue}>{memberDetails.status}</Text>
            </View>
          </View>
        </View>

        {/* Status Row */}
        <View style={styles.statusDetailsContainer}>
          <View style={styles.statusTagItem}>
            <Check size={RFValue(9)} color="#065F46" strokeWidth={3} style={{ marginRight: wp('0.5%') }} />
            <Text style={styles.statusTagTextGreen}>{t('certificate.verifiedAccount')}</Text>
          </View>
          <View style={styles.statusTagItem}>
            <ShieldCheck size={RFValue(9)} color="#065F46" style={{ marginRight: wp('0.5%') }} />
            <Text style={styles.statusTagTextGreen}>{t('certificate.activeCommunity')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  certificateOuterContainer: {
    width: '100%',
    backgroundColor: '#FAF5EE',
    borderRadius: wp('4%'),
    padding: wp('3%'),
    borderWidth: 1,
    borderColor: '#E6D7C3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  certificateBorder: {
    borderWidth: 2,
    borderColor: '#CBB28C',
    borderRadius: wp('3%'),
    padding: wp('2.5%'),
  },
  certificateInnerBorder: {
    borderWidth: 1,
    borderColor: '#CBB28C',
    borderRadius: wp('2%'),
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('3%'),
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
  },
  certHeader: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  certBadgeLogo: {
    width: wp('16%'),
    height: wp('16%'),
    marginBottom: hp('0.5%'),
  },
  certTrustName: {
    fontSize: RFValue(13.5),
    fontWeight: '800',
    color: '#806030',
    letterSpacing: 1,
  },
  certSubHeader: {
    fontSize: RFValue(8.2),
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 0.5,
    marginTop: hp('0.5%'),
  },
  certBody: {
    alignItems: 'center',
    marginBottom: hp('8%'),
  },
  certPresentedText: {
    fontSize: RFValue(9),
    color: '#6B7280',
    fontStyle: 'italic',
  },
  certMemberName: {
    fontSize: RFValue(17),
    fontWeight: '800',
    color: '#111827',
    marginVertical: hp('1%'),
    textAlign: 'center',
    borderBottomWidth: 1.5,
    borderColor: '#E6D7C3',
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('0.3%'),
  },
  certDescription: {
    fontSize: RFValue(8.5),
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: hp('1.6%'),
    marginTop: hp('0.5%'),
    paddingHorizontal: wp('1.5%'),
  },
  certMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: wp('4%'),
    marginBottom: hp('1%'),
  },
  certMetaColumn: {
    alignItems: 'center',
  },
  certMetaLabel: {
    fontSize: RFValue(7.2),
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  certMetaValue: {
    fontSize: RFValue(8.8),
    color: '#374151',
    fontWeight: '700',
    marginTop: hp('0.2%'),
  },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: wp('2%'),
  },
  signatureCol: {
    alignItems: 'center',
    width: wp('30%'),
  },
  sigNameWrap: {
    alignSelf: 'stretch',
    minHeight: hp('4.2%'),
    justifyContent: 'center',
  },
  handwrittenSig: {
    fontFamily: Platform.OS === 'ios' ? 'Poppins-Regular' : 'Poppins-Regular',
    fontSize: RFValue(12),
    color: '#5D4037',
    textAlign: 'center',
    lineHeight: hp('2.1%'),
  },
  sigLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#CCCCCC',
    marginVertical: hp('0.5%'),
  },
  sigTitle: {
    fontSize: RFValue(7.2),
    color: '#6B7280',
    fontWeight: '600',
  },
  sealWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('2%'),
    width: '100%',
  },
  downloadBtn: {
    backgroundColor: '#FF6F34',
    height: hp('5%'),
    borderRadius: wp('3%'),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginRight: wp('2%'),
    shadowColor: '#FF6F34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  downloadBtnText: {
    color: '#FFF',
    fontSize: RFValue(10.5),
    fontWeight: '700',
  },
  shareBtn: {
    backgroundColor: '#FFF',
    height: hp('5%'),
    borderRadius: wp('3%'),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginLeft: wp('2%'),
    borderWidth: 1,
    borderColor: '#FF6F34',
  },
  shareBtnText: {
    color: '#FF6F34',
    fontSize: RFValue(10.5),
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginTop: hp('2%'),
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailsTitle: {
    fontSize: RFValue(12),
    fontWeight: '800',
    color: '#111827',
    marginBottom: hp('1.5%'),
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('1.5%'),
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  detailIconCircle: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('2.5%'),
  },
  detailLabel: {
    fontSize: RFValue(7.8),
    color: '#9CA3AF',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: RFValue(9.5),
    color: '#1F2937',
    fontWeight: '700',
    marginTop: hp('0.1%'),
  },
  statusDetailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: hp('1.2%'),
    marginTop: hp('0.5%'),
  },
  statusTagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('0.5%'),
  },
  statusTagTextGreen: {
    fontSize: RFValue(8.2),
    color: '#065F46',
    fontWeight: '600',
    marginLeft: wp('1.5%'),
  },
});
