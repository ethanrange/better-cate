const cheerio = require('cheerio');

module.exports = {
    scrape: scrape,
    setParameters: setParameters
};

function scrape(body, page) {
    body = body.replace(/&nbsp;/g, "")
    const $ = cheerio.load(body);
    switch (page) {
        case 'student':
            {
                let student = $("body > ul:nth-child(9) > table > tbody");

                if (!student.length) {
                    return null;
                }

                return String(student.html());
            }
        case 'timetable':
            {
                // $('img').remove();

                let timetable = $('body > table:nth-child(3)');

                if (!timetable.length) {
                    return null;
                }

                return '<table>' + timetable.html() + '</table>';
            }
        case 'personal':
            {
                // let selector = $('body > form > table > tbody > tr:nth-child(2) > td:nth-child(1) > ul:nth-child(3) > form > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td');
                let selector = $('body > form > table > tbody > tr:nth-child(2) > td:nth-child(1) > ul:nth-child(3)');
                let personal = $('body > form > table > tbody > tr:nth-child(1) > td:nth-child(2)');

                // selector.children('form').attr('action', "@@request-timetable")
                // selector.children('form').attr('method', "post")

                if (!selector.length || !personal.length) {
                    return null;
                }

                return selector.html() + '<br>' + personal.html();
            }
    }

    return modified;

    // const scrapedData = [];
    // const tableHeaders = [];
    // $("body > ul:nth-child(9) > table > tbody > tr > td > table > tbody > tr").each((index, element) => {
    //     if (index === 0) {
    //         const ths = $(element).find("th");
    //         $(ths).each((i, element) => {
    //             tableHeaders.push(
    //                 $(element)
    //                 .text()
    //                 .toLowerCase()
    //             );
    //         });
    //         return true;
    //     }
    //     const tds = $(element).find("td");
    //     const tableRow = {};
    //     $(tds).each((i, element) => {
    //         tableRow[tableHeaders[i]] = $(element).text();
    //     });
    //     scrapedData.push(tableRow);
    // });

    // console.log(scrapedData);
}

function setParameters(body) {
    const $ = cheerio.load(body);

    let period = 1; //$('body > form > table > tbody > tr:nth-child(2) > td:nth-child(1) > ul:nth-child(3) > form > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(6) > td:nth-child(1) > input[checked]')[0].attribs.value
    let group = 'c1';

    return [period, group];
}