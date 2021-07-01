const cheerio = require('cheerio');

module.exports = {
    scrape: scrape,
    setParameters: setParameters
};

// Scrape element from page depending on page type
function scrape(body, page) {
    // Replace whitespaces
    body = body.replace(/&nbsp;/g, "")
    const $ = cheerio.load(body);

    switch (page) {
        case 'student':
            {
                // Select Grades table
                let student = $("body > ul:nth-child(9) > table > tbody");

                printScrapedData($);

                // If element is present, return HTML
                return student.length ? String(student.html()) : null;
            }
        case 'timetable':
            {
                // Remove images from page
                // $('img').remove();

                // Select timetable element
                let timetable = $('body > table:nth-child(3)');

                // If element is present, return HTML
                return timetable.length ? '<table>' + timetable.html() + '</table>' : null;
            }
        case 'personal':
            {
                // Select personal info element
                let personal = $('body > form > table > tbody > tr:nth-child(1) > td:nth-child(2)');

                // Select class selector element
                let selector = $('body > form > table > tbody > tr:nth-child(2) > td:nth-child(1) > ul:nth-child(3)');

                // If either elements are not present, return null
                if (!selector.length || !personal.length) {
                    return null;
                }

                // Else return joined HTML
                return personal.html() + '<br>' + selector.html();
            }
    }

    return modified;
}

// Set period and group parameters by scraping homepage
function setParameters(body) {
    const $ = cheerio.load(body);

    let period = $('body > form > table > tbody > tr:nth-child(2) > td:nth-child(1) > ul:nth-child(3) > form > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(6) > td:nth-child(1) > input[checked]')[0].attribs.value
    let group = $('body > form > table > tbody > tr:nth-child(2) > td:nth-child(1) > ul:nth-child(3) > form > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > table > tbody > tr > td > button[style]')[0].attribs.value;

    return [period, group];
}

function printScrapedData($) {
    let scrapedData = [];
    let tableHeaders = [];
    $("body > ul:nth-child(9) > table > tbody > tr > td > table > tbody > tr").each((index, element) => {
        if (index === 0) {
            const ths = $(element).find("th");
            $(ths).each((i, element) => {
                tableHeaders.push(
                    $(element)
                    .text()
                    .toLowerCase()
                );
            });
            return true;
        }
        const tds = $(element).find("td");
        const tableRow = {};
        $(tds).each((i, element) => {
            tableRow[tableHeaders[i]] = $(element).text();
        });
        scrapedData.push(tableRow);
    });

    scrapedData = scrapedData.filter(entry => ['T', 'OT', 'CW'].includes(entry.type) && entry.grade).map(convertGradeScrape);

    console.log(scrapedData);
}

function convertGradeScrape({ exercise, title, grade }) {
    // Split on both ' ' and '/'
    let [mark, max, letter] = grade.split(/[\/ ]/);
    console.log([mark, max, letter]);
    return { exercise, title, mark, max, letter };
}