window.addEventListener('load', initHTML, false);

let frame;

function initHTML() {
    // console.log(document.body);

    // document.querySelectorAll('iframe').forEach(
    //     function(elem) {
    //         elem.parentNode.removeChild(elem);
    //     });

    // document.getElementsByTagName("table")[0].deleteRow(0);
    // document.getElementsByTagName("table")[0].deleteRow(1);
    // document.getElementsByTagName("table")[0].deleteRow(1);

    frame = document.getElementsByName("cateWindow")[0];
}

function printYears() {
    frame.src = "https://cate.doc.ic.ac.uk/personal.cgi?keyp=2019"
}

function navigateTimetable() {
    frame.src = "https://cate.doc.ic.ac.uk/timetable.cgi?period=6&class=c1&keyt=2020:none:none:blank"
}

function navigateGrades() {
    frame.src = "https://cate.doc.ic.ac.uk/student.cgi?key=2020"
}

function navigateInfo() {
    frame.src = "https://cate.doc.ic.ac.uk/personal.cgi?keyp=2020"
}