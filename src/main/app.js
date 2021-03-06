const { app, BrowserWindow, ipcMain, Menu, BrowserView, screen } = require('electron');
const keytar = require('keytar')

const request = require('request');
const path = require('path');
const scraper = require('./scrape_content.js');
const fs = require('fs');

const menuTemplate = [{
    label: 'BetterCATe',
    submenu: [{
        label: 'Manage Accounts',
        accelerator: process.platform === 'darwin' ? 'Cmd+Shift+A' : 'Ctrl+Shift+A',
        click: function() { attemptSignup(); }
    }]
}]

let loginWin, cateWin, cateScrape;
let username, year, period, group, currUrl;
let groups, years;
let cateWinIPC;

let cateStyle = fs.readFileSync(path.join(path.dirname(__dirname), 'renderer', 'resources', 'injected_style', 'cate.css'), "utf-8");

/* ===================================================
 * App listeners
 * =================================================== */

app.on('ready', function() {
    // Perform sign up if no credentials found
    creds = keytar.findCredentials(app.name);
    creds.then((result) => {
        if (!result.length) {
            attemptSignup();
        } else {
            username = result[0].account;

            attemptLogin();
            // attemptSignup();
        }
    })
})

app.on('login', (event, webContents, request, authInfo, callback) => {
    event.preventDefault();

    getCredentials().then((account) => {
        callback(account.account, account.password);
    })
});

app.on('window-all-closed', function() {
    app.quit()
})

/* ===================================================
 * IPC listeners
 * =================================================== */

ipcMain.on('store-creds', (event, uname, pwd) => {
    storeCredentials(uname, pwd);
})

ipcMain.on('request-accounts', (event, ...args) => {
    creds = keytar.findCredentials(app.name);
    creds.then((credentials) => {
        let accounts = credentials.map(x => x.account);

        event.reply('request-accounts', accounts);
    })
})

ipcMain.on('request-deletion', (event, id) => {
    let deletion = keytar.deletePassword(app.name, id);

    deletion.then((success) => {
        event.reply('request-deletion', success, id);
    })
})

ipcMain.on('attempt-login', (event, id) => {
    username = id;
    attemptLogin();
})

// Todo: Refactor to array of functions
ipcMain.on('handle-titlebar', (event, btnid, winid) => {
    let window = [loginWin, cateWin][winid];

    switch (btnid) {
        case 'min-button':
            window.minimize();
            break;
        case 'max-button':
            window.maximize();
            break;
        case 'restore-button':
            window.restore();
            break;
        case 'close-button':
            window.close();
            break;
    }
})

ipcMain.on('navigate-path', (event, path) => {
    // console.log("Leaving: " + cateScrape.webContents.getURL());

    loadPage("https://cate.doc.ic.ac.uk/" + path);
    // cateScrape.webContents.loadURL("https://cate.doc.ic.ac.uk/" + path);
})

ipcMain.on('set-year', (event, newYear) => {
    console.log("Setting year to " + newYear);
    year = newYear;

    loadPage(currUrl);
})

ipcMain.on('set-group', (event, newGroup) => {
    console.log("Setting group to " + newGroup);
    group = newGroup;

    loadPage(currUrl);
})

ipcMain.on('set-period', (event, newPeriod) => {
    console.log("Setting period to " + newPeriod);
    period = newPeriod;

    loadPage(currUrl);
})

ipcMain.on('establish-catewin', (event) => {
    cateWinIPC = event.sender;
})

/* ===================================================
 * Functions
 * =================================================== */

function storeCredentials(uname, pwd) {
    if (uname && pwd) {
        keytar.setPassword(app.name, uname, pwd);
        username = uname;
        attemptLogin();
    }
}

function attemptLogin() {
    console.log(__dirname);
    // Switch to 16:9, framed window
    cateWin = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(path.dirname(__dirname), 'preload', 'catewin_preload.js')
        },
        show: false,
        frame: false
    })

    let menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // cateWin.loadURL("https://cate.doc.ic.ac.uk")
    cateWin.loadFile(path.join(path.dirname(__dirname), 'renderer', 'content', 'cate-page.html'));

    cateScrape = new BrowserView({
        webPreferences: {
            contextIsolation: true,
            devTools: true
        }
    });

    cateWin.setBrowserView(cateScrape);
    cateScrape.setBounds({ x: 130, y: 92, width: 1150, height: 628 });

    // Autoresize breaks on Windows 10, workaround (May break on secondary monitors)
    // TODO: Fix to work on secondary monitors
    cateWin.on("maximize", function() {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        cateScrape.setBounds({ x: 130, y: 92, width: width - 130, height: height - 92 });
    })

    cateWin.on("unmaximize", function() {
        [width, height] = cateWin.getSize();
        cateScrape.setBounds({ x: 130, y: 92, width: width - 130, height: height - 92 });
    })

    cateScrape.setAutoResize({
        width: true,
        height: true
    })

    // cateScrape.webContents.loadURL("https://cate.doc.ic.ac.uk/");
    initialiseWindow()

    if (loginWin) {
        loginWin.close();
    }

    cateScrape.webContents.on('did-finish-load', () => {
        cateScrape.webContents.insertCSS(cateStyle, 'utf8');
    })

    cateScrape.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) => {
        event.preventDefault();
        loadPage(url);
    })

    cateWin.once('ready-to-show', () => {
        cateWin.show();
        // cateScrape.webContents.openDevTools();
        // cateWin.openDevTools();
    })

    // const filter = {
    //     urls: ['https://cate.doc.ic.ac.uk/timetable.cgi']
    // }

    // cateScrape.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    //     console.log(details);
    //     callback({ requestHeaders: details.requestHeaders })
    // })

}

function attemptSignup() {
    loginWin = new BrowserWindow({
        width: 640,
        height: 720,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(path.dirname(__dirname), 'preload', 'login_preload.js')
        },
        show: false,
        frame: false
    })

    loginWin.loadFile(path.join(path.dirname(__dirname), 'renderer', 'content', 'login.html'))

    if (cateWin) {
        cateWin.close();
    }

    loginWin.once('ready-to-show', () => {
        loginWin.show();
    })
}

function loadPage(url) {
    let pathname = url.split('?')[0].split('/').pop();
    let page = pathname.split('.')[0];

    // Send details to CATeWin when defined
    (async() => {
        while (!cateWinIPC) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        cateWinIPC.send('await-details', years, groups, page, username, year, period, group);
    })();

    currUrl = url;

    url = url.replace('%YEAR%', year);
    url = url.replace('%NAME%', username);
    url = url.replace('%PERIOD%', period);
    url = url.replace('%GROUP%', group);

    console.log("Loading: " + url);

    getCredentials().then((account) => {
        request(url, function(error, response, body) {
            if (!error) {
                if (['student', 'timetable', 'personal'].includes(page)) {
                    modified = scraper.scrape(body, page);

                    if (!modified) {
                        modified = body;
                    }

                    modified = '<base href="https://cate.doc.ic.ac.uk/" target="_blank">' + modified;

                    // Load page into WindowView
                    cateScrape.webContents.loadURL("data:text/html;base64;charset=utf-8," + Buffer.from(modified).toString('base64'));
                } else {
                    cateScrape.webContents.loadURL(url);
                }
            }
        }).auth(account.account, account.password);
    })
}

function getCredentials() {
    creds = keytar.findCredentials(app.name);

    let account = creds.then((result) => {
        if (result.length) {
            // Use selected username if present
            chosen_acc = username ? result.find(acc => acc.account === username) : result[0]

            return chosen_acc;
        } else {
            console.log("No account exists! Please restart the program.");
        }
    })

    return account;
}

function initialiseWindow() {
    getCredentials().then((account) => {
        request("https://cate.doc.ic.ac.uk", function(error, response, body) {
            if (!error) {
                // Set year
                let query = response.request.uri.query;
                year = parseInt(query.split('=').pop().split(':')[0]);

                [period, group] = scraper.setParameters(body);

                loadPage('https://cate.doc.ic.ac.uk/personal.cgi?keyp=%YEAR%:%NAME%')
            }
        }).auth(account.account, account.password);

        request("https://dbc.doc.ic.ac.uk/api/teachdbs/views/curr/classes", function(error, response, body) {
            if (!error) {
                groups = JSON.parse(body).map(c => c.class);
            }
        }).auth(account.account, account.password);

        request("https://dbc.doc.ic.ac.uk/api/teachdbs/views", function(error, response, body) {
            if (!error) {
                years = JSON.parse(body).map(v => '20' + v.view.slice(0, 2)).filter(Number).reverse();
                years.pop();
            }
        }).auth(account.account, account.password);
    })
}