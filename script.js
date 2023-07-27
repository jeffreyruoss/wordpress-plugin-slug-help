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

const saveSlugsToLocalStorage = (slugs) => {
    localStorage.setItem('ru-tools-slugs', slugs);
}

document.addEventListener('DOMContentLoaded', () => {
    // if a user types in the slugs field, run saveSlugsToLocalStorage(slugs);
    const slugsField = document.getElementById('slugs-field');
    slugsField.addEventListener('keyup', (e)=> {
        console.log('keyup');
        const slugs = getSlugs();
        saveSlugsToLocalStorage(slugs);
    });
});

const loadSlugsFromLocalStorage = () => {
    const slugs = localStorage.getItem('ru-tools-slugs');
    if (slugs) {
        const slugsOnNewLines = slugs.replace(/,/g, '\n');
        const slugsField = document.getElementById('slugs-field');
        slugsField.value = slugsOnNewLines;
        slugsField.classList.remove('placeholder');
        slugsField.setAttribute('data-initial-click', 'false');
    }
}
document.addEventListener('DOMContentLoaded', loadSlugsFromLocalStorage);

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

const sitesNamePathToBashVars2 = () => {
    console.log('sitesNamePathToBashVars2');
    // save value of textarea#site-name-full-path-input-2 to local storage
    const siteNameFullPathInput2 = document.getElementById('site-name-full-path-input-2');
    siteNameFullPathInput2.addEventListener('keyup', (e)=> {
        const value = siteNameFullPathInput2.value;
        localStorage.setItem('ru-tools-site-name-full-path-input-2', value);
    });

    // load value of textarea#site-name-full-path-input-2 from local storage
    const siteNameFullPathInput2Value = localStorage.getItem('ru-tools-site-name-full-path-input-2');
    if (siteNameFullPathInput2Value) {
        siteNameFullPathInput2.value = siteNameFullPathInput2Value;
        siteNameFullPathInput2.classList.remove('placeholder');
        siteNameFullPathInput2.setAttribute('data-initial-click', 'false');
    }

    const populate = () => {
        let pathLines = siteNameFullPathInput2.value.split('\n');
        let data = {};

        pathLines.forEach(line => {
            let parts = line.split('/');
            let site = parts[2]; // assuming site name is always at 3rd position
            let plugin = parts[parts.length - 1]; // last part is plugin name

            if (!data[plugin]) {
                data[plugin] = [];
            }

            if (!data[plugin].includes(site)) {
                data[plugin].push(site);
            }
        });

        let sitesAndPluginsDataDiv = document.getElementById('sites-and-plugins-data');
        sitesAndPluginsDataDiv.innerHTML = '';

        for (let plugin in data) {
            let pluginDiv = document.createElement('div');
            pluginDiv.classList.add('plugin');
            pluginDiv.innerHTML = `<h3>${plugin} <span>(${data[plugin].length})</span></h3>`;
            pluginDiv.innerHTML += `<a href="#" class="cp-copy-sites">Copy sites</a>`;
            data[plugin].forEach(site => {
                pluginDiv.innerHTML += `<p>${site}</p>`;
            });
            sitesAndPluginsDataDiv.appendChild(pluginDiv);
            cpCopySitesHandler(pluginDiv);
        }
    };
    populate();

    // on key up in textarea#site-name-full-path-input-2, run populate()
    siteNameFullPathInput2.addEventListener('keyup', populate);
}
document.addEventListener('DOMContentLoaded', sitesNamePathToBashVars2);


function clearPlaceholderText(textarea) {
    if (textarea.dataset.initialClick === "true") {
        textarea.value = "";
        textarea.dataset.initialClick = "false";
        textarea.classList.remove('placeholder');
    }
}



/** CONTROL PANEL COMMANDS */
const cpCopySites = (e) => {
    e.preventDefault();
    let sites = e.target.parentNode.querySelectorAll('p');
    let sitesArray = [];
    sites.forEach(site => {
        sitesArray.push('\t"' + site.innerText + '"');  // Added a tab character at the beginning of each line for indentation
    });
    let sitesString = "sites=(\n" + sitesArray.join('\n') + "\n)";  // Add sites=( at the beginning and ) at the end
    navigator.clipboard.writeText(sitesString).then(function() {
        console.log('Copying to clipboard was successful!');
    }
    , function(err) {
        console.error('Could not copy text: ', err);
    });
}


const cpCopySitesHandler = (pluginDiv) => {
    const cpCopySitesLink = pluginDiv.querySelector('.cp-copy-sites');
    cpCopySitesLink.addEventListener('click', cpCopySites);
}