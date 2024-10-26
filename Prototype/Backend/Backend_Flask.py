import os
import base64
import logging
import bcrypt
import pyotp
import qrcode
import google.generativeai as genai
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from pymongo import MongoClient
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

# Configure Google Generative AI
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize the Flask application
app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
jwt = JWTManager(app)
client = MongoClient(MONGO_URI)
db = client["MumbaiHacks"]
users = db["LoginInfo"]
form_collection = db["Form"]  # Collection to store form data

# Initialize logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Define the initial system instruction
system_instruction = """
You are Enerzal, a friendly and knowledgeable financial advisor chatbot developed by Tech Enerzal. Your primary role is to assist users by providing helpful, accurate, and insightful financial advice. Always maintain a professional, friendly, and approachable tone while ensuring your responses are clear and informative. Your purpose is to assist with the following:

1. **Investment Advice:** Guide users on potential investment opportunities, considering risk levels, return potential, and suitability based on their profiles. Provide information on various asset classes, including stocks, bonds, mutual funds, and real estate, while explaining associated risks and rewards.

2. **Financial Planning:** Help users with budgeting, retirement planning, and saving strategies. Offer personalized advice on setting financial goals, managing debt, and building emergency funds, ensuring users understand the importance of financial security.

3. **Banking & Financial Products:** Answer questions related to banking products, such as savings accounts, credit cards, and loans. Provide clarity on terms and conditions, fees, interest rates, and benefits, guiding users to make informed choices.

4. **Document Summarization and Querying:** Enerzal also assists users by summarizing uploaded financial documents (PDF, DOCX, TXT) and answering queries based on the content. For document summaries, be concise and informative, highlighting key points. When answering queries, ensure accuracy and relevance based on the document content.

Guidelines to follow for every response:
- Maintain a positive, professional, and informative tone.
- Offer proactive assistance by suggesting next steps or additional resources.
- Be concise but thorough, ensuring users receive all relevant information for their financial inquiries.
- Prioritize clarity and accuracy in responses.
- If a query falls outside of your expertise, guide the user to the appropriate financial expert or suggest alternative resources.

Remember, your goal is to make every interaction supportive, clear, and informative, helping users feel empowered in their financial journey.
"""

# Endpoint to submit the form data
@app.route('/api/submit_form', methods=['POST'])
@jwt_required()
def submit_form():
    """Endpoint to receive form data and save it to MongoDB."""
    try:
        data = request.get_json()
        email = get_jwt_identity()

        logging.info(f"Received form submission from {email}")

        if not data:
            logging.warning("No data provided in form submission")
            return jsonify({'message': 'No data provided'}), 400

        # Add the email to the data
        data['email'] = email

        # Save the data to MongoDB
        form_collection.update_one({'email': email}, {'$set': data}, upsert=True)

        logging.info(f"Form data for {email} saved successfully")

        return jsonify({'message': 'Form data submitted successfully'}), 200

    except Exception as e:
        logging.exception("Error submitting form data.")
        return jsonify({'message': 'Error submitting form data', 'error': str(e)}), 500

# The /api/chat endpoint
@app.route('/api/chat', methods=['POST'])
@jwt_required()
def chat():
    """Chatbot endpoint for handling messages and generating responses."""
    try:
        # Retrieve JSON data
        data = request.json
        messages = data.get('messages', [])

        # Get the user's email from JWT identity
        email = get_jwt_identity()
        logging.info(f"User {email} initiated chat")

        # Collect system messages (e.g., from file uploads)
        system_messages = [msg["content"] for msg in messages if msg["role"] == "system"]
        full_system_instruction = system_instruction + "\n" + "\n".join(system_messages)

        logging.debug(f"System instruction: {full_system_instruction}")

        # Build the conversation history
        history = []
        for msg in messages:
            if msg["role"] == "user":
                history.append({"role": "user", "content": msg["content"]})
            elif msg["role"] == "assistant":
                history.append({"role": "assistant", "content": msg["content"]})

        logging.debug(f"Conversation history: {history}")
    
        # Get the last message
        last_msg = messages[-1] if messages else None


        # Define functions that have access to email via closure
        def get_user_name() -> str:
            """Retrieve the user's name."""
            user = form_collection.find_one({"email": email})
            return user.get('name', 'Information not available')

        def get_user_age() -> int:
            """Retrieve the user's age."""
            user = form_collection.find_one({"email": email})
            return user.get('age', 'Information not available')

        def get_user_email() -> str:
            """Retrieve the user's email."""
            return email  # Email is obtained from the JWT token

        def get_user_occupation() -> str:
            """Retrieve the user's occupation."""
            user = form_collection.find_one({"email": email})
            return user.get('occupation', 'Information not available')

        def get_user_income() -> float:
            """Retrieve the user's monthly income."""
            logging.info(f"Function get_user_income called for email: {email}")
            user = form_collection.find_one({"email": email})
            income = user.get('income', 'Information not available')
            logging.info(f"get_user_income retrieved income: {income}")
            return income

        def get_user_fixed_expenses() -> float:
            """Retrieve the user's fixed monthly expenses."""
            user = form_collection.find_one({"email": email})
            return user.get('fixed_expenses', 'Information not available')

        def get_user_variable_expenses() -> float:
            """Retrieve the user's variable monthly expenses."""
            user = form_collection.find_one({"email": email})
            return user.get('variable_expenses', 'Information not available')

        def get_user_total_expenses() -> float:
            """Calculate the user's total monthly expenses."""
            fixed = get_user_fixed_expenses()
            variable = get_user_variable_expenses()
            if isinstance(fixed, (int, float)) and isinstance(variable, (int, float)):
                return fixed + variable
            else:
                return 'Information not available'

        def get_user_savings_rate() -> float:
            """Retrieve the user's savings rate as a percentage."""
            user = form_collection.find_one({"email": email})
            return user.get('savings_rate', 'Information not available')

        def get_user_risk_tolerance() -> str:
            """Retrieve the user's risk tolerance."""
            user = form_collection.find_one({"email": email})
            return user.get('risk_tolerance', 'Information not available')

        def get_user_investment_horizon() -> str:
            """Retrieve the user's investment horizon."""
            user = form_collection.find_one({"email": email})
            return user.get('investment_horizon', 'Information not available')

        def get_user_preferred_investments() -> str:
            """Retrieve the user's preferred investment types."""
            user = form_collection.find_one({"email": email})
            return user.get('preferred_investments', 'Information not available')

        def get_user_short_term_goals() -> str:
            """Retrieve the user's short-term financial goals."""
            user = form_collection.find_one({"email": email})
            return user.get('short_term_goals', 'Information not available')

        def get_user_medium_term_goals() -> str:
            """Retrieve the user's medium-term financial goals."""
            user = form_collection.find_one({"email": email})
            return user.get('medium_term_goals', 'Information not available')

        def get_user_long_term_goals() -> str:
            """Retrieve the user's long-term financial goals."""
            user = form_collection.find_one({"email": email})
            return user.get('long_term_goals', 'Information not available')

        def get_user_assets() -> str:
            """Retrieve the user's current assets."""
            user = form_collection.find_one({"email": email})
            return user.get('assets', 'Information not available')

        def get_user_liabilities() -> str:
            """Retrieve the user's current liabilities."""
            user = form_collection.find_one({"email": email})
            return user.get('liabilities', 'Information not available')

        def get_user_current_investments() -> str:
            """Retrieve the user's current investments."""
            user = form_collection.find_one({"email": email})
            return user.get('current_investments', 'Information not available')

        def get_user_expected_returns() -> float:
            """Retrieve the user's expected returns percentage."""
            user = form_collection.find_one({"email": email})
            return user.get('expected_returns', 'Information not available')

        def get_user_life_insurance() -> str:
            """Retrieve the user's life insurance coverage."""
            user = form_collection.find_one({"email": email})
            return user.get('life_insurance', 'Information not available')

        def get_user_health_insurance() -> str:
            """Retrieve the user's health insurance coverage."""
            user = form_collection.find_one({"email": email})
            return user.get('health_insurance', 'Information not available')

        def get_user_property_insurance() -> str:
            """Retrieve the user's property insurance coverage."""
            user = form_collection.find_one({"email": email})
            return user.get('property_insurance', 'Information not available')

        def get_user_tax_bracket() -> str:
            """Retrieve the user's tax bracket."""
            user = form_collection.find_one({"email": email})
            return user.get('tax_bracket', 'Information not available')

        def get_user_tax_saving_investments() -> str:
            """Retrieve the user's tax-saving investments."""
            user = form_collection.find_one({"email": email})
            return user.get('tax_saving_investments', 'Information not available')

        # Functions available for function calling
        available_functions = [
            get_user_name,
            get_user_age,
            get_user_email,
            get_user_occupation,
            get_user_income,
            get_user_fixed_expenses,
            get_user_variable_expenses,
            get_user_total_expenses,
            get_user_savings_rate,
            get_user_risk_tolerance,
            get_user_investment_horizon,
            get_user_preferred_investments,
            get_user_short_term_goals,
            get_user_medium_term_goals,
            get_user_long_term_goals,
            get_user_assets,
            get_user_liabilities,
            get_user_current_investments,
            get_user_expected_returns,
            get_user_life_insurance,
            get_user_health_insurance,
            get_user_property_insurance,
            get_user_tax_bracket,
            get_user_tax_saving_investments
            # Add more functions as needed
        ]

        logging.info("Available functions for function calling registered")

        # Initialize the model with function calling
        model = genai.GenerativeModel(
            model_name="models/gemini-1.5-flash",  # Ensure you have access to this model
            tools=available_functions,
            system_instruction=full_system_instruction
        )
        chat = model.start_chat(enable_automatic_function_calling=True)

        logging.info("Chat session started with automatic function calling enabled")

        # Send the last user's message to generate the assistant's reply
        if last_msg and last_msg["role"] == "user":
            user_message = last_msg["content"]
            logging.info(f"User message: {user_message}")
            assistant_response = chat.send_message(user_message)
            response_content = assistant_response.text if assistant_response else "I'm here to help!"
            logging.info(f"Assistant response: {response_content}")

            return jsonify({'content': response_content})

        else:
            # Handle cases where there's no user message to process
            return jsonify({'content': "No user message to process."}), 400

    except Exception as e:
        logging.exception("Failed to fetch the assistant response.")
        return jsonify({'error': f'Failed to fetch the assistant response: {str(e)}'}), 500

# Other routes for file uploads, signup, login, and form submissions remain unchanged

# Upload file endpoint
@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Endpoint for uploading and processing files."""
    try:
        if 'file' not in request.files:
            logging.warning("No file part in request")
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            logging.warning("No selected file in upload")
            return jsonify({'error': 'No selected file'}), 400

        # Process the file as needed
        # For now, just return the filename
        logging.info(f"File uploaded: {file.filename}")
        return jsonify({'content': file.filename}), 200
    except Exception as e:
        logging.exception("Error uploading file.")
        return jsonify({'error': f'Error uploading file: {str(e)}'}), 500

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Signup endpoint to register a new user with TOTP and set first-time login flag."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        if users.find_one({"email": email}):
            logging.warning(f"User {email} already exists")
            return jsonify({"msg": "User already exists"}), 400

        totp_secret = pyotp.random_base32()
        users.insert_one({
            "email": email,
            "password": hashed_password,
            "two_factor_enabled": True,
            "two_factor_secret": totp_secret,
            "is_first_time": True
        })

        totp = pyotp.TOTP(totp_secret)
        uri = totp.provisioning_uri(email, issuer_name="ChatbotApp")
        img = qrcode.make(uri)
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)

        qrcode_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        logging.info(f"User {email} registered successfully")

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
        token = data.get('token')  # This is the TOTP token from the frontend

        user = users.find_one({"email": email})

        # Verify email and password
        if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            logging.warning(f"Invalid credentials for {email}")
            return jsonify({'msg': 'Invalid credentials'}), 400

        # Check TOTP token
        if not token:
            logging.warning(f"2FA token required for {email}")
            return jsonify({'msg': '2FA required'}), 401

        totp = pyotp.TOTP(user['two_factor_secret'])
        if not totp.verify(token):
            logging.warning(f"Invalid 2FA token for {email}")
            return jsonify({'msg': 'Invalid 2FA token'}), 400

        # Create access token (JWT)
        access_token = create_access_token(identity=email)
        
        # Check if this is the user's first login
        if user.get('is_first_time', True):
            users.update_one({"email": email}, {"$set": {"is_first_time": False}})
            logging.info(f"First-time login for {email}")
            return jsonify({'token': access_token, 'redirect': '/form', 'first_time': True}), 200

        logging.info(f"User {email} logged in successfully")
        return jsonify({'token': access_token, 'redirect': '/dashboard', 'first_time': False}), 200

    except Exception as e:
        logging.exception("Login failed.")
        return jsonify({'msg': "Login failed", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
