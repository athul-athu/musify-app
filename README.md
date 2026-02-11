# Musify - Music Streaming App

A React Native music streaming app built with Expo, featuring YouTube music search and Supabase authentication.

## Features

- 🎵 YouTube Music Search
- 🎧 Audio Playback
- 👤 User Authentication (Supabase)
- 📱 Cross-platform (iOS & Android)

## Setup

### Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- Expo Go app on your mobile device

### Installation

1. Clone the repository
```bash
git clone https://github.com/athul-athu/musify-app.git
cd musify
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory (use `.env.example` as template)
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
```

### Getting API Keys

#### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key to your `.env` file

#### Supabase
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings > API
4. Copy the URL and anon/public key to your `.env` file

## Running the App

```bash
npm start
```

Then scan the QR code with Expo Go app on your mobile device.

## How It Works

### YouTube Audio Extraction

The app uses the Invidious API (a privacy-friendly YouTube frontend) to extract direct audio streams from YouTube videos. The process:

1. User searches for music using YouTube Data API v3
2. When a song is selected, the app fetches the direct audio URL using Invidious
3. The audio stream is played using `expo-audio`

**Note**: Invidious instances can be unreliable. For production use, consider:
- Setting up your own Invidious instance
- Using a backend service with youtube-dl
- Implementing a fallback mechanism

### Authentication

User authentication is handled by Supabase, providing:
- Email/password sign up and login
- Session management
- Profile image storage

## Project Structure

```
musify/
├── src/
│   ├── screens/         # App screens
│   ├── navigation/      # Navigation configuration
│   ├── context/         # React Context (Auth)
│   ├── lib/            # Third-party integrations (Supabase)
│   ├── utils/          # Utility functions (YouTube audio)
│   └── constants/      # App constants (Colors, etc.)
├── assets/             # Images and static files
├── .env               # Environment variables (not committed)
├── .env.example       # Environment variables template
└── app.json           # Expo configuration
```

## Security

- All API keys are stored in `.env` file
- `.env` is added to `.gitignore` to prevent accidental commits
- Use `.env.example` as a template for team members

## Known Limitations

1. **YouTube Audio**: Direct YouTube playback may not work due to API limitations. The app attempts to extract audio streams via Invidious.
2. **Invidious Reliability**: Public Invidious instances can be slow or unavailable.
3. **Audio Quality**: Audio quality depends on available streams from YouTube.

## Future Improvements

- [ ] Implement own backend for YouTube audio extraction
- [ ] Add playlist functionality
- [ ] Implement offline playback
- [ ] Add more music sources (SoundCloud, Spotify, etc.)
- [ ] Improve error handling and user feedback

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
