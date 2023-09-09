const commandLineArgs = require('command-line-args')
const fs = require('fs')

const Gutmann = require('./gutmann');

const optionDefinitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'file', alias: 'f', type: Boolean },
    { name: 'dir', alias: 'd', type: Boolean },
    { name: 'src', type: String, multiple: true, defaultOption: true },
]

const options = commandLineArgs(optionDefinitions)

// Add some simple validations
const valid =
    options.help ||
    (
        /* all supplied files should exist */
        ( options.file ||
        options.dir) &&
        options.src.length &&
        options.src.every(fs.existsSync)
    )

// Exclude option when there are -f and -d exist at the same time
if (options.file && options.dir)
{
    console.log("Pls use only for file(s) or dir(s) at the same time");
    return;
}

// Get listed dir(s) or file(s)
const files = options.src;

// Get the mode
const eraseMode = options.file ? 'file' : options.dir ? 'dir' : undefined;

//const targetPaths = ['PMRS.txt']; // Provide an array of file or directory paths
const targetPaths = files; // Provide an array of file or directory paths
const options1 = {
    file: true, // Set to true for file erase, or false for directory erase
    dir: false, // Set to true for directory erase, or false for file erase
};

const gutmann = new Gutmann(targetPaths, options1, 35);

gutmann.run().then(() => {
    // Code to run after gutmann.run() completes
    console.log("Congrats!");
});