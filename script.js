const autoLineBreakOnPaste = function() {
    const slugsField = document.getElementById('slugs-field');
    slugsField.addEventListener('keydown', function(e) {
       if (e.key === 'v' && e.metaKey || e.key === 'v' && e.ctrlKey) {
           setTimeout(function() {
               slugsField.value += '\r\n';
           }, 100)
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
        path = '/home/*/public_html/';
    } else if (serverType === 'spinupwp') {
        path = '/sites/*/files/';
    }

    slugs = slugs.replace(/,/g, ' ');

    command = `# RU Tools - Find Plugins - ${serverType}\n`;
    command += 'files=(' + slugs + ')\n';
    command += `for dir in ${path}; do\n`;
    command += '    for plugin_dir in "$dir"wp-content/plugins/; do\n';
    command += '        if [[ -d "$plugin_dir" ]]; then\n';
    command += '            for file in "${files[@]}"; do\n';
    command += '                if [[ -d "$plugin_dir$file" ]]; then\n';
    command += '                    echo "$plugin_dir$file"\n';
    command += '                fi\n';
    command += '            done\n';
    command += '        fi\n';
    command += '    done\n';
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
    slugs = slugs.replace(/,/g, '","');
    slugs = '"'+slugs+'"';
    console.log('slugs', slugs);
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

const sitesNamePathToBashVars = function() {
    document.getElementById('site-names-go-button').addEventListener('click', function() {
        var inputText = document.getElementById('site-name-full-path-input').value;
        var lines = inputText.split('\n');
        
        var siteNames = lines.map(function(line) {
            return line.split('/')[2];  // assuming your site names are always at the second position after splitting by '/'
        });
        
        // construct the output string
        var output = 'sites=(\n';
        for(var i = 0; i < siteNames.length; i++) {
            output += '  "' + siteNames[i] + '"\n';
        }
        output += ')';
        
        const siteNameOutput = document.getElementById('site-name-output');
        siteNameOutput.value = output;
        siteNameOutput.classList.remove('placeholder');
        
        // Copy to clipboard
        navigator.clipboard.writeText(output).then(function() {
            console.log('Copying to clipboard was successful!');
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    });   
}
sitesNamePathToBashVars();

function clearPlaceholderText(textarea) {
    if (textarea.dataset.initialClick === "true") {
        textarea.value = "";
        textarea.dataset.initialClick = "false";
        textarea.classList.remove('placeholder');
    }
}