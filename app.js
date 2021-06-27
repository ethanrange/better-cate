const { app, BrowserWindow, ipcMain } = require('electron');
const keytar = require('keytar')

const serviceName = 'BetterCATe'

let mainWindow;
let username, password;

/* ===================================================
 * App listeners
 * =================================================== */

app.on('ready', function() {
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
        mainWindow.show()
    })
})

app.on('login', (event, webContents, request, authInfo, callback) => {
    event.preventDefault();

    creds = keytar.findCredentials(serviceName);
    creds.then((result) => {
        if (result.length) {
            callback(result[0].account, result[0].password);
        } else {
            console.log("No account exists! Please restart the program.");
            app.restart();
        }
    })
});

/* ===================================================
 * IPC listeners
 * =================================================== */

ipcMain.on('store-creds', (event, uname, pwd) => {
    storeCredentials(uname, pwd);
})

/* ===================================================
 * Functions
 * =================================================== */

function storeCredentials(uname, pwd) {
    if (uname && pwd) {
        keytar.setPassword(serviceName, uname, pwd);
        attemptLogin();
    }
}

function attemptLogin() {
    mainWindow.loadURL("https://cate.doc.ic.ac.uk")
}

function attemptSignup() {
    mainWindow.loadFile("login.html")
}