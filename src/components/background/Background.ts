type BackgroundType = 'Static Image' | 'Video' | '360 Image' | 'Chroma Key';

interface BackgroundProps {
  title: string;
  type: BackgroundType;
  collection: string;
  collectedDate: string;
  url: string;
  color?: string;
}

const availableBackgrounds = {
  'Static Image': [
    {
      title: 'Arcade',
      type: 'Static Image',
      collectedDate: '5h ago',
      collection: '',
      url: '/img/Arcade.webp',
    },
    {
      title: 'Breaking News',
      type: 'Static Image',
      collectedDate: '2h ago',
      collection: '',
      url: '/img/BreakingNews.webp',
    },
    {
      title: 'Dreamy',
      type: 'Static Image',
      collectedDate: '2h ago',
      collection: '',
      url: '/img/Dreamy.webp',
    },
    {
      title: 'Rock Planet',
      type: 'Static Image',
      collectedDate: '2h ago',
      collection: '',
      url: '/img/RockPlanet.webp',
    },
    {
      title: 'Spacecraft Interior',
      type: 'Static Image',
      collectedDate: '2h ago',
      collection: '',
      url: '/img/SpacecraftInterior.webp',
    },
    {
      title: 'Vaporwave',
      type: 'Static Image',
      collectedDate: '2h ago',
      collection: '',
      url: '/img/Vaporwave.webp',
    },
  ] as BackgroundProps[],
  '360 Image': [
    {
      title: 'Anime Seaside',
      type: '360 Image',
      collectedDate: '2d ago',
      collection: 'Anime Collection',
      url: '/img/hdri1.webp',
    },
    {
      title: 'Chinese Garden',
      type: '360 Image',
      collectedDate: '4d ago',
      collection: 'Anime Collection',
      url: '/img/hdri2.webp',
    },
    {
      title: 'CyberLab',
      type: '360 Image',
      collectedDate: '4d ago',
      collection: 'Cyberpunk Collection',
      url: '/img/hdri3.webp',
    },
  ] as BackgroundProps[],
  Video: [
    {
      title: 'COMING SOON',
      type: 'Video',
      collectedDate: 'Jan 7',
      collection: 'Video Collection',
      url: '',
    },
  ] as BackgroundProps[],
  Chroma: [
    {
      title: 'Green',
      type: 'Chroma Key',
      collectedDate: 'Jan 7',
      collection: 'Chroma Keys',
      color: '#0f0',
      url: '',
    },
    {
      title: 'Blue',
      type: 'Chroma Key',
      collectedDate: 'Jan 7',
      collection: 'Chroma Keys',
      color: '#00f',
      url: '',
    },
    {
      title: 'Custom',
      type: 'Chroma Key',
      collectedDate: 'Jan 7',
      collection: 'Chroma Keys',
      color: '#f00',
      url: '',
    },
  ] as BackgroundProps[],
};

// export { availableBackgrounds, type BackgroundProps };
