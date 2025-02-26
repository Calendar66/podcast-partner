# Whisper API for English Learning App

A local API server that uses OpenAI's Whisper model to transcribe audio files.

## Features

- Transcribe audio files (MP3, WAV, MP4, M4A, OGG)
- Return transcription with timestamps for each segment
- Support for language specification
- Server-side history storage for transcribed audio files
- API endpoints for managing history records
- Health check endpoint

## Prerequisites

- Conda (Miniconda or Anaconda)
- FFmpeg (required for audio processing)

## Setup

1. Install FFmpeg (if not already installed):
   - macOS: `brew install ffmpeg`
   - Ubuntu/Debian: `sudo apt-get install ffmpeg`
   - Windows: Download from [FFmpeg website](https://ffmpeg.org/download.html)

2. Create and activate the conda environment:
   ```bash
   conda env create -f environment.yml
   conda activate whisper-env
   ```

3. Run the API server:
   ```bash
   python app.py
   ```

   The server will start on http://localhost:9000

## API Endpoints

### Health Check

```
GET /health
```

Returns the status of the API and the model size being used.

### Transcribe Audio

```
POST /transcribe
```

Parameters (form-data):
- `file`: Audio file (MP3, WAV, MP4, M4A, OGG)
- `language` (optional): Language code (e.g., 'en', 'zh')
- `response_format` (optional): Format of the response ('verbose_json' or 'text')
- `save_to_history` (optional): Whether to save the transcription to history ('true' or 'false')

Response (verbose_json):
```json
{
  "text": "Full transcription text",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 2.5,
      "text": "Segment text"
    },
    ...
  ],
  "language": "en",
  "id": "unique-id" // Only included if save_to_history is true
}
```

### Get History Items

```
GET /history
```

Returns a list of all history items.

Response:
```json
[
  {
    "id": "unique-id",
    "fileName": "example.mp3",
    "date": "2023-02-26T12:34:56.789Z",
    "audioUrl": "/history/audio/unique-id_example.mp3",
    "transcription": {
      "text": "Full transcription text",
      "segments": [...],
      "language": "en"
    }
  },
  ...
]
```

### Delete History Item

```
DELETE /history/<item_id>
```

Deletes a history item and its associated audio file.

Response:
```json
{
  "success": true
}
```

### Get Audio File

```
GET /history/audio/<filename>
```

Serves the audio file with the appropriate MIME type.

## Environment Variables

- `WHISPER_MODEL_SIZE`: Size of the Whisper model to use (tiny, base, small, medium, large). Default: base
- `PORT`: Port to run the server on. Default: 9000

## Model Sizes

- `tiny`: Fastest, least accurate
- `base`: Good balance of speed and accuracy
- `small`: Better accuracy, slower
- `medium`: High accuracy, slower
- `large`: Highest accuracy, slowest

## History Storage

The application stores history records and audio files in the following locations:
- History records: `./history/history.json`
- Audio files: `./history/audio/`

These directories are created automatically if they don't exist.

## Troubleshooting

- If you encounter CUDA/GPU issues, the API will automatically fall back to CPU processing.
- For memory issues, try using a smaller model size by setting the `WHISPER_MODEL_SIZE` environment variable.
- If you encounter audio playback issues, check that the audio file is properly encoded and that the MIME type is correctly set. 