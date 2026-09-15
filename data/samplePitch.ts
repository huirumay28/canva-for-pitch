import { PitchData } from '@/types/pitch';

export const samplePitch: PitchData = {
  id: 'sample-1',
  title: 'Spring 2027 Digital Campaign Launch',
  brief: 'Create a comprehensive digital campaign targeting Gen Z consumers with focus on sustainability and authentic brand storytelling.',
  product: {
    name: 'EcoFlow Activewear',
    description: 'Sustainable athletic wear made from recycled ocean plastics',
    category: 'Fashion & Lifestyle'
  },
  client: {
    name: 'GreenThread Co.',
    industry: 'Sustainable Fashion',
    background: 'Founded in 2020, GreenThread is a B-Corp certified sustainable fashion brand with $15M annual revenue and 85% YoY growth. Current market presence primarily in coastal US cities with expanding international interest.'
  },
  insights: {
    trends: [
      'Gen Z prioritizes sustainability in purchasing decisions (73% willing to pay more)',
      'Short-form video content dominates engagement (TikTok, Reels, Shorts)',
      'Influencer authenticity matters more than follower count',
      'Circular fashion economy gaining mainstream traction'
    ],
    opportunities: [
      'Partner with micro-influencers in outdoor/fitness space',
      'Leverage user-generated content for authentic storytelling',
      'Create educational content about ocean plastic impact',
      'Develop limited edition collections with transparent supply chain stories'
    ],
    challenges: [
      'Market saturation in sustainable fashion space',
      'Higher production costs than fast fashion competitors',
      'Building trust with skeptical consumers (greenwashing concerns)',
      'Limited brand awareness outside core markets'
    ]
  },
  deliverables: [
    '3-month social media content calendar',
    '12 short-form video assets',
    'Influencer partnership strategy and outreach',
    'Email marketing campaign (6 touchpoints)',
    'Landing page optimization',
    'Performance dashboard and weekly reports'
  ],
  constraints: {
    budget: '$120,000',
    timeline: '16 weeks (Strategy: 2 weeks, Production: 8 weeks, Launch & Monitor: 6 weeks)',
    requirements: [
      'All content must align with B-Corp sustainability standards',
      'Minimum 30% content must feature real customers',
      'No partnerships with fast fashion influencers',
      'Accessibility compliance for all digital assets'
    ]
  },
  metrics: [
    {
      name: 'Target Impressions',
      value: 2500000,
      unit: 'impressions',
      trend: 'up'
    },
    {
      name: 'Engagement Rate',
      value: 4.2,
      unit: '%',
      trend: 'up'
    },
    {
      name: 'Conversion Rate',
      value: 3.5,
      unit: '%',
      trend: 'up'
    },
    {
      name: 'Cost Per Acquisition',
      value: 28,
      unit: '$',
      trend: 'down'
    },
    {
      name: 'Brand Awareness Lift',
      value: 35,
      unit: '%',
      trend: 'up'
    },
    {
      name: 'Video Completion Rate',
      value: 68,
      unit: '%',
      trend: 'up'
    }
  ],
  visuals: [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1445384763658-0400939829cd?w=800',
      caption: 'Ocean conservation - core brand value',
      category: 'Brand Values'
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      caption: 'Sustainable activewear design inspiration',
      category: 'Product'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800',
      caption: 'Target audience lifestyle',
      category: 'Audience'
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      caption: 'Data-driven approach',
      category: 'Strategy'
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      caption: 'Collaborative team environment',
      category: 'Process'
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      caption: 'Creative brainstorming',
      category: 'Creative'
    }
  ],
  keySummary: {
    objective: 'Launch comprehensive digital campaign to increase brand awareness by 35% and drive $500K in attributed revenue among Gen Z consumers through authentic sustainability storytelling.',
    approach: 'Multi-channel strategy combining micro-influencer partnerships, user-generated content, and educational short-form video to build trust and showcase transparent supply chain. Focus on TikTok, Instagram Reels, and YouTube Shorts.',
    expectedOutcome: 'Achieve 2.5M impressions, 4.2% engagement rate, and establish GreenThread as a trusted voice in sustainable activewear. Build foundation for long-term community growth and repeat purchases.'
  }
};
