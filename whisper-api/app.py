import os
import tempfile
import json
import time
import whisper
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload settings
UPLOAD_FOLDER = tempfile.gettempdir()
HISTORY_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'history')
AUDIO_FOLDER = os.path.join(HISTORY_FOLDER, 'audio')
HISTORY_FILE = os.path.join(HISTORY_FOLDER, 'history.json')
ALLOWED_EXTENSIONS = {'mp3', 'wav', 'mp4', 'm4a', 'ogg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max upload

# Create history and audio folders if they don't exist
os.makedirs(HISTORY_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

# Initialize history file if it doesn't exist
if not os.path.exists(HISTORY_FILE):
    with open(HISTORY_FILE, 'w') as f:
        json.dump([], f)

# Load Whisper model (this will download the model on first run)
# Options: tiny, base, small, medium, large
MODEL_SIZE = os.environ.get('WHISPER_MODEL_SIZE', 'medium')
logger.info(f"Loading Whisper model: {MODEL_SIZE}")
model = whisper.load_model(MODEL_SIZE)
logger.info("Whisper model loaded successfully")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Helper function to get history items
def get_history_items():
    try:
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

# Helper function to save history items
def save_history_items(items):
    with open(HISTORY_FILE, 'w') as f:
        json.dump(items, f)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    start_time = time.time()
    logger.info("Received transcription request")
    
    # Check if file is in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({'error': f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'}), 400
    
    try:
        # Save the file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        logger.info(f"File saved to {filepath}")
        
        # Get parameters from request
        language = request.form.get('language', None)  # 'en', 'zh', etc.
        response_format = request.form.get('response_format', 'verbose_json')
        
        # Transcribe the audio
        logger.info(f"Starting transcription with language={language}, format={response_format}")
        transcribe_options = {
            'task': 'transcribe',
            'verbose': True
        }
        
        if language:
            transcribe_options['language'] = language
        
        result = model.transcribe(filepath, **transcribe_options)
        logger.info("Transcription completed")
        
        # Format the response
        if response_format == 'verbose_json':
            # Process segments to match the expected format in the frontend
            segments = []
            for i, segment in enumerate(result['segments']):
                segments.append({
                    'id': i,
                    'start': segment['start'],
                    'end': segment['end'],
                    'text': segment['text'].strip()
                })
            
            response_data = {
                'text': result['text'],
                'segments': segments,
                'language': result['language']
            }
        else:
            # Simple text response
            response_data = {'text': result['text']}
        
        # Save the audio file permanently if save_to_history is true
        if request.form.get('save_to_history', 'false').lower() == 'true':
            # Generate a unique ID for the history item
            item_id = str(uuid.uuid4())
            
            # Save the audio file permanently
            audio_filename = f"{item_id}_{filename}"
            audio_filepath = os.path.join(AUDIO_FOLDER, audio_filename)
            file.seek(0)  # Reset file pointer
            file.save(audio_filepath)
            
            # Create a history item
            history_item = {
                'id': item_id,
                'fileName': filename,
                'date': datetime.now().isoformat(),
                'audioUrl': f"/history/audio/{audio_filename}",
                'transcription': response_data
            }
            
            # Add to history
            history_items = get_history_items()
            history_items.insert(0, history_item)  # Add to beginning
            save_history_items(history_items)
            
            # Add the ID to the response
            response_data['id'] = item_id
        
        # Clean up the temporary file
        os.remove(filepath)
        logger.info(f"Temporary file {filepath} removed")
        
        # Log processing time
        processing_time = time.time() - start_time
        logger.info(f"Transcription completed in {processing_time:.2f} seconds")
        
        return jsonify(response_data)
    
    except Exception as e:
        logger.error(f"Error during transcription: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    try:
        history_items = get_history_items()
        return jsonify(history_items)
    except Exception as e:
        logger.error(f"Error getting history: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/history/<item_id>', methods=['DELETE'])
def delete_history_item(item_id):
    try:
        history_items = get_history_items()
        
        # Find the item to delete
        item_to_delete = next((item for item in history_items if item['id'] == item_id), None)
        if not item_to_delete:
            return jsonify({'error': 'History item not found'}), 404
        
        # Delete the audio file
        audio_filename = os.path.basename(item_to_delete['audioUrl'])
        audio_filepath = os.path.join(AUDIO_FOLDER, audio_filename)
        if os.path.exists(audio_filepath):
            os.remove(audio_filepath)
        
        # Remove the item from history
        history_items = [item for item in history_items if item['id'] != item_id]
        save_history_items(history_items)
        
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"Error deleting history item: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/history/audio/<path:filename>', methods=['GET'])
def get_audio_file(filename):
    try:
        # Extract the ID from the filename parameter
        # The filename could be either just the ID or ID_originalfilename.ext
        file_id = filename.split('_')[0]
        
        # Find the actual filename in the audio folder that starts with this ID
        actual_filename = None
        for file in os.listdir(AUDIO_FOLDER):
            if file.startswith(file_id + '_'):
                actual_filename = file
                break
        
        # If we couldn't find a file with this ID prefix, try using the original filename
        if not actual_filename and os.path.exists(os.path.join(AUDIO_FOLDER, filename)):
            actual_filename = filename
        
        if not actual_filename:
            logger.error(f"Audio file with ID {file_id} not found")
            return jsonify({'error': 'Audio file not found'}), 404
        
        # Determine the MIME type based on file extension
        file_ext = actual_filename.rsplit('.', 1)[1].lower() if '.' in actual_filename else ''
        mime_types = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'mp4': 'audio/mp4',
            'm4a': 'audio/mp4',
            'ogg': 'audio/ogg'
        }
        mimetype = mime_types.get(file_ext, 'audio/mpeg')
        
        logger.info(f"Serving audio file: {actual_filename} with MIME type: {mimetype}")
        return send_from_directory(AUDIO_FOLDER, actual_filename, mimetype=mimetype)
    except Exception as e:
        logger.error(f"Error serving audio file {filename}: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model': MODEL_SIZE})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 9000))
    app.run(host='0.0.0.0', port=port, debug=True) 