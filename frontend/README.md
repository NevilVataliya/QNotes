# QNotes

A modern, responsive React application for creating and sharing audio notes with AI transcription and smart organization features.

## Features

- 🎵 Audio recording and upload
- 🤖 AI-powered transcription
- 📝 Rich text editing
- 🔍 Advanced search and discovery
- 👥 Social features and user profiles
- 📱 Fully responsive design
- 🌙 Dark theme
- 🔐 Secure authentication

## Tech Stack

- **Frontend**: React 18.2.0 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit
- **Backend**: Appwrite
- **Routing**: React Router DOM

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.sample .env
   ```
   Fill in your Appwrite configuration
4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── appwrite/      # Backend service configuration
├── store/         # Redux store and slices
├── conf/          # Configuration files
└── assets/        # Static assets
```
