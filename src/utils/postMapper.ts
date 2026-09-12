export interface PostItem {
  id: string;
  author: string;
  avatar: string;
  meta: string;
  text: string;
  image?: string | null;
  images?: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  likedBy: any[];
  dislikes: number;
  isDisliked: boolean;
  dislikedBy: any[];
  userId?: string;
  status?: string;
  original_post_images?: any[];
}

interface MapperLabels {
  unknown?: string;
  justNow?: string;
  fallbackAvatar?: string;
}

const BASE_URL = 'https://gst.tambimotors.com';

export const toAbsoluteUrl = (url?: string | null): string => {
  if (!url) return '';
  let clean = url;
  if (!clean.startsWith('http')) {
    clean = `${BASE_URL}/${clean.startsWith('/') ? clean.slice(1) : clean}`;
  }
  const employeeMatch = clean.match(/\/employee_pics\/(.+)$/);
  if (employeeMatch && !/\/storage\/employee_pics\//.test(clean)) {
    return `${BASE_URL}/storage/employee_pics/${employeeMatch[1]}`;
  }
  return clean;
};

const getAvatarUrl = (item: any): string => {
  if (item?.author?.profile_pic) return toAbsoluteUrl(item.author.profile_pic);
  if (item?.author?.avatar) return toAbsoluteUrl(item.author.avatar);
  if (item?.user?.profile_pic) return toAbsoluteUrl(item.user.profile_pic);
  if (item?.user?.avatar) return toAbsoluteUrl(item.user.avatar);
  if (item?.admin?.profile_pic) return toAbsoluteUrl(item.admin.profile_pic);
  if (item?.admin?.avatar) return toAbsoluteUrl(item.admin.avatar);
  if (item?.employee?.profile_pic) return toAbsoluteUrl(item.employee.profile_pic);
  if (item?.employee?.avatar) return toAbsoluteUrl(item.employee.avatar);
  return '';
};

export const mapPostItem = (
  item: any,
  currentUserId?: string | number,
  labels: MapperLabels = {},
): PostItem => {
  const unknownLabel = labels.unknown || item?.author_name || 'Unknown';
  const justNowLabel = labels.justNow || 'Just now';

  let imageUrl = item?.post_img ? toAbsoluteUrl(item.post_img) : null;

  let additionalImages: string[] = [];
  if (item?.images && Array.isArray(item.images) && item.images.length > 0) {
    additionalImages = item.images.map((img: any) => toAbsoluteUrl(img?.image || img?.post_img));
  } else if (item?.post_images && Array.isArray(item.post_images) && item.post_images.length > 0) {
    additionalImages = item.post_images.map((img: any) => toAbsoluteUrl(img?.post_img || img?.image));
  }

  if (additionalImages.length === 0 && imageUrl) {
    additionalImages = [imageUrl];
  }
  const displayImage = imageUrl || (additionalImages.length > 0 ? additionalImages[0] : null);

  let likedBy = Array.isArray(item?.liked_by) ? item.liked_by : [];
  let dislikedBy = Array.isArray(item?.disliked_by) ? item.disliked_by : [];

  const isDisliked = currentUserId != null
    ? dislikedBy.some((u: any) => String(u.id) === String(currentUserId))
    : !!item?.is_disliked;

  const isLikedByUser = currentUserId != null
    ? likedBy.some((u: any) => String(u.id) === String(currentUserId))
    : !!item?.is_liked;

  let isLiked = isLikedByUser;
  let resolvedLikedBy = [...likedBy];
  let resolvedDislikedBy = [...dislikedBy];

  if (currentUserId != null) {
    if (isDisliked && isLikedByUser) {
      isLiked = false;
    }
    if (!isLiked) {
      resolvedLikedBy = resolvedLikedBy.filter((u: any) => String(u.id) !== String(currentUserId));
    }
    if (!isDisliked) {
      resolvedDislikedBy = resolvedDislikedBy.filter((u: any) => String(u.id) !== String(currentUserId));
    }
  }

  return {
    id: item?.id?.toString() || Math.random().toString(),
    author: item?.author_name || item?.author?.name || item?.user?.name || item?.admin?.name || item?.employee?.name || unknownLabel,
    avatar: getAvatarUrl(item) || (labels.fallbackAvatar ? toAbsoluteUrl(labels.fallbackAvatar) : ''),
    meta: item?.created_at || justNowLabel,
    text: item?.description || '',
    image: displayImage,
    images: additionalImages,
    likes: item?.likes_count ?? item?.likes ?? 0,
    comments: item?.comments_count || 0,
    isLiked,
    likedBy: resolvedLikedBy,
    dislikes: item?.dislikes_count ?? item?.dislikes ?? 0,
    isDisliked,
    dislikedBy: resolvedDislikedBy,
    userId: item?.user_id?.toString() || item?.admin_id?.toString() || item?.employee?.id?.toString(),
    status: item?.status,
    original_post_images: item?.images || item?.post_images || [],
  };
};