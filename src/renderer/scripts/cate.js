function navigateTimetable() {
    window.api.send('navigate-path', "timetable.cgi?keyt=%YEAR%:%PERIOD%:%GROUP%:%NAME%");
}

function navigateGrades() {
    window.api.send('navigate-path', "student.cgi?key=%YEAR%");
}

function navigateHome() {
    window.api.send('navigate-path', "personal.cgi?keyp=%YEAR%");
}

function setYear(year) {
    window.api.send('set-year', year);
}