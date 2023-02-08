const autoLineBreakOnPaste = function() {
    const slugsField = document.getElementById('slugs-field');
    slugsField.addEventListener('keydown', function(e) {
       if (e.key === 'v' && e.metaKey || e.key === 'v' && e.ctrlKey) {
           setTimeout(function() {
               slugsField.value += '\r\n';
           }, 10)
       }
    });
}
autoLineBreakOnPaste();

const getSlugs = function() {
    const slugsField = document.getElementById('slugs-field');
    let slugs = slugsField.value.trim();
    return slugs.replace(/\r?\n|\r/g, ',');
}

const createBashCommand = function(slugs, serverType) {
    let command = '';
    let path = '';
    if (serverType === 'cpanel') {
        path = '/home/**/public_html/wp-content/plugins/';
    } else if (serverType === 'spinupwp') {
        path = '/sites/**/files/wp-content/plugins/';
    }

    slugs = slugs.replace(/,/g, ' ');

    command = 'files=('+slugs+')\nfor file in "${files[@]}"; do\n';
    command += '    find '+path+' -type d -name "$file" -print\n';
    command += 'done';

    const bashComandField = document.getElementById(`output-for-bash-command-${serverType}`);
    bashComandField.value = command;
    navigator.clipboard.writeText(command)
      .then(() => {
          console.log(`bash command copied to clipboard (${serverType})`);
          const bashCmdCopiedMsg = document.getElementById(`bash-cmd-copied-msg-${serverType}`);
          bashCmdCopiedMsg.style.display = 'block';
      })
      .catch(err => {
          // This can happen if the user denies clipboard permissions:
          console.error(`Could not copy bash command (${serverType}) to clipboard: `, err);
      });
}


const createJSCommand = function(slugs) {
    let slugsVar = `var pluginSlugsA = [${slugs}];`;
    const jsCommandField = document.getElementById('output-for-js-command');
    const jsCommandHiddenField = document.getElementById('js-command-hidden');
    let jsCommandHiddenFieldValue = jsCommandHiddenField.value;
    let command = jsCommandHiddenFieldValue.replace('var pluginSlugsA = ["plugin-one", "plugin-two", "plugin-three"];',slugsVar);
    jsCommandField.value = command;
    navigator.clipboard.writeText(command)
        .then(() => {
            console.log('js command copied to clipboard');
            const jsCmdCopiedMsg = document.getElementById('js-cmd-copied-msg');
            jsCmdCopiedMsg.style.display = 'block';
        })
        .catch(err => {
            // This can happen if the user denies clipboard permissions:
            console.error('Could not copy js command to clipboard: ', err);
        });
}

const process = function() {
    const slugs = getSlugs();
    setTimeout(function(){
        createBashCommand(slugs, 'cpanel');
    },100);
    setTimeout(function(){
        createBashCommand(slugs, 'spinupwp');
    },500);
    setTimeout(function(){
        createJSCommand(slugs);
    },1000);
}

const goButton = document.getElementById('go-button');
goButton.addEventListener('click', (e)=> {
    process();
});

const slugsField = document.getElementById('slugs-field');
slugsField.addEventListener('keydown', (e)=> {
    if (e.key === 'Enter' && e.metaKey || e.key === 'Enter' && e.ctrlKey) {
        process();
    }
});
