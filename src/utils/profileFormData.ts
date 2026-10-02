export const PROFILE_IMAGE_BASE_URL = 'https://gst.tambimotors.com';

const LOCAL_IMAGE_SCHEMES = [
  'file://',
  'content://',
  'assets-library://',
  'ph://',
  'data:',
];

export const toAbsoluteImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${PROFILE_IMAGE_BASE_URL}/${url.startsWith('/') ? url.slice(1) : url}`;
};

export const isLocalImageUri = (uri?: string | null): boolean => {
  if (!uri) return false;
  return LOCAL_IMAGE_SCHEMES.some(scheme => uri.startsWith(scheme));
};

const guessMimeType = (uri: string): string => {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  return 'image/jpeg';
};

export interface ProfileFormValues {
  name?: string;
  email?: string;
  phone?: string;
  dob?: string;
  dom?: string;
  partner_name?: string;
  profession?: string;
  bio?: string;
  country?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  area?: string;
}

export type ProfileFilePart = {
  uri: string;
  name: string;
  type: string;
};

export type ProfileFormPart =
  | { field: keyof ProfileFormValues | 'profile_pic'; value: string }
  | { field: 'profile_pic'; value: ProfileFilePart };

const TEXT_FIELDS: (keyof ProfileFormValues)[] = [
  'name',
  'email',
  'phone',
  'dob',
  'dom',
  'partner_name',
  'profession',
  'bio',
  'country',
  'city',
  'state',
  'pincode',
  'address',
  'area',
];

export const buildProfileParts = (
  values: ProfileFormValues,
  profilePic?: string | null,
): ProfileFormPart[] => {
  const parts: ProfileFormPart[] = TEXT_FIELDS.map(field => ({
    field,
    value: values[field] ?? '',
  }));

  if (isLocalImageUri(profilePic)) {
    parts.push({
      field: 'profile_pic',
      value: {
        uri: profilePic as string,
        name: profilePic!.split('/').pop() || 'profile.jpg',
        type: guessMimeType(profilePic as string),
      },
    });
  }

  return parts;
};

export const buildProfileFormData = (
  values: ProfileFormValues,
  profilePic?: string | null,
): FormData => {
  const formData = new FormData();

  buildProfileParts(values, profilePic).forEach(part => {
    formData.append(part.field as string, part.value as any);
  });

  return formData;
};
