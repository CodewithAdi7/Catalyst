from flask import Flask, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
# This allows your React app (running on a different port) to communicate with Flask
CORS(app) 

# We create an "endpoint" called /launch
@app.route('/launch', methods=['POST'])
def launch_app():
    print("Signal received! Backend is starting to work...")
    
    # PUT YOUR BACKEND LOGIC HERE
    # For example, let's simulate a task that takes 3 seconds
    time.sleep(3) 
    
    print("Backend work finished!")
    
    # Send a response back to React
    return jsonify({
        "status": "success", 
        "message": "The backend completed its task!"
    })

if __name__ == '__main__':
    # Runs the server on port 5000
    app.run(port=5000, debug=True)