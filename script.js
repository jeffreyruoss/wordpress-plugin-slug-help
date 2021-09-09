const getSlugs = function() {
    const slugsField = document.getElementById('slugs-field');
    const slugsStr = slugsField.value.trim();

    return slugsStr.split('\n');
}

const createBashCommand = function(slugs) {
    let command = '';
    slugs.map((slug, index)=>{
        let str = `find /home/**/public_html/wp-content/plugins/ -type d -name "${slug}" -print`;
        if (index + 1 !== slugs.length) {
            str += ' && \n';
        }
        command += str;
    });
    const bashComandField = document.getElementById('output-for-bash-command');
    bashComandField.value = command;
    navigator.clipboard.writeText(command)
        .then(() => {
            console.log('bash command copied to clipboard');
            const bashCmdCopiedMsg = document.getElementById('bash-cmd-copied-msg');
            bashCmdCopiedMsg.style.display = 'block';
        })
        .catch(err => {
            // This can happen if the user denies clipboard permissions:
            console.error('Could not copy bash command to clipboard: ', err);
        });
}

const createJSCommand = function(slugs) {
    let slugsVar = 'var pluginSlugsA = [';
    slugs.map((slug, index)=>{
        let str = `\"${slug}\"`;
        if (index + 1 !== slugs.length) {
            str += ' , ';
        }
        slugsVar += str;
    });
    slugsVar += '];'
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
        createBashCommand(slugs);
    },100);
    setTimeout(function(){
        createJSCommand(slugs);
    },1000);
}

const goButton = document.getElementById('go-button');
goButton.addEventListener('click', (e)=> {
    process();
});

hotkeys('ctrl+enter, command+enter', function (event, handler) {
    event.preventDefault();
    process();
});

hotkeys.filter = function(event){
    return true;
}
