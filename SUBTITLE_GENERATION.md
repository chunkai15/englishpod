# Subtitle Generation Guide

This guide explains how to generate subtitle files for EnglishPod lessons using Whisper AI to enable auto-highlighting of transcript lines while audio plays.

## Prerequisites

### 1. Install Python 3.8+

**Windows:**
```powershell
winget install Python.Python.3.12
```

**macOS:**
```bash
brew install python@3.12
```

**Linux:**
```bash
sudo apt update && sudo apt install python3 python3-pip
```

### 2. Install Whisper

```bash
pip install -U openai-whisper
```

### 3. Install FFmpeg

**Windows:**
- Download from https://ffmpeg.org/download.html
- Or use: `winget install FFmpeg`

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

## Usage

### Generate Subtitles for All Lessons

```bash
node generate-subtitles.js
```

This will:
- Read all lessons from `lessons.json`
- Download/stream audio from Internet Archive
- Run Whisper to transcribe with timestamps
- Save `.vtt` files to `subtitles/` folder

### Generate for Limited Number (Testing)

```bash
LIMIT=5 node generate-subtitles.js
```

This generates subtitles for only the first 5 lessons.

## Whisper Models

The script uses the `base` model by default. You can change this in `generate-subtitles.js`:

| Model | Size | Speed | Accuracy |
|-------|------|-------|----------|
| tiny | 39M | Very Fast | Good |
| base | 74M | Fast | Better |
| small | 244M | Medium | Good |
| medium | 769M | Slow | Very Good |
| large | 1550M | Very Slow | Best |

For EnglishPod (clear audio), `base` or `small` is recommended.

## Output Format

Generated files are saved as:
```
subtitles/
  englishpod_0001.vtt
  englishpod_0002.vtt
  ...
```

### WebVTT Format Example

```
WEBVTT

00:00:00.000 --> 00:00:03.500
Thank you for coming tonight Mrs. Webber.

00:00:03.500 --> 00:00:07.000
As a teacher, it's great seeing the kid's parents.

00:00:07.500 --> 00:00:10.200
Of course! I am very interested to know how my child is doing.
```

## How Auto-Highlight Works

1. **Load Subtitle**: When a lesson is selected, `subtitle-sync.js` loads the corresponding `.vtt` file
2. **Parse Timestamps**: The VTT file is parsed into cues with start/end times and text
3. **Sync with Audio**: During playback, `timeupdate` event triggers subtitle sync
4. **Match & Highlight**: The system matches subtitle text with transcript lines and highlights the current one
5. **Smooth Scrolling**: The highlighted line scrolls into view automatically

## Troubleshooting

### "Whisper is not installed"
```bash
pip install -U openai-whisper
```

### "FFmpeg not found"
Make sure FFmpeg is in your system PATH.

### Subtitle not loading in app
- Check if `.vtt` file exists in `subtitles/` folder
- Check browser console for errors
- Verify file naming: `englishpod_XXXX.vtt` (4-digit code)

### Poor matching accuracy
- Whisper transcription might differ slightly from original transcript
- The text similarity threshold can be adjusted in `app.js` (`calculateTextSimilarity`)
- Consider using a larger Whisper model for better accuracy

## Performance Notes

- Generating subtitles for all 365 lessons takes **several hours**
- Each lesson takes ~30-60 seconds with `base` model
- Larger models are more accurate but much slower
- You can generate in batches and resume later (script skips existing files)

## Alternative: Manual Subtitle Creation

If you have existing subtitle files from other sources, you can:

1. Convert to WebVTT format
2. Place in `subtitles/` folder with correct naming
3. The app will automatically use them

## Cost & Privacy

- Whisper runs **locally** on your machine
- No API calls or cloud services required
- Completely free and private
- Only requires internet to download audio from Internet Archive

## Future Improvements

- [ ] Batch processing with progress bar
- [ ] Resume from last processed lesson
- [ ] Parallel processing for faster generation
- [ ] Quality validation and error recovery
- [ ] Support for other subtitle formats (SRT)



