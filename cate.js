window.addEventListener('load', initHTML, false);

function initHTML() {
    // frame = document.getElementsByName("cateWindow")[0];
}

function printYears() {
    window.api.send('navigate-path', `personal.cgi?keyp=%YEAR%`);
}

function navigateTimetable() {
    window.api.send('navigate-path', "timetable.cgi?period=6&class=c1&keyt=%YEAR%:none:none:%NAME%");
}

function navigateGrades() {
    window.api.send('navigate-path', "student.cgi?key=%YEAR%");
}

function navigateInfo() {
    window.api.send('navigate-path', "personal.cgi?keyp=%YEAR%");
}