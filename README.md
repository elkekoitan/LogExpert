# LogExpert

Advanced log management, incident tracking, and application monitoring platform for modern development teams.

## Features

- 🔍 **Real-time Log Search** - Stream and search through millions of log entries with advanced filtering
- 🚨 **Incident Management** - Automatically detect, track, and resolve incidents with intelligent alerting
- 📊 **Analytics & Insights** - Gain deep insights into application performance with detailed analytics
- ⚡ **Fast Performance** - Lightning-fast search and filtering across terabytes of log data
- 🎨 **Modern UI** - Clean, intuitive interface inspired by Better Stack
- 🌙 **Dark/Light Mode** - Comfortable viewing in any environment

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Headless UI
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd logexpert
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js 14 App Router
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Main dashboard
│   ├── logs/           # Log management
│   ├── incidents/      # Incident management
│   └── layout.tsx      # Root layout
├── components/         # Reusable UI components
│   ├── ui/            # Base UI components
│   ├── forms/         # Form components
│   └── charts/        # Chart components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── store/             # Zustand stores
├── types/             # TypeScript type definitions
└── utils/             # Helper utilities
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

This project uses:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

## Design System

The project follows a comprehensive design system with:

- **Color Palette**: Dark mode primary with purple accent (#6A5AF9)
- **Typography**: Inter font family with consistent sizing scale
- **Spacing**: 8px-based grid system
- **Components**: Reusable UI components with consistent styling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
