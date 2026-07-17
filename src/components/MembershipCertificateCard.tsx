import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Download, Award, ShieldCheck, Calendar, User, Hash, Check, Share2 } from 'lucide-react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { generateAndDownloadPDF } from '../utils/pdfGenerator';

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

export const MembershipCertificateCard = ({ memberDetails, onShare }: MembershipCertificateCardProps) => {
  const handleDownload = () => {
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
            .award-icon { margin-bottom: 15px; }
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
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="8" r="6"></circle>
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                    </svg>
                  </div>
                  <div class="title">GAU MATA SEWA TRUST</div>
                  <div class="subtitle">CERTIFICATE OF ${memberDetails.tier} MEMBERSHIP</div>
                </div>
                
                <div class="body-section">
                  <div class="presented-text">This certificate is proudly presented to</div>
                  <div class="member-name-container">
                    <div class="member-name">${memberDetails.name}</div>
                    <div class="name-underline"></div>
                  </div>
                  <div class="description">
                    in recognition of their noble support, generous contributions, and dedicated service as a verified Gau Sevak. Your commitment directly aids the feeding, shelter, and medical protection of indigenous cows.
                  </div>
                </div>
                
                <div class="meta-container">
                  <div class="meta-column">
                    <div class="meta-label">MEMBER ID</div>
                    <div class="meta-value">${memberDetails.memberId}</div>
                  </div>
                  <div class="meta-column">
                    <div class="meta-label">DATE OF ISSUANCE</div>
                    <div class="meta-value">${memberDetails.joinedDate}</div>
                  </div>
                </div>
                
                <div class="footer">
                  <div class="signature-col">
                    <div class="handwritten">Swami Anand</div>
                    <div class="sig-line"></div>
                    <div class="sig-title">President, Trustee</div>
                  </div>
                  
                  <div class="seal">
                    <svg width="80" height="80" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="#F59E0B" stroke="#D97706" stroke-width="2" />
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#FFF" stroke-width="1.5" stroke-dasharray="3,3" />
                      <path d="M50 20 L58 40 L78 40 L62 52 L68 72 L50 60 L32 72 L38 52 L22 40 L42 40 Z" fill="#FFF" />
                    </svg>
                  </div>
                  
                  <div class="signature-col">
                    <div class="handwritten">R. K. Sharma</div>
                    <div class="sig-line"></div>
                    <div class="sig-title">General Secretary</div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    generateAndDownloadPDF(htmlContent, `Membership_Certificate_${memberDetails.memberId}`);
  };

  const defaultShare = async () => {
    try {
      await Share.share({
        message: `I am proud to be a verified ${memberDetails.tier} of Gau Mata Sewa Trust! Join me in protecting and feeding our indigenous cows. My Member ID: ${memberDetails.memberId}. www.gaumatatrust.org`,
      });
    } catch (error) {
      console.log(error);
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
              <Award size={RFValue(24)} color="#D97706" style={styles.certBadgeIcon} />
              <Text style={styles.certTrustName}>GAU MATA SEWA TRUST</Text>
              <Text style={styles.certSubHeader}>CERTIFICATE OF {memberDetails.tier} MEMBERSHIP</Text>
            </View>

            {/* Presented To */}
            <View style={styles.certBody}>
              <Text style={styles.certPresentedText}>This certificate is proudly presented to</Text>
              <Text style={styles.certMemberName}>{memberDetails.name}</Text>
              <Text style={styles.certDescription}>
                in recognition of their noble support, generous contributions, and dedicated service as a verified Gau Sevak. Your commitment directly aids the feeding, shelter, and medical protection of indigenous cows.
              </Text>
            </View>

            {/* Certificate Metadata */}
            <View style={styles.certMetaContainer}>
              <View style={styles.certMetaColumn}>
                <Text style={styles.certMetaLabel}>MEMBER ID</Text>
                <Text style={styles.certMetaValue}>{memberDetails.memberId}</Text>
              </View>
              <View style={styles.certMetaColumn}>
                <Text style={styles.certMetaLabel}>DATE OF ISSUANCE</Text>
                <Text style={styles.certMetaValue}>{memberDetails.joinedDate}</Text>
              </View>
            </View>

            {/* Signatures & Seal */}
            <View style={styles.certFooter}>
              <View style={styles.signatureCol}>
                <Text style={styles.handwrittenSig}>Swami Anand</Text>
                <View style={styles.sigLine} />
                <Text style={styles.sigTitle}>President, Trustee</Text>
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
                <Text style={styles.handwrittenSig}>R. K. Sharma</Text>
                <View style={styles.sigLine} />
                <Text style={styles.sigTitle}>General Secretary</Text>
              </View>
            </View>

          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload} activeOpacity={0.85}>
          <Download size={RFValue(12)} color="#FFF" style={{ marginRight: wp('1.5%') }} />
          <Text style={styles.downloadBtnText}>Download PDF</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareBtn} onPress={handleSharePress} activeOpacity={0.85}>
          <Share2 size={RFValue(12)} color="#FF6F34" style={{ marginRight: wp('1.5%') }} />
          <Text style={styles.shareBtnText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Membership Details Card */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Membership Details</Text>
        
        {/* Detail Item Row 1 */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <User size={RFValue(10.5)} color="#FF6F34" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{memberDetails.name}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <Hash size={RFValue(10.5)} color="#FF6F34" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Member ID</Text>
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
              <Text style={styles.detailLabel}>Membership Tier</Text>
              <Text style={styles.detailValue}>{memberDetails.tier}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <Calendar size={RFValue(10.5)} color="#FF6F34" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Member Since</Text>
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
              <Text style={styles.detailLabel}>Valid Till</Text>
              <Text style={styles.detailValue}>{memberDetails.endDate}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <ShieldCheck size={RFValue(10.5)} color="#FF6F34" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>{memberDetails.status}</Text>
            </View>
          </View>
        </View>

        {/* Status Row */}
        <View style={styles.statusDetailsContainer}>
          <View style={styles.statusTagItem}>
            <Check size={RFValue(9)} color="#065F46" strokeWidth={3} style={{ marginRight: wp('0.5%') }} />
            <Text style={styles.statusTagTextGreen}>Verified Account Status</Text>
          </View>
          <View style={styles.statusTagItem}>
            <ShieldCheck size={RFValue(9)} color="#065F46" style={{ marginRight: wp('0.5%') }} />
            <Text style={styles.statusTagTextGreen}>Active Community Member</Text>
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
  certBadgeIcon: {
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
