import { create } from 'zustand';
import api from '../api/axiosConfig';

interface HomeState {
  loading: boolean;
  error: string | null;
  posts: any[];
  createPost: (formData: FormData) => Promise<any>;
  getPosts: (page?: number) => Promise<any>;
  getPostDetails: (id: string | number) => Promise<any>;
  toggleLikePost: (postId: string | number) => Promise<any>;
  getComments: (postId: string | number) => Promise<any>;
  commentPost: (postId: string | number, comment: string) => Promise<any>;
  deleteComment: (commentId: string | number) => Promise<any>;
  getmypost: () => Promise<any>;
  deletePostStore: (postId: string | number) => Promise<any>;
  updatePostStore: (formData: any) => Promise<any>;
  getPlansStore: () => Promise<any>;
  purchasePlanStore: (payload: { plan_id: number; amount: number; payment_status: string; transaction_id: string }) => Promise<any>;
}

const useHomeStore = create<HomeState>((set) => ({
  loading: false,
  error: null,
  posts: [],
  createPost: async (formData: FormData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/user/create-post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      console.log('Error in createPost:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Failed to create post';
      throw error;
    }
  },
  getPosts: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/user/get-post?page=${page}`);
      // Only set posts if we are loading first page, or we can just return it to let component handle it
      return response.data;
    } catch (error: any) {
      console.log('Error in getPosts:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Failed to fetch posts';
      set({ loading: false, error: errorMsg });
      throw error;
    }
  },
  getPostDetails: async (id: string | number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/user/get-post/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      console.log('Error in getPostDetails:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Failed to fetch post details';
      set({ loading: false, error: errorMsg });
      throw error;
    }
  },
  toggleLikePost: async (postId: string | number) => {
    try {
      const response = await api.post('/user/like-post', { post_id: postId });
      return response.data;
    } catch (error: any) {
      console.log('Error in toggleLikePost:', error.response?.data || error.message);
      throw error;
    }
  },
  getComments: async (postId: string | number) => {
    try {
      const response = await api.get(`/user/get-comments/${postId}`);
      return response.data;
    } catch (error: any) {
      console.log('Error in getComments:', error.response?.data || error.message);
      throw error;
    }
  },
  commentPost: async (postId: string | number, comment: string) => {
    try {
      const response = await api.post('/user/comment-post', { post_id: postId, comment });
      return response.data;
    } catch (error: any) {
      console.log('Error in commentPost:', error.response?.data || error.message);
      throw error;
    }
  },
  deleteComment: async (commentId: string | number) => {
    try {
      const response = await api.delete('/user/delete-comment', { data: { comment_id: commentId } });
      return response.data;
    } catch (error: any) {
      console.log('Error in deleteComment:', error.response?.data || error.message);
      throw error;
    }
  },
  getmypost: async () => {
    try {
      const response = await api.get('/user/my-posts');
      return response.data;
    } catch (error: any) {
      console.log('Error in deleteComment:', error.response?.data || error.message);
      throw error;
    }
  },
  deletePostStore: async (postId: string | number) => {
    try {
      const response = await api.delete('/user/delete-post', { data: { id: postId } });
      return response.data;
    } catch (error: any) {
      console.log('Error in deletePostStore:', error.response?.data || error.message);
      throw error;
    }
  },
  updatePostStore: async (formData: any) => {
    try {
      const response = await api.post('/user/update-post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.log('Error in updatePostStore:', error.response?.data || error.message);
      throw error;
    }
  },
  getPlansStore: async () => {
    try {
      const response = await api.get('/user/plans');
      return response.data;
    } catch (error: any) {
      console.log('Error in getPlansStore:', error.response?.data || error.message);
      throw error;
    }
  },
  purchasePlanStore: async (payload) => {
    try {
      const response = await api.post('/user/purchase-plan', payload);
      return response.data;
    } catch (error: any) {
      console.log('Error in purchasePlanStore:', error.response?.data || error.message);
      throw error;
    }
  }
}));

export default useHomeStore;
