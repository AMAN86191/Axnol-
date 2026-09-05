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
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Great+Vibes&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 0; 
              padding: 40px; 
              background-color: #ffffff; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              margin-top: 30px;
              margin-bottom: 30px;
            }
            .certificate-outer { 
              width: 100%; 
              max-width: 800px;
              background-color: #FAF5EE; 
              border: 1.5px solid #E6D7C3; 
              border-radius: 20px; 
              padding: 16px; 
              box-sizing: border-box; 
            }
            .certificate-border { 
              border: 2px solid #CBB28C; 
              border-radius: 14px; 
              padding: 12px; 
            }
            .certificate-inner { 
              border: 1px solid #CBB28C; 
              border-radius: 10px; 
              background-color: #FFFDF9; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              padding: 40px 50px; 
              box-sizing: border-box; 
            }
            .header { text-align: center; margin-bottom: 30px; }
            .award-icon { margin-bottom: 15px; display: flex; justify-content: center; }
            .header-logo { width: 70px; height: 70px; object-fit: contain; }
            .title { 
              font-size: 26px; 
              font-weight: 800; 
              color: #806030; 
              letter-spacing: 1.5px; 
              margin: 0 0 8px 0; 
            }
            .subtitle { 
              font-size: 14px; 
              font-weight: 700; 
              color: #D97706; 
              letter-spacing: 0.5px; 
              text-transform: uppercase; 
            }
            .body-section { text-align: center; margin-bottom: 40px; width: 90%; }
            .presented-text { 
              font-size: 16px; 
              color: #6B7280; 
              font-style: italic; 
            }
            .member-name-container {
              margin: 25px 0;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .member-name { 
              font-size: 38px; 
              font-weight: 800; 
              color: #111827; 
            }
            .name-underline {
              width: 60%;
              height: 1.5px;
              background-color: #E6D7C3;
              margin-top: 10px;
            }
            .description { 
              font-size: 15px; 
              color: #4B5563; 
              line-height: 1.6; 
              padding: 0 20px;
            }
            .meta-container { 
              display: flex; 
              justify-content: space-between; 
              width: 100%; 
              margin-bottom: 40px; 
              padding: 0 40px; 
              box-sizing: border-box; 
            }
            .meta-column { text-align: center; }
            .meta-label { 
              font-size: 11px; 
              color: #9CA3AF; 
              font-weight: 700; 
              letter-spacing: 1px; 
            }
            .meta-value { 
              font-size: 15px; 
              color: #374151; 
              font-weight: 700; 
              margin-top: 6px; 
            }
            .footer { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              width: 100%; 
              padding: 0 30px; 
              box-sizing: border-box; 
            }
            .signature-col { 
              text-align: center; 
              width: 150px; 
            }
            .handwritten { 
              font-family: 'Great Vibes', cursive; 
              font-size: 32px; 
              color: #5D4037; 
              margin-bottom: 5px; 
            }
            .sig-line { 
              width: 100%; 
              height: 1px; 
              background-color: #CCCCCC; 
              margin: 8px 0; 
            }
            .sig-title { 
              font-size: 12px; 
              color: #6B7280; 
              font-weight: 600; 
            }
            .seal { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
            }
          </style>
        </head>
        <body>
          <div class="certificate-outer">
            <div class="certificate-border">
              <div class="certificate-inner">
                
                <div class="header">
                  <div class="award-icon">
                    ${logoDataUri
                      ? `<img class="header-logo" src="${logoDataUri}" alt="logo" />`
                      : `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="8" r="6"></circle>
                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                      </svg>`}
                  </div>
                  <div class="title">${t('certificate.trustName')}</div>
                  <div class="subtitle">${t('certificate.certificateOf', { tier: memberDetails.tier })}</div>
                </div>
                
                <div class="body-section">
                  <div class="presented-text">${t('certificate.presentedTo')}</div>
                  <div class="member-name-container">
                    <div class="member-name">${memberDetails.name}</div>
                    <div class="name-underline"></div>
                  </div>
                  <div class="description">
                    ${t('certificate.description')}
                  </div>
                </div>
                
                <div class="meta-container">
                  <div class="meta-column">
                    <div class="meta-label">${t('certificate.memberId')}</div>
                    <div class="meta-value">${memberDetails.memberId}</div>
                  </div>
                  <div class="meta-column">
                    <div class="meta-label">${t('certificate.dateOfIssuance')}</div>
                    <div class="meta-value">${memberDetails.joinedDate}</div>
                  </div>
                </div>
                
                <div class="footer">
                  <div class="signature-col">
                    <div class="handwritten">${t('certificate.presidentName')}</div>
                    <div class="sig-line"></div>
                    <div class="sig-title">${t('certificate.president')}</div>
                  </div>
                  
                  <div class="seal">
                    <svg width="80" height="80" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="#F59E0B" stroke="#D97706" stroke-width="2" />
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#FFF" stroke-width="1.5" stroke-dasharray="3,3" />
                      <path d="M50 20 L58 40 L78 40 L62 52 L68 72 L50 60 L32 72 L38 52 L22 40 L42 40 Z" fill="#FFF" />
                    </svg>
                  </div>
                  
                  <div class="signature-col">
                    <div class="handwritten">${t('certificate.generalSecretaryName')}</div>
                    <div class="sig-line"></div>
                    <div class="sig-title">${t('certificate.generalSecretary')}</div>
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
                <Text style={styles.handwrittenSig}>{t('certificate.presidentName')}</Text>
                <View style={styles.sigLine} />
                <Text style={styles.sigTitle}>{t('certificate.president')}</Text>
              </View>

              {/* Gold Seal Svg */}
              <View style={styles.sealWrapper}>
                <Svg width={wp('13%')} height={wp('13%')} viewBox="0 0 100 100">
                  <Circle cx="50" cy="50" r="45" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
                  <Circle cx="50" cy="50" r="38" fill="transparent" stroke="#FFF" strokeWidth="1.5" strokeDasharray="3,3" />
                  <Path d="M50 20 L58 40 L78 40 L62 52 L68 72 L50 60 L32 72 L38 52 L22 40 L42 40 Z" fill="#FFF" />
                </Svg>
              </View>

              <View style={styles.signatureCol}>
                <Text style={styles.handwrittenSig}>{t('certificate.generalSecretaryName')}</Text>
                <View style={styles.sigLine} />
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
    marginBottom: hp('2%'),
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
    marginBottom: hp('2.5%'),
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
    width: wp('25%'),
  },
  handwrittenSig: {
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive',
    fontSize: RFValue(13),
    color: '#5D4037',
    height: hp('2.5%'),
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
