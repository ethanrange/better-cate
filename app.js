const { app, BrowserWindow, ipcMain, Menu, BrowserView } = require('electron');
const keytar = require('keytar')
const fs = require('fs')

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
let username;

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
            attemptLogin();
        }
    })
})

app.on('login', (event, webContents, request, authInfo, callback) => {
    event.preventDefault();

    creds = keytar.findCredentials(app.name);
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

ipcMain.on('handle-titlebar', (event, id) => {
    switch (id) {
        case 'min-button':
            loginWin.minimize();
            break;
        case 'max-button':
            loginWin.maximize();
            break;
        case 'restore-button':
            loginWin.restore();
            break;
        case 'close-button':
            loginWin.close();
            break;
    }
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
        show: false
    })

    let menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // cateWin.loadURL("https://cate.doc.ic.ac.uk")
    cateWin.loadFile('./cate-page.html');

    // const view = new BrowserView({
    //     webPreferences: {
    //         devTools: true,
    //         contextIsolation: true,
    //         preload: require('path').resolve(__dirname, 'cate.js')
    //     }
    // });

    // cateWin.setBrowserView(view);
    // view.setBounds({ x: 0, y: 0, width: 300, height: 300 });
    // view.webContents.loadURL('https://cate.doc.ic.ac.uk')

    if (loginWin) {
        loginWin.close();
    }

    // cateWin.webContents.once('dom-ready', () => {
    //     //     //     // cateWin.webContents.executeJavaScript('document.getElementsByTagName("link")[1].remove()');
    //     //     //     // cateWin.webContents.executeJavaScript("window.api.send('send-html', document.body.innerHTML);");
    //     //     //     // console.log(cateWin.webContents.get);
    //     //     //     // cateWin.webContents.insertCSS(fs.readFileSync('./cate-improved.css', 'utf8'));
    //     //     cateWin.webContents.executeJavaScript('document.head.innerHTML += "<script src=\'./cate.js\'></script>"').then((result) => {
    //     //         console.log(result)
    //     //     })

    //     //     cateWin.webContents.executeJavaScript('initHTML();').then((result) => { console.log(result) })
    // })

    cateWin.once('ready-to-show', () => {
        cateWin.show();
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