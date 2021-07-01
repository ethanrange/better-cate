function setDetails(...args) {
    document.getElementById('user').innerHTML = args.join(' | ');
    console.log("Setting details!");
}

window.api.receive('await-details', setDetails);
window.api.send('establish-catewin');

// Send API request for navigation to particular page

function navigateTimetable() {
    window.api.send('navigate-path', "timetable.cgi?keyt=%YEAR%:%PERIOD%:%GROUP%:%NAME%");
}

function navigateGrades() {
    window.api.send('navigate-path', "student.cgi?key=%YEAR%");
}

function navigateHome() {
    window.api.send('navigate-path', "personal.cgi?keyp=%YEAR%");
}

// Set year variable

function setYear(year) {
    window.api.send('set-year', year);
}