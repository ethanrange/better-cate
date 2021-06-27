function handleCredentials() {
    // Create the browser window.
    uname = document.forms["loginForm"]["uname"].value
    pwd = document.forms["loginForm"]["pwd"].value

    window.api.send('store-creds', uname, pwd);
}

function makeAccountList() {
    window.api.send('request-accounts');
    window.api.receive('request-accounts', insertAccounts);
}

function insertAccounts(accounts) {
    ul = document.createElement('ul');
    document.getElementById('accounts').appendChild(ul);

    accounts.forEach(function(item) {
        let li = document.createElement('li');
        li.id = item;

        ul.appendChild(li);

        li.innerHTML = '<span class="user"><i class="fas fa-user user-icon"></i></span><span>' + item +
            '</span><span class="delete"><button><i class="fas fa-window-close delete-icon"></i></button></span>'
    });
}