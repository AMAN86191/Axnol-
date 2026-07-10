export interface GalleryPhoto {
  id: string;
  title: string;
  image: any;
  isLocal?: boolean;
}

export interface GalleryEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  coverImage: any;
  isLocalCover?: boolean;
  description: string;
  photos: GalleryPhoto[];
}

export const galleryEvents: GalleryEvent[] = [
  {
    id: 'event_1',
    title: 'Morning Gaushala Aarti & Seva',
    date: '08 July 2026',
    location: 'Vrindavan Dham Gaushala',
    category: 'Gaushala Seva',
    coverImage: require('../../assets/images/gaushala.png'),
    isLocalCover: true,
    description: 'Our daily morning rituals include a peaceful Gau Aarti, followed by cleaning the sheds and serving fresh water to all cows. Devotees join to seek blessings.',
    photos: [
      {
        id: 'p1_1',
        title: 'Morning Gaushala Prayer & Aarti',
        image: require('../../assets/images/gaushala.png'),
        isLocal: true,
      },
      {
        id: 'p1_2',
        title: 'Healthy Cows in Morning Pasture',
        image: { uri: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600' },
      },
      {
        id: 'p1_3',
        title: 'Shed Cleaning and Preparation',
        image: { uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600' },
      },
      {
        id: 'p1_4',
        title: 'Fresh Water Feeder Maintenance',
        image: { uri: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600' },
      },
    ],
  },
  {
    id: 'event_2',
    title: 'Cow Medical & Healing Camp',
    date: '05 July 2026',
    location: 'Barsana Recovery Wing',
    category: 'Medical Care',
    coverImage: { uri: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600' },
    isLocalCover: false,
    description: 'A special camp conducted by senior veterinarians to treat injured cows, dress wounds, and administer vaccines and supplements to calves.',
    photos: [
      {
        id: 'p2_1',
        title: 'Newborn Calf Medical Seva',
        image: { uri: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600' },
      },
      {
        id: 'p2_2',
        title: 'Wound Dressing & Disinfection',
        image: { uri: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600' },
      },
      {
        id: 'p2_3',
        title: 'Calf Health Checkup by Veterinary Doctor',
        image: require('../../assets/images/calf.png'),
        isLocal: true,
      },
      {
        id: 'p2_4',
        title: 'Providing Nutritious Cattle Feed Supplements',
        image: { uri: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=600' },
      },
    ],
  },
  {
    id: 'event_3',
    title: 'Weekly Green Fodder Drive',
    date: '30 June 2026',
    location: 'Main Feeder Station',
    category: 'Fodder Drive',
    coverImage: require('../../assets/images/event.png'),
    isLocalCover: true,
    description: 'Weekly community distribution drive of green fodder, organic jaggery, and nutrition cakes to cows in Vrindavan and surrounding regions.',
    photos: [
      {
        id: 'p3_1',
        title: 'Weekly Trust Seva Event Kickoff',
        image: require('../../assets/images/event.png'),
        isLocal: true,
      },
      {
        id: 'p3_2',
        title: 'Daily Green Fodder Drive Loading',
        image: { uri: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=600' },
      },
      {
        id: 'p3_3',
        title: 'Cows Enjoying Organic Green Grass',
        image: { uri: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600' },
      },
    ],
  },
  {
    id: 'event_4',
    title: 'Gaushala Shed Construction',
    date: '15 June 2026',
    location: 'Campus West Sector',
    category: 'Infrastructure',
    coverImage: { uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600' },
    isLocalCover: false,
    description: 'We are expanding the shelter facilities to accommodate 300 more rescued cows. The construction focuses on providing optimal cross-ventilation and weather protection.',
    photos: [
      {
        id: 'p4_1',
        title: 'Gaushala Shed Construction Site',
        image: { uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600' },
      },
      {
        id: 'p4_2',
        title: 'Shed Structure Foundation Laying',
        image: { uri: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=600' },
      },
      {
        id: 'p4_3',
        title: 'Nutritious Storage Shed Setup',
        image: { uri: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?q=80&w=600' },
      },
    ],
  },
  {
    id: 'event_5',
    title: 'Calf Care & Sponsorship Campaign',
    date: '01 June 2026',
    location: 'Nursery & Calf Ward',
    category: 'Calves & Sponsorship',
    coverImage: require('../../assets/images/calf.png'),
    isLocalCover: true,
    description: 'A special event welcoming donors to meet the calves they sponsor. Activities include bottle-feeding milk to orphaned calves and applying turmeric pastes.',
    photos: [
      {
        id: 'p5_1',
        title: 'Sponsorship Calf Care Program',
        image: require('../../assets/images/calf.png'),
        isLocal: true,
      },
      {
        id: 'p5_2',
        title: 'Calves Drinking Clean Fresh Water',
        image: { uri: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600' },
      },
      {
        id: 'p5_3',
        title: 'Injured Calf Treatment and Feeding',
        image: { uri: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600' },
      },
    ],
  },
];
