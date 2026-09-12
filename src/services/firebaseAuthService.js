import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';

const authInstance = getAuth();

let pendingConfirmation = null;

const normalizePhone = (phone) => {
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return `+${digits}`;
};

export const sendFirebaseOtp = async (phone) => {
  pendingConfirmation = await signInWithPhoneNumber(authInstance, normalizePhone(phone));
  return pendingConfirmation;
};

export const confirmFirebaseOtp = async (otp) => {
  if (!pendingConfirmation) {
    throw new Error('Send OTP first');
  }
  const confirmation = await pendingConfirmation.confirm(otp);
  return confirmation.user;
};

export const getFirebaseIdToken = async () => {
  const user = authInstance.currentUser;
  if (!user) {
    return null;
  }
  return user.getIdToken();
};

export const resendFirebaseOtp = async (phone) => {
  pendingConfirmation = await signInWithPhoneNumber(authInstance, normalizePhone(phone));
  return pendingConfirmation;
};

export const hasPendingConfirmation = () => !!pendingConfirmation;