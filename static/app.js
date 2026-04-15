// IRLSO Simulation Logic - Kafka SSE Edition
const logContent = document.getElementById('log-content');
const activeThreatsContainer = document.getElementById('active-threats-container');

const METRICS_UPDATE_INTERVAL = 2000;
let activeThreatsCount = 0;
let threatIdCounter = 0;

// Utility to get current time string
function getTimeString() {
    const now = new Date();
    return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
}

// Create a log entry element
function createLogEntry(message, type = 'normal') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'text-[#0088aa] min-w-[85px]';
    timeSpan.textContent = `[${getTimeString()}]`;
    
    const msgSpan = document.createElement('span');
    msgSpan.className = 'log-msg';
    msgSpan.textContent = message;

    entry.appendChild(timeSpan);
    entry.appendChild(msgSpan);
    
    return entry;
}

// Append log to dashboard
function appendLog(message, type = 'normal') {
    const entry = createLogEntry(message, type);
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
    
    if (logContent.children.length > 50) {
        logContent.removeChild(logContent.firstChild);
    }
}

// Server-Sent Events integration (Kafka Consumer)
function initializeEventStream() {
    appendLog("Establishing secure link to Kafka Broker...", "warn");
    const eventSource = new EventSource('/stream');

    eventSource.onmessage = function(event) {
        try {
            const data = JSON.parse(event.data);
            
            // Append log received from Kafka
            appendLog(data.message, data.type);
            
            // If it's a threat log mapped through Kafka, trigger the UI alert
            if(data.type === 'threat' && data.attackType) {
                const threatId = `threat-${++threatIdCounter}`;
                activeThreatsCount++;
                renderThreatToast(threatId, data.attackType);
            }
        } catch (e) {
            console.error("Error parsing SSE data", e);
        }
    };
    
    eventSource.onerror = function(err) {
        console.error("SSE Error:", err);
        // appendLog("Connection to Kafka Event Stream lost.", "threat");
    }
}

// Threat Injection Function -> Sends API req to Flask -> Kafka Producer
window.injectThreat = function(attackType) {
    // We do NOT inject manually here anymore. We wait for Kafka via SSE.
    console.log(`Sending threat request for ${attackType}...`);
    
    fetch('/inject_threat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attackType: attackType })
    }).catch(err => console.error("Error injecting threat:", err));
}

// Manual Termination Method
window.terminateThreat = function(threatId, attackType) {
    activeThreatsCount = Math.max(0, activeThreatsCount - 1);
    
    const threatEl = document.getElementById(threatId);
    if(threatEl) {
        threatEl.classList.add('slide-out');
        threatEl.addEventListener('animationend', () => threatEl.remove());
    }
    
    appendLog(`IRLSO_ACTION: Administrator neutralized threat [${attackType}]. System secure.`, 'success');
}

// Render active threat toast that requires manual termination
function renderThreatToast(threatId, attackType) {
    const toast = document.createElement('div');
    toast.id = threatId;
    toast.className = 'bg-[rgba(20,0,10,0.9)] border border-cyber-pink shadow-[0_0_20px_rgba(255,0,60,0.5)] text-white p-4 border-l-4 border-l-cyber-pink flex flex-col gap-3 min-w-[320px] slide-in pointer-events-auto';
    
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="text-2xl text-cyber-pink drop-shadow-[0_0_10px_#ff003c]">⚠️</div>
            <div>
                <h4 class="m-0 text-base text-cyber-pink font-bold">ACTIVE THREAT DETECTED</h4>
                <p class="m-0 text-xs text-gray-300">Type: <strong>${attackType}</strong></p>
                <p class="m-0 text-[10px] text-cyber-yellow mt-1 animate-pulse">ACTION REQUIRED</p>
            </div>
        </div>
        <button class="bg-cyber-pink/20 hover:bg-cyber-pink/40 border border-cyber-pink text-cyber-pink px-3 py-1.5 text-xs font-mono font-bold transition-all shadow-[0_0_5px_rgba(255,0,60,0.5)]" onclick="terminateThreat('${threatId}', '${attackType}')">
            [ TERMINATE THREAT ]
        </button>
    `;
    
    activeThreatsContainer.appendChild(toast);
}

// System Metrics logic based on active threat state
function updateMetrics() {
    const cpuFill = document.getElementById('cpu-fill');
    const memFill = document.getElementById('mem-fill');
    const netFill = document.getElementById('net-fill');

    let cpuBase = activeThreatsCount > 0 ? 80 : 20;
    let netBase = activeThreatsCount > 0 ? 85 : 15;
    
    let cpu = cpuBase + (Math.random() * 10 - 5);
    let mem = (parseInt(memFill.style.width) || 45) + (Math.random() * 4 - 2);
    let net = netBase + (Math.random() * 20 - 10);

    // Bounding
    if(cpu < 10) cpu = 10;
    if(cpu > 98) cpu = 98;
    
    if(net < 5) net = 5;
    if(net > 98) net = 98;

    cpuFill.style.width = `${cpu}%`;
    memFill.style.width = `${mem}%`;
    netFill.style.width = `${net}%`;
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    appendLog("SYSTEM INITIALIZED. IRLSO ACTIVE. AWAITING THREATS.", "success");
    initializeEventStream();
    setInterval(updateMetrics, METRICS_UPDATE_INTERVAL);
});
