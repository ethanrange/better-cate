// Create object from HTML string
function parseHTML(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
}

function handleCredentials() {
    // Create the browser window.
    uname = document.forms["loginForm"]["uname"].value
    pwd = document.forms["loginForm"]["pwd"].value

    window.api.send('store-creds', uname, pwd);
}

// Request list of stored accounts and await response
function makeAccountList() {
    window.api.send('request-accounts');
    window.api.receive('request-accounts', insertAccounts);
}

// Insert received list of accounts into HTML Div
function insertAccounts(accounts) {
    ul = document.createElement('ul');
    document.getElementById('accounts').appendChild(ul);

    accounts.forEach(function(item) {
        let li = document.createElement('li');
        li.id = item;

        ul.appendChild(li);

        let user = document.createElement('span');
        let userButton = document.createElement('button');

        userButton.onclick = function() { selectLogin(item); };
        userButton.appendChild(parseHTML('<i class="fas fa-user user-icon"></i>'))

        user.className = 'user';
        user.appendChild(userButton);

        let del = document.createElement('span');
        let delButton = document.createElement('button');

        delButton.onclick = function() { requestDeletion(item); };
        delButton.appendChild(parseHTML('<i class="fas fa-window-close delete-icon"></i>'))

        del.className = 'delete';
        del.appendChild(delButton);

        let item_object = parseHTML('<span>' + item + '</span>');

        li.appendChild(user);
        li.appendChild(item_object);
        li.appendChild(del);
    });
}

// Send API request for account deletion
function requestDeletion(id) {
    window.api.send('request-deletion', id);
    window.api.receive('request-deletion', handleDeletion);
}

// Handle API response for account deletion
function handleDeletion(success, id) {
    if (success) {
        document.getElementById(id).remove();
    } else {
        alert("Failed to remove account");
    }
}

// Send API request to login as selected user
function selectLogin(id) {
    window.api.send('attempt-login', id);
}