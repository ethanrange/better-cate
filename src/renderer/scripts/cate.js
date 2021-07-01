let currPeriod;

function setDetails(years, groups, page, username, year, period, group) {
    document.getElementById('user').innerHTML = [username, year, period, group].join(' | ');

    currPeriod = parseInt(period);

    let yearsDiv = document.getElementById('years');
    yearsDiv.innerHTML = '';

    years.forEach(function(item) {
        let yearButton = document.createElement('button');

        yearButton.onclick = function() { setYear(item) };
        yearButton.innerHTML = item;

        yearsDiv.appendChild(yearButton);
    });

    let groupsDiv = document.getElementById('groups');
    groupsDiv.innerHTML = '';

    groups.forEach(function(item) {
        let groupButton = document.createElement('button');

        groupButton.onclick = function() { setGroup(item) };
        groupButton.innerHTML = item;

        groupsDiv.appendChild(groupButton);
    });

    let periodControls = document.getElementsByClassName('nav-links')[0];
    let detailsSpan = document.getElementById('user');

    if (page !== 'timetable') {
        periodControls.style.display = 'none';
        detailsSpan.style.marginLeft = 'auto';
    } else {
        periodControls.style.display = 'block';
        detailsSpan.style.marginLeft = 0;
    }
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

function adjustPeriod(amount) {
    let newPeriod = currPeriod + amount;

    if (newPeriod > 0 && newPeriod < 8) {
        window.api.send('set-period', newPeriod);
    }
}