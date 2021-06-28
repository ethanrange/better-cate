const cheerio = require('cheerio');

module.exports = {
    scrape: scrape
};

function scrape(body, page) {
    body = body.replace(/&nbsp;/g, "")
    const $ = cheerio.load(body);

    console.log(page);

    switch (page) {
        case 'student':
            {
                return String($("body > ul:nth-child(9) > table > tbody").html());
            }
        default:
            {
                return null;
            }
    }

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