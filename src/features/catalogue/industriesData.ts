export interface IndustryInfo {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  description: string;
  applications: string[];
}

export const INDUSTRIES_DATA: IndustryInfo[] = [
  {
    id: 'ind2',
    name: 'Automotive',
    subtitle: 'Engine & vehicle care',
    image: 'ind_automotive',
    description:
      'Engine oils, transmission fluids and greases that keep cars, bikes and commercial vehicles running smoothly, with less wear and longer service intervals.',
    applications: ['Engine oil', 'Gear oil', 'Brake fluid', 'Coolant', 'Grease'],
  },
  {
    id: 'ind1',
    name: 'Industrial',
    subtitle: 'Machinery protection',
    image: 'ind_industrial',
    description:
      'Hydraulic, compressor and gear lubricants built to protect factory machinery under heavy loads, helping reduce downtime and maintenance cost.',
    applications: [
      'Hydraulic systems',
      'Compressors',
      'Gearboxes',
      'Bearings',
      'Metalworking',
    ],
  },
  {
    id: 'ind4',
    name: 'Marine',
    subtitle: 'Marine engine care',
    image: 'ind_marine',
    description:
      'Lubricants made for marine engines and deck equipment, with strong protection against corrosion, water and salt.',
    applications: ['Marine engines', 'Stern tube', 'Deck machinery', 'Gears'],
  },
  {
    id: 'ind6',
    name: 'Construction',
    subtitle: 'Heavy equipment',
    image: 'ind_construction',
    description:
      'Tough oils and greases for excavators, loaders and cranes that work in dust, mud and high temperatures every day.',
    applications: ['Excavators', 'Loaders', 'Cranes', 'Hydraulic breakers'],
  },
  {
    id: 'ind3',
    name: 'Agriculture',
    subtitle: 'Farm equipment',
    image: 'ind_agricultural',
    description:
      'Reliable lubricants for tractors and farm machines, protecting engines and hydraulics through long seasons of field work.',
    applications: ['Tractors', 'Harvesters', 'Pumps', 'Implements'],
  },
  {
    id: 'ind8',
    name: 'Energy',
    subtitle: 'Power generation',
    image: 'ind_energy',
    description:
      'Turbine, transformer and generator lubricants designed for steady performance and long life in power plants.',
    applications: ['Generators', 'Turbines', 'Transformers', 'Wind gearboxes'],
  },
];

export const getIndustry = (id?: string): IndustryInfo | undefined =>
  INDUSTRIES_DATA.find(item => item.id === id);
