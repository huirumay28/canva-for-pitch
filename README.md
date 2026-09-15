# Canva for Pitch

A role-based pitch orientation platform that optimizes how different team members consume pitch materials. The same content automatically adapts to show creatives visual collages, strategists data charts, and business roles executive summaries.

![Canva for Pitch Demo](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css)

## Features

### 🎯 Role-Based Views

- **Creative Role**: Visual collage layout with mood boards, images, and content inspiration
- **Strategy Role**: Data-driven charts, metrics, trends, and analytical insights  
- **Business Role**: Executive summaries with key objectives, deliverables, and outcomes

### ⚡ One-Click View Switching

Switch between Collage, Data Charts, and Summary views instantly. The same pitch content renders in three different formats optimized for different consumption styles.

### 📦 Demo-Ready

Built-in sample pitch pack (sustainable fashion campaign) so the demo works immediately without uploads. Real upload/paste functionality is UI-ready for production extension.

### 🎨 Clean Canva-Inspired UI

- Minimalist, organized design
- Smooth transitions and interactions
- Responsive layout for all screen sizes
- Beautiful gradient accents and shadows

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Images**: Unsplash (demo content)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd canva-for-pitch
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
canva-for-pitch/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main app orchestration
│   └── globals.css         # Global styles + Tailwind
├── components/
│   ├── Header.tsx          # App header with branding
│   ├── RoleSelector.tsx    # Role selection cards
│   ├── ViewSwitcher.tsx    # View toggle buttons
│   ├── CollageView.tsx     # Creative visual layout
│   ├── DataView.tsx        # Strategy data/charts view
│   └── SummaryView.tsx     # Business summary view
├── types/
│   └── pitch.ts            # TypeScript interfaces
├── data/
│   └── samplePitch.ts      # Demo pitch data
└── public/                 # Static assets
```

## Usage Flow

1. **Landing Page**: Introduction to the platform and its benefits
2. **Role Selection**: Choose Creative, Strategy, or Business role
3. **Viewing**: See pitch content in role-optimized format
4. **Switch Views**: Toggle between Collage, Data, and Summary anytime

## Key Components

### Data Model

The `PitchData` interface structures all pitch content:

- Brief & objectives
- Product & client information  
- Market insights (trends, opportunities, challenges)
- Deliverables & constraints
- Metrics with trends
- Visual assets with categorization
- Executive summary sections

### View Logic

Each role has a default view preference:
- Creative → Collage
- Strategy → Data  
- Business → Summary

Users can switch to any view regardless of role, maintaining flexibility while optimizing the initial presentation.

## Customization

### Adding New Pitch Content

Edit `data/samplePitch.ts` or extend the data model to support multiple pitches. The structure is fully typed for easy extension.

### Styling

Tailwind classes throughout. Custom Canva brand colors defined in:
- `tailwind.config.ts` (theme extension)
- `app/globals.css` (CSS variables)

### Views

Each view component (`CollageView`, `DataView`, `SummaryView`) is modular and can be customized independently.

## Future Enhancements

- File upload support (PDF, MD, TXT, images)
- Text paste with parsing
- Multiple pitch management
- Topic/section filtering
- Export to PDF/presentation formats
- Team collaboration features
- Custom view templates

## License

MIT

## Contributing

Contributions welcome! This is a demo project showcasing role-based content optimization patterns.

---

Built with ❤️ using Next.js + TypeScript + Tailwind CSS
