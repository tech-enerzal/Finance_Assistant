from flask import Flask, jsonify, request, render_template
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# MongoDB Atlas connection string and JWT configuration
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"), serverSelectionTimeoutMS=5000)
db = client["MumbaiHacks"]
form_collection = db["Form"]

# Serve HTML form
@app.route('/')
def index():
    return render_template('index.html')

# Authentication route to get JWT token
@app.route('/auth', methods=['POST'])
def authenticate():
    data = request.json
    if data['username'] == "admin" and data['password'] == "password":
        access_token = create_access_token(identity={"username": data['username']})
        return jsonify(access_token=access_token), 200
    return jsonify({"msg": "Bad username or password"}), 401

# Route to submit financial form data
@app.route('/submit_form', methods=['POST'])
@jwt_required()
def submit_form():
    form_data = request.json
    try:
        form_collection.insert_one(form_data)
        return jsonify({"message": "Form data saved successfully!"}), 201
    except Exception as e:
        print("Error saving form data:", e)
        return jsonify({"message": "Error saving form data"}), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
