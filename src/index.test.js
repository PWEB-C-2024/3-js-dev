const {
  startTimer,
  stopTimer,
  formatTime,
  calculatePerformance,
  parseTargetTime,
  activities,
} = require("./main");

describe("Productivity Tracker App - Global Scope Tests", () => {
  beforeEach(() => {
    // Mock the DOM structure used in the app
    document.body.innerHTML = `
      <ul>
        <li>
          <div class="activity-info" data-activity="1">
            <h5>Activity 1</h5>
            <p id="currentTime-1">00:00.00</p>
            <div class="buttons">
              <button class="stop" data-activity="1">Stop</button>
              <button class="start" data-activity="1">Start</button>
            </div>
            <p class="target-time">Target time: 01:10.34</p>
          </div>
        </li>
      </ul>
      <table border="1" id="activityTable">
        <thead>
          <tr>
            <th data-sort="activity">Activity</th>
            <th data-sort="target">Target</th>
            <th data-sort="time">Time Tracked</th>
            <th data-sort="performance">Performance</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  test("startTimer should update the time display every 100ms", () => {
    jest.useFakeTimers();
    startTimer(1);

    jest.advanceTimersByTime(300);
    const currentTime = document.querySelector("#currentTime-1").textContent;

    expect(currentTime).not.toBe(formatTime(0));
    jest.clearAllTimers();
  });

  test("stopTimer should reset the timer and add an activity row", () => {
    jest.useFakeTimers();
    startTimer(1);

    jest.advanceTimersByTime(5000);
    stopTimer(1);

    const currentTime = document.querySelector("#currentTime-1").textContent;
    expect(currentTime).toBe(formatTime(0));

    const tableRows = document.querySelectorAll("#activityTable tbody tr");
    expect(tableRows.length).toBe(1);
  });
});

describe("DOM load event", () => {
  beforeEach(() => {
    localStorage.clear();

    const savedActivities = JSON.stringify([
      {
        activityid: 1,
        activity: "Activity 1",
        target: "01:10.34",
        time: "00:30.00",
        performance: "50%",
      },
      {
        activityid: 2,
        activity: "Activity 2",
        target: "05:00.27",
        time: "02:30.00",
        performance: "50%",
      },
    ]);
    localStorage.setItem("activities", savedActivities);

    document.body.innerHTML = `
      <table border="1" id="activityTable">
        <thead>
          <tr>
            <th data-sort="activity">Activity</th>
            <th data-sort="target">Target</th>
            <th data-sort="time">Time Tracked</th>
            <th data-sort="performance">Performance</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;
  });

  test("activities should load saved activities from localStorage", () => {
    activities();

    const tableRows = document.querySelectorAll("#activityTable tbody tr");
    expect(tableRows.length).toBe(2);

    expect(tableRows[0].cells[0].textContent).toBe("Activity 1");
    expect(tableRows[1].cells[0].textContent).toBe("Activity 2");
  });
});

describe("formatTime", () => {
  test("formats time correctly for 1 minute and 30 seconds", () => {
    const result = formatTime(90000);
    expect(result).toBe("01:30.00");
  });

  test("formats time correctly for 45 seconds", () => {
    const result = formatTime(45000);
    expect(result).toBe("00:45.00");
  });

  test("formats time correctly for 1 minute, 5 seconds, and 500 milliseconds", () => {
    const result = formatTime(65500);
    expect(result).toBe("01:05.50");
  });
});

describe("parseTargetTime", () => {
  test("parses time string '02:15.50' to milliseconds", () => {
    const result = parseTargetTime("02:15.50");
    expect(result).toBe(135050); //
  });

  test("parses time string '00:30.00' to milliseconds", () => {
    const result = parseTargetTime("00:30.00");
    expect(result).toBe(30000);
  });

  test("parses time string '10:00.00' to milliseconds", () => {
    const result = parseTargetTime("10:00.00");
    expect(result).toBe(600000);
  });
});

describe("calculatePerformance", () => {
  test("calculates performance correctly when time taken is less than target", () => {
    const result = calculatePerformance(80000, 100000);
    expect(result).toBe("125%");
  });

  test("calculates performance correctly when time taken equals target", () => {
    const result = calculatePerformance(60000, 60000);
    expect(result).toBe("100%");
  });

  test("calculates performance correctly when time taken is more than target", () => {
    const result = calculatePerformance(120000, 60000);
    expect(result).toBe("50%");
  });
});
