window.addEventListener('load', initHTML, false);

function initHTML() {
    // frame = document.getElementsByName("cateWindow")[0];
}

function printYears() {
    window.api.send('navigate-path', `personal.cgi?keyp=%YEAR%`);
}

function navigateTimetable() {
    window.api.send('navigate-path', "timetable.cgi?keyt=%YEAR%:%PERIOD%:%GROUP%:%NAME%");
}

function navigateGrades() {
    window.api.send('navigate-path', "student.cgi?key=%YEAR%");
}

function navigateHome() {
    window.api.send('navigate-path', "personal.cgi?keyp=%YEAR%");
}