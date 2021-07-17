#!/usr/bin/env node

const fs = require("fs");
const yargs = require("yargs");
const path = require("path");
const readline = require("readline");
const inquirer = require("inquirer");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Please enter dirname: ", function(inputedPath) {
    const dirPath = path.join(process.cwd(), inputedPath);

    rl.question("Please enter pattern: ", function(inputedPattern) {
        const pattern = inputedPattern;

        chooseFile(dirPath, pattern);
    });
});

rl.on("close", function() {
    process.exit(0);
});

function chooseFile(dirPath, pattern)
{
    const currentDir = fs.readdirSync(dirPath);

    inquirer
        .prompt([{
            name: "fileName",
            type: "list",
            message: "Choose file:",
            choices: currentDir,
        }])
        .then((answer) => {
            const filePath = path.join(dirPath, answer.fileName);

            if (fs.lstatSync(filePath).isDirectory()) {
                chooseFile(filePath, pattern);
            } else {
                findPattern(filePath, pattern)
            }
        });
}

function findPattern(filePath, pattern)
{
    const readStream = new fs.ReadStream(filePath, 'utf8');
    const writeStream = fs.createWriteStream(
        path.join(path.dirname(filePath), 'result-' + path.basename(filePath)),
        {flags: 'a', encoding: 'utf8'}
    );

    readStream.on('data', (chunk) => {
        let stringsArr = chunk.toString().split("\n");

        for(let i = 0; i < stringsArr.length; i++) {
            if (stringsArr[i].includes(pattern)) {
                writeStream.write(stringsArr[i] + "\n");
            }
        }
    });

    readStream.on('end', () => console.log('File reading finished'));
    readStream.on('error', () => console.log(err));
}