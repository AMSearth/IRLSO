# 🛡️ IRLSO: Intelligent Real-time Log & Security Orchestrator (Simulation)

![IRLSO Dashboard Simulation](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)
![Kafka](https://img.shields.io/badge/Apache%20Kafka-Streaming-red.svg)
![Flask](https://img.shields.io/badge/Python-Flask-black.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)

Welcome to the **IRLSO** simulation! This project is a highly dynamic, cyberpunk-themed front-end web application backed by an authentic **Apache Kafka** event-driven streaming architecture.

## 🚀 What It Is
IRLSO is a visual demonstration and architectural sandbox for enterprise-grade log orchestration. It mimics the behavior of a high-performance security operations center (SOC) terminal, monitoring system health and intercepting active threat vectors in real time.

## ⚙️ What It Does
1. **Continuous Log Surveillance**: Monitors a realistic, uninterrupted flow of generated server metrics and routine health checks.
2. **Interactive Threat Injection**: Allows users to manually deploy simulated malware models (like SQL Injection, DDoS, and Brute Force).
3. **Cyberpunk UI**: Visualizes the system load using interactive glassmorphism, scanlines, and animated CSS glitch effects.
4. **Manual Threat Response**: Injected threats spike the simulated system load metrics significantly. Threats must be manually neutralized by the administrator before the system stabilizes.

## 🛠️ How It Does It
This application goes beyond basic JavaScript intervals. It leverages a fully-functional **containerized microservice architecture**:
*   **Producer Script**: A dedicated Python script operates continuously in the background, pumping synthesized normal log objects into an Apache Kafka topic (`irlso-logs`).
*   **Apache Kafka & Zookeeper**: The enterprise message broker sits in the middle of the stack, queuing the network events and keeping the pipeline robust.
*   **Flask Web Server**: A threaded Python/Flask backend acts as a Kafka Consumer. When a log hits Kafka, Flask routes it securely out to the web layer via **Server-Sent Events (SSE)**.
*   **Vanilla JS + Tailwind**: The frontend (`app.js`) opens a native `EventSource` to the Flask SSE stream, allowing it to dynamically print logs naturally as they arrive from the broker.

When an attack is launched from the UI, it doesn't just render locally. It sends an HTTP POST back to Flask, which is published to Kafka, and finally streamed *back* down to the UI. This authentic event round-trip ensures realism!

## 🏃 Setup & Run Instructions

This project is fully dockerized. To spin up this simulation, follow these steps:

### Prerequisites:
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine installed on your host machine.

### Step-by-Step Guide:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AMSearth/IRLSO.git
   cd IRLSO
   ```

2. **Boot the Docker Cluster:**
   Ensure your Docker Daemon is running, then orchestrate the stack:
   ```bash
   docker compose up --build -d
   ```
   *Note: On the first run, Docker will need to download the Confluent Kafka and Zookeeper images, and compile the Flask Python environment.*

3. **Verify the Stack:**
   Give Kafka about 15 to 20 seconds to negotiate leader election and for the python producer log generator to hook onto the broker.
   
4. **Access the Terminal:**
   Open your preferred web browser and navigate to the simulation:
   ```
   http://localhost:5000
   ```

5. **Shutdown:**
   To gracefully stop the broker and destroy the containers:
   ```bash
   docker compose down
   ```

---
*Created as an advanced architectural sandbox utilizing Python, Docker, Apache Kafka, and animated DOM manipulation.*
