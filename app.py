import os
import json
from flask import Flask, render_template, request, Response, jsonify
from kafka import KafkaProducer, KafkaConsumer

app = Flask(__name__)

KAFKA_BROKER = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
TOPIC = 'irlso-logs'

def get_producer():
    return KafkaProducer(
        bootstrap_servers=[KAFKA_BROKER],
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/stream')
def stream():
    def event_stream():
        # Connect consumer inside the generator to avoid thread issues
        try:
            consumer = KafkaConsumer(
                TOPIC,
                bootstrap_servers=[KAFKA_BROKER],
                auto_offset_reset='latest',
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                group_id=None # Anonymous group for simple streaming
            )
            for message in consumer:
                yield f"data: {json.dumps(message.value)}\n\n"
        except Exception as e:
            print(f"Consumer Error: {e}")
            
    return Response(event_stream(), mimetype="text/event-stream")

@app.route('/inject_threat', methods=['POST'])
def inject_threat():
    data = request.json
    attack_type = data.get('attackType', 'UNKNOWN')
    threat_payload = {
        'type': 'threat',
        'message': f"WARNING: INTRUSION ATTEMPT DETECTED! Signature matching [{attack_type}]",
        'attackType': attack_type,
        'source': 'manual_injection'
    }
    
    try:
        producer = get_producer()
        producer.send(TOPIC, threat_payload)
        producer.flush()
        return jsonify({"status": "Threat injected to Kafka"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Start web server
    app.run(host='0.0.0.0', port=5000, threaded=True)
