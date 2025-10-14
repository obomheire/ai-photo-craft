# AI Photo Craft

AI Photo Craft is a powerful web-based image editing application built with Next.js, featuring AI-powered editing capabilities, real-time collaboration, and a modern user interface.

## Features

- **AI-Powered Editing**

  - AI Background Removal/Replacement
  - AI Image Extension
  - Smart AI Editing Tools

- **Professional Editing Tools**

  - Resize & Crop
  - Adjustment Controls
  - Text Overlay
  - Advanced Image Manipulation

- **Project Management**

  - Cloud Storage
  - Project Organization
  - Version History
  - Real-time Auto-save

- **Collaboration**

  - User Authentication (Clerk)
  - Project Sharing
  - Real-time Updates (Convex)

- **Export Options**
  - Multiple Format Support (PNG, JPEG, WebP)
  - Quality Control
  - Custom Resolution

## Tech Stack

- **Frontend**

  - Next.js 15.3
  - React 19
  - TailwindCSS
  - shadcn/ui Components
  - Fabric.js for Canvas Manipulation

- **Backend & Services**

  - Convex for Backend & Real-time
  - Clerk for Authentication
  - ImageKit for Image Processing
  - Next.js API Routes

- **State Management**
  - React Context
  - Custom Hooks
  - Convex Real-time State

## Project Structure

```
ai-photo-craft/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication Routes
│   ├── (main)/            # Main Application Routes
│   │   ├── dashboard/     # Project Dashboard
│   │   └── editor/        # Image Editor
│   └── api/               # API Routes
├── components/            # Shared Components
│   ├── ui/               # UI Components
│   └── ...               # Feature Components
├── convex/               # Backend Functions
├── context/              # React Context
├── hooks/               # Custom React Hooks
└── lib/                # Utility Functions
```

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-photo-craft
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your:

   - Clerk API Keys
   - Convex Deployment URL
   - ImageKit Configuration

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk authentication
- `CLERK_SECRET_KEY`: Clerk secret key
- `NEXT_PUBLIC_CONVEX_URL`: Convex deployment URL
- `NEXT_PUBLIC_IMAGEKIT_URL`: ImageKit URL
- `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`: ImageKit public key
- `IMAGEKIT_PRIVATE_KEY`: ImageKit private key

## Features by Plan

### Free Plan

- Basic editing tools (Resize, Crop, Adjust)
- Up to 20 exports per month
- Standard quality exports
- Basic cloud storage

### Pro Plan

- All basic features
- Unlimited exports
- AI-powered tools
- Premium support
- Advanced collaboration features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary. All rights reserved.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [Clerk](https://clerk.com/)
- Backend powered by [Convex](https://www.convex.dev/)
- Image processing by [ImageKit](https://imagekit.io/)
