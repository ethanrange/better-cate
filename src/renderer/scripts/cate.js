function setDetails(classes, ...details) {
    document.getElementById('user').innerHTML = details.join(' | ');

    let groups = document.getElementById('groups');

    classes.forEach(function(item) {
        let groupButton = document.createElement('button');

        groupButton.onclick = function() { setGroup(item) };
        groupButton.innerHTML = item;

        groups.appendChild(groupButton);
    });
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

// Set group variable

function setGroup(group) {
    window.api.send('set-group', group);
}