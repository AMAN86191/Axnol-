import React, { createContext, useState, useContext } from 'react';
import { Image } from 'react-native';

export interface Post {
  id: string;
  userId: string;
  author: string;
  avatar: string;
  meta: string;
  text: string;
  image?: string;
  images?: string[];
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface PostContextType {
  posts: Post[];
  addPost: (caption: string, imageUris: string[]) => { success: boolean; error?: string };
  updatePost: (postId: string, newCaption: string, newImages?: string[]) => { success: boolean; error?: string };
  deletePost: (postId: string) => void;
  toggleLikePost: (postId: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      userId: 'user_rahul',
      author: 'Rahul Sharma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120',
      meta: '2 hours ago • Verified Sevak',
      text: "The new calf 'Nandi' is doing wonderfully! Thanks to the donor community for the specialized medical kit.",
      image: Image.resolveAssetSource(require('../../assets/images/feed/cow_calf_1781177033799.png')).uri,
      images: [
        Image.resolveAssetSource(require('../../assets/images/feed/cow_calf_1781177033799.png')).uri,
        Image.resolveAssetSource(require('../../assets/images/feed/cow_medical_1781177084941.png')).uri,
        Image.resolveAssetSource(require('../../assets/images/feed/cow_portrait_1781177072664.png')).uri
      ],
      likes: 124,
      comments: 18,
      isLiked: true,
    },
    {
      id: '2',
      userId: 'user_priya',
      author: 'Priya Patel',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      meta: '4 hours ago • Volunteer Coordinator',
      text: "Organized the weekend green grass distribution drive! Thank you to all the 15+ volunteers who joined us in cleaning and feeding.",
      image: Image.resolveAssetSource(require('../../assets/images/feed/cow_feeding_1781177046811.png')).uri,
      images: [
        Image.resolveAssetSource(require('../../assets/images/feed/cow_feeding_1781177046811.png')).uri,
        Image.resolveAssetSource(require('../../assets/images/feed/cow_shelter_1781177059865.png')).uri
      ],
      likes: 156,
      comments: 24,
      isLiked: false,
    },
    {
      id: '3',
      userId: 'current_user',
      author: 'Ananda Das',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      meta: '5 hours ago • Verified Sevak',
      text: 'Visiting the Gaushala today was such a blessing. The cows are so peaceful and well-cared for.',
      image: Image.resolveAssetSource(require('../../assets/images/feed/cow_shelter_1781177059865.png')).uri,
      images: [
        Image.resolveAssetSource(require('../../assets/images/feed/cow_shelter_1781177059865.png')).uri
      ],
      likes: 85,
      comments: 6,
      isLiked: false,
    },
    {
      id: '4',
      userId: 'user_vikram',
      author: 'Vikram Singh',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      meta: 'Yesterday • Donor',
      text: "Happy to contribute toward the dry fodder feed supply. Every small contribution feeds a soul 🙏 Let's continue working for Gau Seva.",
      image: Image.resolveAssetSource(require('../../assets/images/feed/cow_medical_1781177084941.png')).uri,
      images: [Image.resolveAssetSource(require('../../assets/images/feed/cow_medical_1781177084941.png')).uri],
      likes: 98,
      comments: 11,
      isLiked: true,
    },
    {
      id: '5',
      userId: 'current_user',
      author: 'Ananda Das',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      meta: '2 days ago • Verified Sevak',
      text: 'Contributing to the daily green fodder drive. Every small contribution feeds a soul 🙏',
      image: Image.resolveAssetSource(require('../../assets/images/feed/cow_calf_1781177033799.png')).uri,
      images: [Image.resolveAssetSource(require('../../assets/images/feed/cow_calf_1781177033799.png')).uri],
      likes: 92,
      comments: 10,
      isLiked: true,
    }
  ]);

  const validateCaption = (caption: string): string | null => {
    if (!caption.trim()) {
      return 'Caption cannot be empty.';
    }
    if (caption.length > 500) {
      return 'Caption limit is 500 characters.';
    }

    // Regular expression to check for URLs/links
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,6}\b[^\s]*)/gi;
    if (urlPattern.test(caption)) {
      return 'Links or URLs are not allowed in captions.';
    }
    return null;
  };

  const addPost = (caption: string, imageUris: string[]) => {
    const validationError = validateCaption(caption);
    if (validationError) {
      return { success: false, error: validationError };
    }
    if (!imageUris || imageUris.length === 0) {
      return { success: false, error: 'Please select at least one image.' };
    }
    if (imageUris.length > 5) {
      return { success: false, error: 'Maximum of 5 images can be uploaded.' };
    }

    const newPost: Post = {
      id: String(Date.now()),
      userId: 'current_user',
      author: 'Ananda Das',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
      meta: 'Just now • Verified Sevak',
      text: caption.trim(),
      image: imageUris[0], // fallback
      images: imageUris,
      likes: 0,
      comments: 0,
      isLiked: false,
    };

    setPosts(prev => [newPost, ...prev]);
    return { success: true };
  };

  const updatePost = (postId: string, newCaption: string, newImages?: string[]) => {
    const validationError = validateCaption(newCaption);
    if (validationError) {
      return { success: false, error: validationError };
    }

    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          if (post.userId !== 'current_user') {
            // Safety ownership check
            return post;
          }
          return {
            ...post,
            text: newCaption.trim(),
            image: newImages && newImages.length > 0 ? newImages[0] : post.image,
            images: newImages && newImages.length > 0 ? newImages : post.images,
          };
        }
        return post;
      })
    );

    return { success: true };
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => {
      if (post.id === postId) {
        // Only allow deleting own posts
        return post.userId !== 'current_user';
      }
      return true;
    }));
  };

  const toggleLikePost = (postId: string) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : Math.max(0, post.likes - 1),
          };
        }
        return post;
      })
    );
  };

  return (
    <PostContext.Provider value={{ posts, addPost, updatePost, deletePost, toggleLikePost }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};
