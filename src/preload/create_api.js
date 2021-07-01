const {
    contextBridge,
    ipcRenderer
} = require("electron");

const VALID_SEND = ['store-creds', 'request-accounts', 'request-deletion', 'attempt-login', 'handle-titlebar', 'navigate-path', 'set-year', 'establish-catewin'];
const VALID_REC = ['request-accounts', 'request-deletion', 'await-details'];

contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, ...args) => {
            // whitelist channels
            if (VALID_SEND.includes(channel)) {
                ipcRenderer.send(channel, ...args);
            }
        },
        receive: (channel, func) => {
            if (VALID_REC.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);