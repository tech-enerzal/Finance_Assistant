"""
@fileoverview
This Flask application serves as the backend for the Business Sector Chatbot.
It handles user authentication (signup and login with TOTP), file uploads, and chat interactions via the Gemini API.
Also includes logic for first-time login redirection to a financial information form.

@version 2.0
"""

import os
import base64
import logging
import bcrypt
import pyotp
import qrcode
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from dotenv import load_dotenv
import AI  # Import the AI module for chat and file handling

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

# Initialize the Flask application
app = Flask(__name__)
CORS(app)

# MongoDB Atlas connection and JWT configuration
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
jwt = JWTManager(app)
client = MongoClient(MONGO_URI)
db = client["KPR_Business_chatbot"]
users = db["Employee_Credentials"]

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chatbot endpoint for handling messages and streaming responses."""
    try:
        data = request.json
        messages = data.get('messages')
        if not messages or not isinstance(messages, list):
            return jsonify({'error': 'Invalid messages format'}), 400

        # Use the AI module to stream the response
        return AI.stream_generate_content(messages)

    except Exception as e:
        logging.exception("Failed to fetch the assistant response.")
        return jsonify({'error': f'Failed to fetch the assistant response: {str(e)}'}), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Endpoint for uploading and processing files."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Use the AI module to handle the file upload and return response
    return AI.upload_file(file)

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Signup endpoint to register a new user with TOTP and set first-time login flag."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Check if the user already exists
        if users.find_one({"email": email}):
            return jsonify({"msg": "User already exists"}), 400

        # Generate TOTP secret
        totp_secret = pyotp.random_base32()

        # Save user in the database with is_first_time flag
        users.insert_one({
            "email": email,
            "password": hashed_password,
            "two_factor_enabled": True,
            "two_factor_secret": totp_secret,
            "is_first_time": True  # Set flag to True for first-time login
        })

        # Generate TOTP URI and QR code
        totp = pyotp.TOTP(totp_secret)
        uri = totp.provisioning_uri(email, issuer_name="ChatbotApp")
        img = qrcode.make(uri)
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        qrcode_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        return jsonify({"msg": "User registered successfully.", "qrcode": qrcode_base64}), 201

    except Exception as e:
        logging.exception("Signup failed.")
        return jsonify({"msg": "Signup failed", "error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login endpoint with JWT, TOTP verification, and first-time login check."""
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']
        token = data.get('token')

        # Find user in database
        user = users.find_one({"email": email})

        # Verify credentials and TOTP token
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'msg': 'Invalid credentials'}), 400
        if not token:
            return jsonify({'msg': '2FA required'}), 401
        totp = pyotp.TOTP(user['two_factor_secret'])
        if not totp.verify(token):
            return jsonify({'msg': 'Invalid 2FA token'}), 400

        # Check if the user is logging in for the first time
        if user.get('is_first_time', False):
            # Generate JWT token for the first-time login
            access_token = create_access_token(identity=email)
            return jsonify({
                'token': access_token,
                'first_time': True  # Indicate that the user should complete the form
            }), 200

        # Generate JWT token for a regular login
        access_token = create_access_token(identity=email)
        return jsonify({'token': access_token, 'first_time': False}), 200

    except Exception as e:
        logging.exception("Login failed.")
        return jsonify({'msg': "Login failed", "error": str(e)}), 500

@app.route('/api/auth/complete_profile', methods=['POST'])
@jwt_required()
def complete_profile():
    """Endpoint to mark the user as having completed their profile."""
    email = get_jwt_identity()
    try:
        # Update is_first_time to False after form submission
        users.update_one({"email": email}, {"$set": {"is_first_time": False}})
        return jsonify({"msg": "Profile completion status updated successfully."}), 200
    except Exception as e:
        logging.exception("Failed to update profile completion status.")
        return jsonify({"msg": "Failed to update profile completion status", "error": str(e)}), 500

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def profile():
    """Protected route to retrieve user's profile information."""
    email = get_jwt_identity()
    user = users.find_one({"email": email}, {"_id": 0, "password": 0, "two_factor_secret": 0})
    return jsonify(user), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
