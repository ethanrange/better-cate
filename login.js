function handleCredentials() {
    // Create the browser window.
    uname = document.forms["loginForm"]["uname"].value
    pwd = document.forms["loginForm"]["pwd"].value

    window.api.send('store-creds', uname, pwd);
}

function makeAccountList() {
    let items = [
        'Blue',
        'Red',
        'White',
        'Green',
        'Black',
        'Orange'
    ]

    items.forEach(function(item) {
        let button = document.createElement('button');
        button.id = item;
        button.onclick = function() { alert(button.id); };

        accounts.appendChild(button);

        button.innerHTML += '<i class="fas fa-user"></i>';
        button.innerHTML += item;
    });
}