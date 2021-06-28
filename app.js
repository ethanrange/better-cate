const { app, BrowserWindow, ipcMain, Menu, BrowserView } = require('electron');
const keytar = require('keytar')

const request = require('request');
const scraper = require('./scrape_content');

const menuTemplate = [{
    label: 'BetterCATe',
    submenu: [{
        label: 'Manage Accounts',
        accelerator: process.platform === 'darwin' ? 'Cmd+Shift+A' : 'Ctrl+Shift+A',
        click: function() { attemptSignup(); }
    }]
}]

let loginWin;
let cateWin;
let cateScrape;
let username;
let year;

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
            // attemptLogin();
            attemptSignup();
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

        event.sender.send('request-accounts', accounts);
    })
})

ipcMain.on('request-deletion', (event, id) => {
    let deletion = keytar.deletePassword(app.name, id);

    deletion.then((success) => {
        event.sender.send('request-deletion', success, id);
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

    path = path.replace('%YEAR%', year);
    path = path.replace('%NAME%', username);

    console.log("Loading: https://cate.doc.ic.ac.uk/" + path);

    loadPage("https://cate.doc.ic.ac.uk/" + path);
    // cateScrape.webContents.loadURL("https://cate.doc.ic.ac.uk/" + path);
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
    // Switch to 16:9, framed window
    cateWin = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: `${__dirname}/preload.js`
        },
        show: false,
        frame: false
    })

    let menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // cateWin.loadURL("https://cate.doc.ic.ac.uk")
    cateWin.loadFile('./cate-page.html');

    cateScrape = new BrowserView({
        webPreferences: {
            contextIsolation: true,
            devTools: true
        }
    });

    cateWin.setBrowserView(cateScrape);
    cateScrape.setBounds({ x: 70, y: 150, width: 1140, height: 550 });
    cateScrape.setAutoResize({
        horizontal: true,
        vertical: true
    })

    loadPage('https://cate.doc.ic.ac.uk')

    if (loginWin) {
        loginWin.close();
    }

    cateScrape.webContents.on('dom-ready', () => {
        cateScrape.webContents.insertCSS('::-webkit-scrollbar { display: none; }')
        cateScrape.webContents.insertCSS('table {background-color: #eeeeee; }')
        cateScrape.webContents.insertCSS('* { font-family: "Arial", sans-serif; }')
        cateScrape.webContents.insertCSS('* { font-size: 15px; }')
    })

    cateWin.once('ready-to-show', () => {
        cateWin.show();
        // cateScrape.webContents.openDevTools();
    })
}

function attemptSignup() {
    loginWin = new BrowserWindow({
        width: 640,
        height: 720,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: `${__dirname}/preload.js`
        },
        show: false,
        frame: false
    })

    loginWin.loadFile("login.html")

    if (cateWin) {
        cateWin.close();
    }

    loginWin.once('ready-to-show', () => {
        loginWin.show();
    })
}

function loadPage(url) {
    getCredentials().then((account) => {
        request(url, function(error, response, body) {
            if (!error) {
                // Set year
                let query = response.request.uri.query;
                year = parseInt(query.split('=').pop().split(':')[0]);

                let pathname = response.request.uri.pathname;
                let page = pathname.substring(1).split('.')[0];

                let modified = scraper.scrape(body, page);

                if (!modified) {
                    modified = body;
                }

                // Load page into WindowView
                cateScrape.webContents.loadURL("data:text/html;base64;charset=utf-8," + Buffer.from(modified).toString('base64'));
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