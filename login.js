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

        let user = parseHTML('<span class="user"><i class="fas fa-user user-icon"></i></span>');

        let del = document.createElement('span');
        let button = document.createElement('button');

        button.onclick = function() { requestDeletion(item); };
        button.appendChild(parseHTML('<i class="fas fa-window-close delete-icon"></i>'))

        del.className = 'delete';
        del.appendChild(button);

        let item_object = parseHTML('<span>' + item + '</span>');

        li.appendChild(user);
        li.appendChild(item_object);
        li.appendChild(del);
    });
}

function requestDeletion(id) {
    window.api.send('request-deletion', id);
    window.api.receive('request-deletion', handleDeletion);
}

function handleDeletion(success, id) {
    if (success) {
        document.getElementById(id).remove();
    } else {
        alert("Failed to remove account");
    }
}