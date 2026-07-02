export interface MemberProfile {
  userId: string;
  name: string;
  avatar: string;
  bio: string;
  badge: string;
  designation?: string;
  // Private information - MUST NOT be rendered on public profile
  phone?: string;
  email?: string;
  memberId?: string;
  donationInfo?: string;
}

export const MOCK_USERS: Record<string, MemberProfile> = {
  user_rahul: {
    userId: 'user_rahul',
    name: 'Rahul Sharma',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=120',
    bio: 'Dedicated to Gau Seva. Passionate about feeding and medical care of our beloved cows. Volunteering since 2024.',
    badge: 'Verified Sevak',
    designation: 'Lead Volunteer',
    phone: '+91 98765 00001',
    email: 'rahul.sharma@example.com',
    memberId: 'GMT-1024-2024',
    donationInfo: '₹25,000 Donated',
  },
  user_priya: {
    userId: 'user_priya',
    name: 'Priya Patel',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Organizing green grass distribution and shelter maintenance drives. Let\'s make our community strong and compassionate.',
    badge: 'Volunteer Coordinator',
    designation: 'Community Organizer',
    phone: '+91 98765 00002',
    email: 'priya.patel@example.com',
    memberId: 'GMT-2048-2025',
    donationInfo: '₹50,000 Donated',
  },
  user_vikram: {
    userId: 'user_vikram',
    name: 'Vikram Singh',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    bio: 'Grateful to contribute to the welfare of Gau Mata. Promoting organic farming and indigenous cow preservation.',
    badge: 'Donor',
    designation: 'Patron Member',
    phone: '+91 98765 00003',
    email: 'vikram.singh@example.com',
    memberId: 'GMT-4096-2026',
    donationInfo: '₹1,00,000 Donated',
  },
  current_user: {
    userId: 'current_user',
    name: 'Ananda Das',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
    bio: 'Passionate about animal welfare and Vedic heritage. Supporting local Gaushalas to preserve indigenous breeds.',
    badge: 'Patron Member',
    designation: 'Gau Sevak • Trustee',
    phone: '+91 98765 43210',
    email: 'anandadas@gmail.com',
    memberId: 'GMT-8394-2026',
    donationInfo: '₹12,500 Donated',
  }
};
