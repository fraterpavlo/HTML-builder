const fs = require('fs');
const process = require('process');

fs.open('02-write-file/text.txt', 'w', function(err){
  if (err) console.log(err);
});

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Hello, dear friend. Enter your text. You can write "exit" or use "ctrl + c" for break this shit');

readline.on('line', (text) => {
  if (text === 'exit') {
    readline.close();
    console.log('***Good luck, bro. Obnyal pripodnyal***');
    return;
  }

  fs.appendFile('02-write-file/text.txt', `${text} \n`, (err) => {
    if(err) throw err;
    console.log('Data has been added!');
  });
});

readline.on('SIGINT', function () {
  console.log('***Exiting, have a nice day***');
  readline.close();
});