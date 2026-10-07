import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTranslation } from 'react-i18next';
import { Colors } from '../theme/colors';

export interface DislikedUser {
  id: string | number;
  name: string;
  profile_pic?: string;
  membership?: string;
  avatar?: string;
}

interface DislikesModalProps {
  visible: boolean;
  onClose: () => void;
  dislikedBy: DislikedUser[];
}

export const DislikesModal = ({
  visible,
  onClose,
  dislikedBy,
}: DislikesModalProps) => {
  const { t } = useTranslation();

  const renderItem = ({ item }: { item: DislikedUser }) => {
    let avatarUrl = '';
    if (item.profile_pic) {
      avatarUrl = item.profile_pic.startsWith('http') ? item.profile_pic : `https://gst.tambimotors.com/${item.profile_pic}`;
    } else if (item.avatar) {
      avatarUrl = item.avatar.startsWith('http') ? item.avatar : `https://gst.tambimotors.com/${item.avatar}`;
    }

    return (
      <View style={styles.userItem}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' }]}>
            <Text style={{ fontSize: RFValue(12), fontWeight: '700', color: Colors.dark }}>
              {(item.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.membership ? (
            <Text style={styles.userMembership}>{item.membership}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackgroundDismiss}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.dragHandle} />
            <Text style={styles.modalTitle}>{t('dislikes.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={dislikedBy}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listScroll}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('dislikes.empty')}</Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackgroundDismiss: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: wp('5%'),
    borderTopRightRadius: wp('5%'),
    maxHeight: hp('60%'),
    minHeight: hp('30%'),
    paddingBottom: Platform.OS === 'ios' ? hp('2.5%') : hp('1%'),
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    position: 'relative',
  },
  dragHandle: {
    width: wp('10%'),
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
    marginBottom: hp('1%'),
  },
  modalTitle: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: Colors.dark,
  },
  closeButton: {
    position: 'absolute',
    right: wp('4%'),
    top: hp('2%'),
    padding: wp('1%'),
  },
  listScroll: {
    padding: wp('4%'),
    paddingBottom: hp('4%'),
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  avatar: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    marginRight: wp('3%'),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: RFValue(12),
    fontWeight: '600',
    color: Colors.dark,
  },
  userMembership: {
    fontSize: RFValue(10),
    color: Colors.gray,
    marginTop: hp('0.2%'),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp('5%'),
  },
  emptyText: {
    fontSize: RFValue(12),
    color: Colors.gray,
  },
});