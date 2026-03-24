
// State management
let currentTiming = 'T3';
let commandHistory = [];
let currentPreset = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    updateCommand();
});

// Update command in real-time
function updateCommand() {
    let command = 'nmap ';
    const explanations = [];
    
    // Get target
    const target = document.getElementById('targetInput').value || 'target.com';
    
    // Scan type
    const scanType = document.getElementById('scanType').value;
    if (scanType) {
        command += scanType + ' ';
        explanations.push({ flag: scanType, desc: getScanTypeDescription(scanType) });
    }
    
    // Advanced options
    if (document.getElementById('stealth').checked) {
        command += '-sS ';
        explanations.push({ flag: '-sS', desc: 'Stealth SYN scan - Half-open scan that\'s harder to detect' });
    }
    
    if (document.getElementById('noPing').checked) {
        command += '-Pn ';
        explanations.push({ flag: '-Pn', desc: 'Skip host discovery - Treat all hosts as online' });
    }
    
    if (document.getElementById('versionDetection').checked) {
        command += '-sV ';
        explanations.push({ flag: '-sV', desc: 'Version detection - Determine service/version info' });
    }
    
    if (document.getElementById('osDetection').checked) {
        command += '-O ';
        explanations.push({ flag: '-O', desc: 'OS detection - Identify the operating system' });
    }
    
    if (document.getElementById('aggressive').checked) {
        command += '-A ';
        explanations.push({ flag: '-A', desc: 'Aggressive scan - Enable OS detection, version detection, script scanning, and traceroute' });
    }
    
    if (document.getElementById('fastScan').checked) {
        command += '-F ';
        explanations.push({ flag: '-F', desc: 'Fast scan - Scan fewer ports than default' });
    }
    
    if (document.getElementById('scriptScan').checked) {
        command += '-sC ';
        explanations.push({ flag: '-sC', desc: 'Default scripts - Run default safe scripts' });
    }
    
    // Port specification
    const ports = document.getElementById('portInput').value;
    if (ports) {
        command += `-p ${ports} `;
        explanations.push({ flag: `-p ${ports}`, desc: `Port specification - Scan only specified ports: ${ports}` });
    }
    
    // Timing
    if (currentTiming !== 'T3') {
        command += `-${currentTiming} `;
        explanations.push({ flag: `-${currentTiming}`, desc: `Timing template - ${getTimingDescription(currentTiming)}` });
    }
    
    // Add target
    command += target;
    
    // Update display
    document.getElementById('commandDisplay').innerHTML = command;
    
    // Update explanations
    updateExplanations(explanations);
    
    // Update sample output based on scan type
    updateSampleOutput();
}

// Get scan type description
function getScanTypeDescription(scanType) {
    const descriptions = {
        '-sS': 'TCP SYN scan - Stealthy half-open scan',
        '-sT': 'TCP Connect scan - Full three-way handshake',
        '-sU': 'UDP scan - Scan UDP ports',
        '-sA': 'TCP ACK scan - Used to map firewall rules',
        '-sW': 'TCP Window scan - Similar to ACK scan',
        '-sM': 'TCP Maimon scan - Sends FIN/ACK packets'
    };
    return descriptions[scanType] || 'Custom scan type';
}

// Get timing description
function getTimingDescription(timing) {
    const descriptions = {
        'T0': 'Paranoid - Very slow, serial scan',
        'T1': 'Sneaky - Slow, serial scan',
        'T2': 'Polite - Slower than normal',
        'T3': 'Normal - Default timing',
        'T4': 'Aggressive - Faster scan',
        'T5': 'Insane - Very fast scan'
    };
    return descriptions[timing] || 'Custom timing';
}

// Update explanation panel
function updateExplanations(explanations) {
    const panel = document.getElementById('explanationPanel');
    if (explanations.length === 0) {
        panel.innerHTML = '<p class="text-gray-400">Select options to see explanations</p>';
        return;
    }
    
    panel.innerHTML = explanations.map(exp => `
        <div class="explanation-item slide-in">
            <code class="text-green-400 font-semibold">${exp.flag}</code>
            <p class="text-gray-300 mt-1">${exp.desc}</p>
        </div>
    `).join('');
}

// Update sample output
function updateSampleOutput() {
    const output = document.getElementById('sampleOutput');
    const isAggressive = document.getElementById('aggressive').checked;
    const hasVersion = document.getElementById('versionDetection').checked;
    const hasOS = document.getElementById('osDetection').checked;
    
    let sampleOutput = `Starting Nmap 7.92 ( https://nmap.org )<br>`;
    sampleOutput += `Nmap scan report for example.com (93.184.216.34)<br>`;
    sampleOutput += `Host is up (0.032s latency).<br><br>`;
    sampleOutput += `PORT    STATE SERVICE<br>`;
    sampleOutput += `80/tcp  open  http`;
    if (hasVersion) sampleOutput += ` (Apache httpd 2.4.41)`;
    sampleOutput += `<br>`;
    sampleOutput += `443/tcp open  https`;
    if (hasVersion) sampleOutput += ` (Apache httpd 2.4.41)`;
    sampleOutput += `<br>`;
    
    if (isAggressive || hasOS) {
        sampleOutput += `<br>OS details: Linux 4.15<br>`;
    }
    
    if (isAggressive) {
        sampleOutput += `<br>TRACEROUTE<br>`;
        sampleOutput += `HOP RTT     ADDRESS<br>`;
        sampleOutput += `1   10.00 ms 192.168.1.1<br>`;
        sampleOutput += `2   25.00 ms 10.0.0.1<br>`;
    }
    
    sampleOutput += `<br>Nmap done: 1 IP address (1 host up) scanned in 0.45 seconds`;
    
    output.innerHTML = sampleOutput;
}

// Set timing
function setTiming(timing) {
    currentTiming = timing;
    document.getElementById('currentTiming').innerHTML = 
        `<i class="fas fa-info-circle text-blue-500 mr-2"></i>Current: ${getTimingDescription(timing)}`;
    updateCommand();
}

// Set all ports
function setAllPorts() {
    document.getElementById('portInput').value = '-';
    updateCommand();
}

// Apply preset
function applyPreset(preset) {
    // Reset all options
    document.getElementById('scanType').value = '';
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('portInput').value = '';
    
    // Clear active preset
    document.querySelectorAll('.preset-card').forEach(card => card.classList.remove('active'));
    
    // Apply preset configuration
    switch(preset) {
        case 'quick':
            document.getElementById('scanType').value = '-sS';
            document.getElementById('fastScan').checked = true;
            setTiming('T4');
            break;
        case 'stealth':
            document.getElementById('scanType').value = '-sS';
            document.getElementById('noPing').checked = true;
            setTiming('T1');
            break;
        case 'aggressive':
            document.getElementById('aggressive').checked = true;
            document.getElementById('portInput').value = '-';
            setTiming('T4');
            break;
        case 'bugbounty':
            document.getElementById('scanType').value = '-sS';
            document.getElementById('versionDetection').checked = true;
            document.getElementById('scriptScan').checked = true;
            document.getElementById('portInput').value = '80,443,8080,8443,3000,5000,8000,9000';
            setTiming('T4');
            break;
    }
    
    // Mark active preset
    event.currentTarget.classList.add('active');
    currentPreset = preset;
    
    updateCommand();
    addToHistory();
}

// Copy command
function copyCommand() {
    const command = document.getElementById('commandDisplay').innerText;
    navigator.clipboard.writeText(command).then(() => {
        showToast('Command copied to clipboard!');
        addToHistory();
    });
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').innerText = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Add to history
function addToHistory() {
    const command = document.getElementById('commandDisplay').innerText;
    if (command && !command.includes('[Configure options')) {
        const timestamp = new Date().toLocaleString();
        commandHistory.unshift({ command, timestamp });
        if (commandHistory.length > 10) commandHistory.pop();
        localStorage.setItem('nmapHistory', JSON.stringify(commandHistory));
        updateHistoryDisplay();
    }
}

// Load history
function loadHistory() {
    const saved = localStorage.getItem('nmapHistory');
    if (saved) {
        commandHistory = JSON.parse(saved);
        updateHistoryDisplay();
    }
}

// Update history display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    if (commandHistory.length === 0) {
        historyList.innerHTML = '<p class="text-gray-400">No commands in history yet</p>';
        return;
    }
    
    historyList.innerHTML = commandHistory.map((item, index) => `
        <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition cursor-pointer"
             onclick="loadFromHistory(${index})">
            <div class="flex-1">
                <code class="text-green-400 text-sm">${item.command}</code>
                <p class="text-xs text-gray-500 mt-1">${item.timestamp}</p>
            </div>
            <i class="fas fa-redo text-gray-400"></i>
        </div>
    `).join('');
}

// Load from history
function loadFromHistory(index) {
    const item = commandHistory[index];
    // Parse and set the command (simplified for demo)
    document.getElementById('targetInput').value = 'example.com';
    updateCommand();
    showToast('Command loaded from history');
}

// Show cheat sheet
function showCheatSheet() {
    document.getElementById('cheatSheetModal').classList.remove('hidden');
}

// Close cheat sheet
function closeCheatSheet() {
    document.getElementById('cheatSheetModal').classList.add('hidden');
}

// Switch tabs
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update content (simplified for demo)
    const content = document.getElementById('tabContent');
    switch(tab) {
        case 'history':
            content.innerHTML = `
                <div id="historyTab">
                    <h3 class="text-lg font-semibold mb-4">Command History</h3>
                    <div id="historyList" class="space-y-2">
                        ${commandHistory.length > 0 ? 
                            commandHistory.map((item, index) => `
                                <div class="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition cursor-pointer"
                                     onclick="loadFromHistory(${index})">
                                    <div class="flex-1">
                                        <code class="text-green-400 text-sm">${item.command}</code>
                                        <p class="text-xs text-gray-500 mt-1">${item.timestamp}</p>
                                    </div>
                                    <i class="fas fa-redo text-gray-400"></i>
                                </div>
                            `).join('') : 
                            '<p class="text-gray-400">No commands in history yet</p>'}
                    </div>
                </div>
            `;
            break;
        case 'share':
            content.innerHTML = `
                <div>
                    <h3 class="text-lg font-semibold mb-4">Share Configuration</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-400 mb-2">Shareable Link</label>
                            <div class="flex gap-2">
                                <input type="text" value="https://nmapgen.app/share/abc123" readonly 
                                       class="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg mono">
                                <button onclick="copyShareLink()" class="btn-primary">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>
                        <div class="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                            <p class="text-sm text-blue-400">
                                <i class="fas fa-info-circle mr-2"></i>
                                Share links allow others to load your exact scan configuration
                            </p>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'export':
            content.innerHTML = `
                <div>
                    <h3 class="text-lg font-semibold mb-4">Export Options</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="exportAs('bash')" class="btn-secondary">
                            <i class="fas fa-file-code mr-2"></i>
                            Export as Bash Script
                        </button>
                        <button onclick="exportAs('json')" class="btn-secondary">
                            <i class="fas fa-file-code mr-2"></i>
                            Export as JSON
                        </button>
                        <button onclick="exportAs('markdown')" class="btn-secondary">
                            <i class="fas fa-file-alt mr-2"></i>
                            Export as Markdown
                        </button>
                        <button onclick="exportAs('csv')" class="btn-secondary">
                            <i class="fas fa-file-csv mr-2"></i>
                            Export as CSV
                        </button>
                    </div>
                </div>
            `;
            break;
    }
}

// Copy share link
function copyShareLink() {
    navigator.clipboard.writeText('https://nmapgen.app/share/abc123').then(() => {
        showToast('Share link copied!');
    });
}

// Export functions
function exportAs(format) {
    const command = document.getElementById('commandDisplay').innerText;
    let content = '';
    let filename = '';
    
    switch(format) {
        case 'bash':
            content = `#!/bin/bash\n# Generated by Nmap Command Generator\n${command}`;
            filename = 'nmap_scan.sh';
            break;
        case 'json':
            content = JSON.stringify({
                command: command,
                timestamp: new Date().toISOString(),
                options: {
                    target: document.getElementById('targetInput').value,
                    scanType: document.getElementById('scanType').value,
                    ports: document.getElementById('portInput').value
                }
            }, null, 2);
            filename = 'nmap_config.json';
            break;
        case 'markdown':
            content = `# Nmap Scan Configuration\n\n\`\`\`bash\n${command}\n\`\`\`\n\nGenerated on: ${new Date().toLocaleString()}`;
            filename = 'nmap_scan.md';
            break;
        case 'csv':
            content = `Command,Timestamp\n"${command}","${new Date().toISOString()}"`;
            filename = 'nmap_scans.csv';
            break;
    }
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`Exported as ${format.toUpperCase()}!`);
}

// Toggle dark mode (already dark, but can add light mode)
function toggleDarkMode() {
    // For demo purposes, just show a message
    showToast('Dark mode is already active!');
}

// Close modal on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCheatSheet();
    }
});

// Close modal on background click
document.getElementById('cheatSheetModal').addEventListener('click', (e) => {
    if (e.target.id === 'cheatSheetModal') {
        closeCheatSheet();
    }
});
