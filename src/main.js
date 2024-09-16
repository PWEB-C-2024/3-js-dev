const timers = {};
const start = {};
const timeelapsed = {};

// Add event listeners for start/stop buttons
document.querySelectorAll('.start').forEach(button => {
    button.addEventListener('click', (e) => {
        const activityid = e.target.getAttribute('data-activity');
        startTimer(activityid);
    });
});

document.querySelectorAll('.stop').forEach(button => {
    button.addEventListener('click', (e) => {
        const activityid = e.target.getAttribute('data-activity');
        stopTimer(activityid);
    });
});

// Start the timer for a specific activity
function startTimer(activityid) {
    if (!timers[activityid]) {
        start[activityid] = Date.now() - (timeelapsed[activityid] || 0);
        timers[activityid] = setInterval(() => updateTime(activityid), 100);
    }
}

// Stop the timer for a specific activity
function stopTimer(activityid) {
    if (timers[activityid]) {
        clearInterval(timers[activityid]);
        timeelapsed[activityid] = Date.now() - start[activityid];
        delete timers[activityid];

        // Save activity
        const timetaken = formatTime(timeelapsed[activityid]);
        const performance = calculatePerformance(timeelapsed[activityid]);
        saveActivity(`Activity ${activityid}`, timetaken, performance);
        storeActivity(activityid, timetaken, performance);

        timeelapsed[activityid] = 0; // Reset for the next activity
        document.getElementById(`currentTime-${activityid}`).textContent = "00:00.00";
    }
}

// Update the displayed time for a specific activity
function updateTime(activityid) {
    const elapsed = Date.now() - start[activityid];
    document.getElementById(`currentTime-${activityid}`).textContent = formatTime(elapsed);
}

// Format time as mm:ss.SS
function formatTime(ms) {
    const time = new Date(ms);
    const minutes = String(time.getUTCMinutes()).padStart(2, '0');
    const seconds = String(time.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(Math.floor(time.getUTCMilliseconds() / 10)).padStart(2, '0');
    return `${minutes}:${seconds}.${milliseconds}`;
}

// Calculate performance based on time taken
function calculatePerformance(ms) {
    const time = ms / 1000;
    const performance = Math.max(0, 100 - time * 0.5); // Performance decreases as time increases
    return `${Math.round(performance)}%`;
}

// Save activity to the table
function saveActivity(activity, time, performance) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${activity}</td><td>${time}</td><td>${performance}</td>`;
    document.querySelector('#activityTable tbody').appendChild(row);
}

// Persist activity data in localStorage
function storeActivity(activityid, time, performance) {
    const activityData = JSON.parse(localStorage.getItem('activities')) || [];
    activityData.push({ activityid, activity: `Activity ${activityid}`, time, performance });
    localStorage.setItem('activities', JSON.stringify(activityData));
}

// Load activities from localStorage on page load
function activities() {
    const savedActivities = JSON.parse(localStorage.getItem('activities')) || [];
    savedActivities.forEach(({ activity, time, performance }) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${activity}</td><td>${time}</td><td>${performance}</td>`;
        document.querySelector('#activityTable tbody').appendChild(row);
    });
}

// Sorting functionality
const tableHeaders = document.querySelectorAll('#activityTable th');
tableHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const sort = header.getAttribute('data-sort');
        sortTable(sort);
    });
});

function sortTable(key) {
    const rows = Array.from(document.querySelector('#activityTable tbody').querySelectorAll('tr'));
    const sort = rows.sort((a, b) => {
        const cellA = a.querySelector(`td:nth-child(${columnindex(key)})`).textContent;
        const cellB = b.querySelector(`td:nth-child(${columnindex(key)})`).textContent;

        if (key === 'time') {
            return time(cellA) - time(cellB);
        } else if (key === 'performance') {
            return parseInt(cellB) - parseInt(cellA);
        } else {
            return cellA.localeCompare(cellB);
        }
    });

    document.querySelector('#activityTable tbody').innerHTML = '';
    sort.forEach(row => document.querySelector('#activityTable tbody').appendChild(row));
}

function time(timeStr) {
    const [minutes, seconds] = timeStr.split(':');
    const [secs, millisecs] = seconds.split('.');
    return (parseInt(minutes) * 60000) + (parseInt(secs) * 1000) + (parseInt(millisecs) * 10);
}

function columnindex(key) {
    switch (key) {
        case 'activity': return 1;
        case 'time': return 2;
        case 'performance': return 3;
        default: return 1;
    }
}

// Load activities when the page is loaded
document.addEventListener('DOMContentLoaded', activities);