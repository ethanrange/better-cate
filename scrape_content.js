const cheerio = require('cheerio');

module.exports = {
    scrape: scrape
};

function scrape(body, page) {
    body = body.replace(/&nbsp;/g, "")
    const $ = cheerio.load(body);

    let modified = $.html();
    let period;

    switch (page) {
        case 'student':
            {
                modified = String($("body > ul:nth-child(9) > table > tbody").html());
                break;
            }
        case 'timetable':
            {
                $('img').remove();
                modified = '<table>'

                modified += String($('body > table:nth-child(3)').html()) + '</table>';
                break;
            }
        case 'personal':
            {
                period = $('body > form > table > tbody > tr:nth-child(2) > td:nth-child(1) > ul:nth-child(3) > form > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(6) > td:nth-child(1) > input[checked]')[0].attribs.value

                modified = String($('body > form > table > tbody > tr:nth-child(2) > td:nth-child(1) > ul:nth-child(3) > form > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td').html());
                modified += String($('body > form > table > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody'));
                break;
            }
    }

    return [modified, period, 'c1'];

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