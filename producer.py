import os
import time
import json
import random
from kafka import KafkaProducer

KAFKA_BROKER = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
TOPIC = 'irlso-logs'

NORMAL_LOGS = [
    "SYSCALL: Network heartbeat verified | Latency: 12ms",
    "MEM_SYNC: Allocating block 0x0F4A | Status: OK",
    "AUTH: User token validated | Node: Alpha-7",
    "ROUTING: Traffic optimal on backbone ETA-9",
    "DB_QUERY: Index optimized | Elapsed: 0.04s",
    "SEC_SCAN: Routine filesystem check | No anomalies",
    "API_GATEWAY: Received 450 requests/sec | Handling",
    "BACKUP: Incremental snapshot completed",
    "NODE_HEALTH: Cluster status green. 12/12 nodes active."
]

def get_producer():
    while True:
        try:
            producer = KafkaProducer(
                bootstrap_servers=[KAFKA_BROKER],
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            print(f"Connected to Kafka at {KAFKA_BROKER}")
            return producer
        except Exception as e:
            print(f"Waiting for Kafka ({KAFKA_BROKER})... {e}")
            time.sleep(2)

def generate_logs():
    producer = get_producer()
    print("Starting generator loop...")
    while True:
        log_type = 'normal'
        message = random.choice(NORMAL_LOGS)
        
        payload = {
            'type': log_type,
            'message': message,
            'source': 'producer'
        }
        try:
            producer.send(TOPIC, payload)
            producer.flush()
            print(f"Produced: {message}")
        except Exception as e:
            print(f"Error producing log: {e}")
            
        time.sleep(random.uniform(0.8, 2.0))

if __name__ == '__main__':
    generate_logs()
