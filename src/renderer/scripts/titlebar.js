// Send API request to modify window, then switch maximize / restore buttons

function handleTitlebar(btnid, winid) {
    window.api.send('handle-titlebar', btnid, winid);

    if (btnid === "max-button" || btnid === "restore-button") {
        if (document.body.classList.contains('maximized')) {
            document.body.classList.remove('maximized')
        } else {
            document.body.classList.add('maximized');
        }
    }
}