const { app, BrowserWindow, ipcMain } = require('electron');
const keytar = require('keytar')

const serviceName = 'BetterCATe'

let mainWindow;
let username;

/* ===================================================
 * App listeners
 * =================================================== */

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        width: 640,
        height: 720,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            preload: `${__dirname}/preload.js`
        },
        show: false
    })

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

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
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
    // Switch to 16:9
    mainWindow.hide();
    mainWindow.setSize(1280, mainWindow.getSize()[1]);

    mainWindow.loadURL("https://cate.doc.ic.ac.uk")


    // Work around for redirect
    mainWindow.webContents.once('dom-ready', function() {
        // Recenter window
        mainWindow.center();

        mainWindow.show()
    });
}

function attemptSignup() {
    mainWindow.loadFile("login.html")
}