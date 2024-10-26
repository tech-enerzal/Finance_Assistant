# AI.py

import os
import google.generativeai as genai
import PyPDF2
import docx
from werkzeug.utils import secure_filename
from flask import jsonify, Response
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Configure the SDK with the API key
genai.configure(api_key=GOOGLE_API_KEY)

UPLOAD_FOLDER = 'Prototype/Backend/Temp'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx'}

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def read_file_content(file_path, file_type):
    """Extracts content based on file type."""
    if file_type == 'txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    elif file_type == 'pdf':
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            return ''.join([page.extract_text() for page in reader.pages])
    elif file_type == 'docx':
        doc = docx.Document(file_path)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])
    return ''

def upload_file(file):
    """Handles file uploads, extracts content, and returns as JSON response."""
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file.save(file_path)

    file_type = filename.rsplit('.', 1)[1].lower()
    file_content = read_file_content(file_path, file_type)
    os.remove(file_path)

    return jsonify({'content': file_content}), 200

def stream_generate_content(messages):
    """Streams chat responses from the Gemini API based on user messages."""
    try:
        # Prepare the input prompt from the user messages
        prompt = "\n".join([message["content"] for message in messages if message["role"] == "user"])

        # Use the SDK to generate a response
        response = genai.GenerativeModel("gemini-1.5-flash").generate_content(prompt, stream=True)

        def generate_stream():
            for chunk in response:
                yield chunk.text + '\n'

        return Response(generate_stream(), content_type='application/json')

    except Exception as e:
        return jsonify({'error': f'Error generating content: {str(e)}'}), 500
