const fs = require('fs');

let stream = new fs.ReadStream('01-read-file/text.txt');

stream.on('readable', function () {
  let data = stream.read();
  if (!data) return;
  console.log(data.toString());
});