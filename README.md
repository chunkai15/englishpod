# EnglishPod - Personal Learning Player

A lightweight, feature-rich web application for learning English through EnglishPod lessons. Built with vanilla HTML, CSS, and JavaScript.

## ✨ Features

### 📚 Lesson Management
- **365 Lessons** organized by level and category
- **Group by Level**: Elementary, Pre-Intermediate, Intermediate, Upper-Intermediate, Advanced, Business English
- **Filter by Level & Category**: Quickly find lessons
- **Mark as Completed**: Track your learning progress with checkboxes
- **Resume Last Lesson**: Automatically restores your last played lesson and audio position

### 🎵 Audio Player
- **Full Controls**: Play, pause, seek
- **Playback Speed**: 0.5×, 0.75×, 1×, 1.25×, 1.5×
- **Loop Mode**: Repeat lessons for practice
- **Volume Control**: Adjustable with default 40%
- **Auto-Save Progress**: Audio position saved every 3 seconds

### 📝 Transcript Features
- **Clean, Readable Layout**: Dialogue with speaker badges
- **Vocabulary Sections**: Key and supplementary vocabulary
- **Click to Highlight**: Manual highlighting of lines
- **Auto-Highlight** (with subtitles): Automatically highlights current line being spoken
- **Show/Hide Toggle**: Focus on listening or reading
- **Smooth Scrolling**: Auto-scroll to current line

### 💾 Data Persistence
- **LocalStorage**: All progress saved locally
- **No Backend Required**: Runs entirely in browser
- **Privacy First**: No tracking, no analytics

## 🚀 Quick Start

### 1. Clone or Download

```bash
git clone <your-repo-url>
cd EnglishPod
```

### 2. Serve Locally

You need a local server (can't open `index.html` directly due to CORS).

**Option A: Python**
```bash
python -m http.server 8000
```

**Option B: Node.js**
```bash
npx serve
```

**Option C: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### 3. Open in Browser

```
http://localhost:8000
```

## 📁 Project Structure

```
EnglishPod/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # All styles
├── js/
│   ├── app.js             # Main application logic
│   ├── player.js          # Audio player controls
│   ├── state.js           # LocalStorage management
│   └── subtitle-sync.js   # Auto-highlight with subtitles
├── transcript/            # Local transcript HTML files
│   ├── englishpod_0001.html
│   ├── englishpod_0002.html
│   └── ...
├── subtitles/             # (Optional) VTT subtitle files
│   ├── englishpod_0001.vtt
│   └── ...
├── lessons.json           # Lesson metadata
└── generate-subtitles.js  # Script to generate subtitles
```

## 🎯 Auto-Highlight Feature

To enable automatic highlighting of transcript lines as audio plays:

### 1. Generate Subtitles

See [SUBTITLE_GENERATION.md](SUBTITLE_GENERATION.md) for detailed instructions.

**Quick version:**
```bash
# Install prerequisites
pip install -U openai-whisper
# Install ffmpeg (see guide)

# Generate subtitles
node generate-subtitles.js
```

### 2. How It Works

- Subtitles are generated using Whisper AI (runs locally)
- `.vtt` files contain timestamps for each phrase
- During playback, the app matches subtitle text with transcript lines
- Current line is auto-highlighted and scrolled into view

### 3. Visual Distinction

- **Manual highlight** (click): Yellow background
- **Auto-highlight** (from audio): Blue background with pulse animation

## 🎨 UI/UX Highlights

- **Clean, Modern Design**: Focus on learning, minimal distractions
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Subtle transitions and hover effects
- **Accessibility**: Keyboard navigation, ARIA labels, focus states
- **Professional Typography**: System fonts, clear hierarchy

## 📊 Data Sources

- **Audio & Transcripts**: Streamed from [Internet Archive](https://archive.org/details/englishpod_all)
- **For Personal Learning Only**: All content belongs to respective owners

## 🛠️ Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, Custom Properties
- **Vanilla JavaScript (ES6)**: No frameworks
- **LocalStorage API**: State persistence
- **Web Audio API**: Audio playback
- **Whisper AI** (optional): Subtitle generation

## 🔧 Configuration

### Change Default Volume

Edit `js/player.js`:
```javascript
this.audio.volume = 0.4; // Change to 0-1
```

### Change Whisper Model

Edit `generate-subtitles.js`:
```javascript
const WHISPER_MODEL = "base"; // tiny, base, small, medium, large
```

### Adjust Auto-Highlight Sensitivity

Edit `js/app.js`:
```javascript
if (score > 0.4) { // Lower = more lenient, Higher = more strict
```

## 📝 Development

### Add New Features

1. **State Management**: Add methods to `js/state.js`
2. **Player Controls**: Extend `js/player.js`
3. **UI Components**: Update `js/app.js` and `css/style.css`

### Code Style

- Clean, readable code
- Comments for complex logic
- Consistent naming conventions
- No external dependencies (except Whisper for subtitle generation)

## 🐛 Troubleshooting

### Lessons not loading
- Check if `lessons.json` exists
- Verify local server is running
- Check browser console for errors

### Audio not playing
- Check internet connection (audio streams from Internet Archive)
- Try a different lesson
- Check browser audio permissions

### Transcript not showing
- Check if transcript HTML exists in `transcript/` folder
- Falls back to iframe if local file not found
- Check browser console for CORS errors

### Auto-highlight not working
- Ensure subtitle file exists in `subtitles/` folder
- Check file naming: `englishpod_XXXX.vtt`
- Verify `subtitle-sync.js` is loaded

## 📄 License

This is a personal learning project. All EnglishPod content belongs to their respective owners.

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

## 📧 Support

For issues or questions, please check:
1. Browser console for errors
2. [SUBTITLE_GENERATION.md](SUBTITLE_GENERATION.md) for subtitle issues
3. This README for common problems

---

**Happy Learning! 📚🎧**



