import os
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
ADMIN_TOKEN = "apsaras-secure-admin-token-2026"

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "") # e.g., postgresql://user:password@neon_host/dbname
USE_DB = bool(DATABASE_URL)

def get_db_connection():
    if not USE_DB:
        return None
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    conn.autocommit = True
    return conn

# Initialize tables
def init_db():
    if not USE_DB:
        print("DATABASE_URL not set. Falling back to in-memory mode.")
        return
        
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Create services table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS services (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price INTEGER NOT NULL,
                duration VARCHAR(100) NOT NULL,
                description TEXT
            )
        ''')
        
        # Create bookings table
        cur.execute('''
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                phone_number VARCHAR(50) NOT NULL,
                appointment_date TIMESTAMP NOT NULL,
                service_id INTEGER NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Seed services if empty
        cur.execute('SELECT COUNT(*) FROM services')
        if cur.fetchone()['count'] == 0:
            initial_services = [
                ("Bridal Makeup", 15000, "3 hours", "Complete bridal makeup with hair styling and draping."),
                ("Party Makeup", 4000, "1.5 hours", "Flawless makeup for parties and events."),
                ("Hair Spa", 1500, "1 hour", "Rejuvenating hair spa treatment for silky smooth hair."),
                ("Facial", 2500, "1 hour", "Deep cleansing and glowing facial treatment."),
                ("Manicure & Pedicure", 1200, "1.5 hours", "Relaxing care for your hands and feet.")
            ]
            for s in initial_services:
                cur.execute('INSERT INTO services (name, price, duration, description) VALUES (%s, %s, %s, %s)', s)
                
        cur.close()
        conn.close()
        print("Connected to PostgreSQL (Neon) and initialized tables successfully!")
    except Exception as e:
        global USE_DB
        USE_DB = False
        print(f"Failed to connect or initialize DB: {e}")
        print("Falling back to in-memory database mode.")

# In-memory storage (used only if PostgreSQL is unreachable/not configured)
in_memory_db = {
    "services": [
        {"_id": "1", "name": "Bridal Makeup", "price": 15000, "duration": "3 hours", "description": "Complete bridal makeup with hair styling and draping."},
        {"_id": "2", "name": "Party Makeup", "price": 4000, "duration": "1.5 hours", "description": "Flawless makeup for parties and events."},
        {"_id": "3", "name": "Hair Spa", "price": 1500, "duration": "1 hour", "description": "Rejuvenating hair spa treatment for silky smooth hair."},
        {"_id": "4", "name": "Facial", "price": 2500, "duration": "1 hour", "description": "Deep cleansing and glowing facial treatment."},
        {"_id": "5", "name": "Manicure & Pedicure", "price": 1200, "duration": "1.5 hours", "description": "Relaxing care for your hands and feet."}
    ],
    "bookings": []
}

init_db()

# --- Helper Functions ---
def format_row(row):
    """Format row to match previous MongoDB _id convention for frontend compatibility"""
    if row and 'id' in row:
        row['_id'] = str(row['id'])
    if row and 'appointment_date' in row and row['appointment_date']:
        row['appointmentDate'] = row['appointment_date'].isoformat() if isinstance(row['appointment_date'], datetime) else row['appointment_date']
    if row and 'customer_name' in row:
        row['customerName'] = row['customer_name']
    if row and 'phone_number' in row:
        row['phoneNumber'] = row['phone_number']
    if row and 'service_id' in row:
        row['serviceId'] = str(row['service_id'])
    if row and 'created_at' in row and row['created_at']:
        row['createdAt'] = row['created_at'].isoformat() if isinstance(row['created_at'], datetime) else row['created_at']
    return row

# --- Routes ---

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if data and data.get("password") == ADMIN_PASSWORD:
        return jsonify({"token": ADMIN_TOKEN}), 200
    return jsonify({"error": "Invalid password"}), 401

def check_auth(req):
    auth_header = req.headers.get("Authorization")
    if auth_header and auth_header == f"Bearer {ADMIN_TOKEN}":
        return True
    return False

@app.route('/api/services', methods=['GET'])
def get_services():
    if USE_DB:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM services")
        services = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([format_row(dict(s)) for s in services]), 200
    else:
        return jsonify(in_memory_db["services"]), 200

@app.route('/api/bookings', methods=['GET', 'POST'])
def handle_bookings():
    if request.method == 'POST':
        data = request.json
        required_fields = ['customerName', 'phoneNumber', 'appointmentDate', 'serviceId']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400
        
        if USE_DB:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute(
                """INSERT INTO bookings (customer_name, phone_number, appointment_date, service_id, status)
                   VALUES (%s, %s, %s, %s, 'Pending') RETURNING *""",
                (data['customerName'], data['phoneNumber'], data['appointmentDate'], data['serviceId'])
            )
            new_booking = cur.fetchone()
            cur.close()
            conn.close()
            return jsonify({"message": "Booking created successfully", "booking": format_row(dict(new_booking))}), 201
        else:
            new_booking = {
                "customerName": data['customerName'],
                "phoneNumber": data['phoneNumber'],
                "appointmentDate": data['appointmentDate'],
                "serviceId": data['serviceId'],
                "status": "Pending",
                "createdAt": datetime.now().isoformat(),
                "_id": str(len(in_memory_db["bookings"]) + 1)
            }
            in_memory_db["bookings"].append(new_booking)
            return jsonify({"message": "Booking created successfully", "booking": new_booking}), 201

    elif request.method == 'GET':
        if not check_auth(request):
            return jsonify({"error": "Unauthorized"}), 401
            
        if USE_DB:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT * FROM bookings ORDER BY created_at DESC")
            bookings = cur.fetchall()
            cur.close()
            conn.close()
            return jsonify([format_row(dict(b)) for b in bookings]), 200
        else:
            sorted_bookings = sorted(in_memory_db["bookings"], key=lambda x: x["createdAt"], reverse=True)
            return jsonify(sorted_bookings), 200

@app.route('/api/bookings/<booking_id>/status', methods=['PATCH'])
def update_booking_status(booking_id):
    if not check_auth(request):
        return jsonify({"error": "Unauthorized"}), 401
        
    data = request.json
    new_status = data.get('status')
    if not new_status:
        return jsonify({"error": "Missing status field"}), 400

    if USE_DB:
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute(
                "UPDATE bookings SET status = %s WHERE id = %s RETURNING id",
                (new_status, booking_id)
            )
            updated = cur.fetchone()
            cur.close()
            conn.close()
            
            if updated:
                return jsonify({"message": "Status updated successfully"}), 200
            else:
                return jsonify({"error": "Booking not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 400
    else:
        for booking in in_memory_db["bookings"]:
            if booking["_id"] == str(booking_id):
                booking["status"] = new_status
                return jsonify({"message": "Status updated successfully"}), 200
        return jsonify({"error": "Booking not found"}), 404

# Expose 'app' as the WSGI callable for Vercel Serverless
if __name__ == '__main__':
    app.run(debug=True, port=5000)
