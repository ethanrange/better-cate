const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const keytar = require('keytar')

const serviceName = 'BetterCATe'

const menuTemplate = [{
    label: 'BetterCATe',
    submenu: [{
        label: 'Manage Accounts',
        accelerator: process.platform === 'darwin' ? 'Cmd+Shift+A' : 'Ctrl+Shift+A',
        click: function() { attemptSignup(); }
    }]
}]

let mainWindow;
let username;

/* ===================================================
 * App listeners
 * =================================================== */

app.on('ready', function() {
    // Perform sign up if no credentials found
    creds = keytar.findCredentials(serviceName);
    creds.then((result) => {
        if (!result.length) {
            attemptSignup();
        } else {
            attemptSignup();
            // attemptLogin();
        }
    })
})

app.on('login', (event, webContents, request, authInfo, callback) => {
    event.preventDefault();

    creds = keytar.findCredentials(serviceName);
    creds.then((result) => {
        if (result.length) {
            let account;

            // Use selected username if present
            account = username ? result.find(acc => acc.account === username) : result[0];

            callback(account.account, account.password);
        } else {
            console.log("No account exists! Please restart the program.");
        }
    })
});

/* ===================================================
 * IPC listeners
 * =================================================== */

ipcMain.on('store-creds', (event, uname, pwd) => {
    storeCredentials(uname, pwd);
})

ipcMain.on('request-accounts', (event, ...args) => {
    creds = keytar.findCredentials(serviceName);
    creds.then((credentials) => {
        let accounts = credentials.map(x => x.account);

        event.sender.send('request-accounts', accounts);
    })
})

ipcMain.on('request-deletion', (event, id) => {
    let deletion = keytar.deletePassword(serviceName, id);

    deletion.then((success) => {
        event.sender.send('request-deletion', success, id);
    })
})

ipcMain.on('attempt-login', (event, id) => {
    username = id;
    attemptLogin();
})

ipcMain.on('handle-titlebar', (event, id) => {
    switch (id) {
        case 'min-button':
            mainWindow.minimize();
            break;
        case 'max-button':
            mainWindow.maximize();
            break;
        case 'restore-button':
            mainWindow.restore();
            break;
        case 'close-button':
            mainWindow.close();
            break;
    }
})

/* ===================================================
 * Functions
 * =================================================== */

function storeCredentials(uname, pwd) {
    if (uname && pwd) {
        keytar.setPassword(serviceName, uname, pwd);
        username = uname;
        attemptLogin();
    }
}

function attemptLogin() {
    if (mainWindow) {
        mainWindow.hide();
    }

    // Switch to 16:9, framed window
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: `${__dirname}/preload.js`
        },
        show: false
    })

    let menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    mainWindow.loadURL("https://cate.doc.ic.ac.uk")

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })
}

function attemptSignup() {
    if (mainWindow) {
        mainWindow.hide();
    }

    mainWindow = new BrowserWindow({
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

    mainWindow.loadFile("login.html")

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })
}