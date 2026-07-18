import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../theme/colors';
import useAuthStore from '../zustand/useAuthStore';

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  userId?: string;
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (commentText: string) => void;
  currentUserId?: string;
  onDeleteComment?: (commentId: string) => void;
}


export const CommentsModal = ({
  visible,
  onClose,
  comments,
  onAddComment,
  currentUserId,
  onDeleteComment,
}: CommentsModalProps) => {
  const navigation = useNavigation();
  const [newCommentText, setNewCommentText] = useState('');
  const { user } = useAuthStore();

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim());
    setNewCommentText('');
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          {/* Header / Drag Handle */}
          <View style={styles.modalHeader}>
            <View style={styles.dragHandle} />
            <Text style={styles.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView
            contentContainerStyle={styles.commentsListScroll}
            showsVerticalScrollIndicator={false}
          >
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                {comment.avatar ? (
                  <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                ) : (
                  <View style={[styles.commentAvatar, { backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE0D3' }]}>
                    <Text style={{ fontSize: RFValue(11), fontWeight: '700', color: Colors.dark }}>
                      {(comment.author || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                  <View style={styles.commentContent}>
                    <Text style={styles.commentAuthorText}>
                      {comment.author}{' '}
                      <Text style={styles.commentMetaText}>{comment.time}</Text>
                    </Text>
                    <Text style={styles.commentBodyText}>{comment.text}</Text>
                  </View>
                  {currentUserId && comment.userId === currentUserId && (
                    <TouchableOpacity onPress={() => onDeleteComment && onDeleteComment(comment.id)} style={{ padding: 5, marginLeft: wp('2%') }}>
                      <Trash2 size={16} color="red" />
                    </TouchableOpacity>
                  )}
                </View>
            
            ))}
          </ScrollView>

          {/* Sticky Input Bar */}
          <View style={styles.inputBar}>
            {(() => {
              let currentUserAvatar = '';
              if (user?.profile?.profile_pic) {
                currentUserAvatar = user.profile.profile_pic;
              } else if (user?.avatar) {
                currentUserAvatar = user.avatar.startsWith('http') ? user.avatar : `https://gst.tambimotors.com/${user.avatar}`;
              }
              return currentUserAvatar ? (
                <Image source={{ uri: currentUserAvatar }} style={styles.inputUserAvatar} />
              ) : (
                <View style={[styles.inputUserAvatar, { backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFE0D3' }]}>
                  <Text style={{ fontSize: RFValue(11), fontWeight: '700', color: Colors.dark }}>
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              );
            })()}
            <TextInput
              style={styles.commentInput}
              placeholder={`Comment as ${user?.name || 'User'}...`}
              placeholderTextColor={Colors.gray}
              value={newCommentText}
              onChangeText={setNewCommentText}
              multiline
            />
            <TouchableOpacity
              onPress={handleAddComment}
              disabled={!newCommentText.trim()}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.postButtonText,
                  newCommentText.trim() && styles.postButtonTextActive,
                ]}
              >
                Post
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    maxHeight: hp('75%'),
    minHeight: hp('50%'),
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
  commentsListScroll: {
    padding: wp('4%'),
    paddingBottom: hp('4%'),
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: hp('2%'),
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    marginRight: wp('3%'),
  },
  commentContent: {
    flex: 1,
  },
  commentAuthorText: {
    fontSize: RFValue(11),
    fontWeight: '700',
    color: Colors.dark,
  },
  commentMetaText: {
    fontWeight: '400',
    fontSize: RFValue(9.5),
    color: Colors.gray,
    marginLeft: wp('2%'),
  },
  commentBodyText: {
    fontSize: RFValue(11),
    color: '#444444',
    marginTop: hp('0.3%'),
    lineHeight: RFValue(14.5),
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    backgroundColor: Colors.white,
  },
  inputUserAvatar: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    marginRight: wp('3%'),
  },
  commentInput: {
    flex: 1,
    fontSize: RFValue(11.5),
    color: Colors.dark,
    paddingVertical: hp('0.5%'),
    maxHeight: hp('8%'),
  },
  postButtonText: {
    fontSize: RFValue(12),
    fontWeight: '700',
    color: '#CCC',
    marginLeft: wp('3%'),
  },
  postButtonTextActive: {
    color: Colors.primary,
  },
});
