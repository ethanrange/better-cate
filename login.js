function handleCredentials() {
    // Create the browser window.
    uname = document.forms["loginForm"]["uname"].value
    pwd = document.forms["loginForm"]["pwd"].value

    window.api.send('store-creds', uname, pwd);
}