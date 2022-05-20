const fs = require('fs');
const path = require('path');


const secretFolder = path.join(__dirname, 'secret-folder');
fs.readdir(path.join(secretFolder), { withFileTypes: true }, (err, items) => {
  if(err) throw err;

  let files = items.filter(file => file.isFile());

  for (let file of files){
    let ext = path.extname(file.name).slice(1);
    let name = path.basename(file.name, ext).slice(0, -1);

    fs.stat(path.join(secretFolder, file.name), (errStat, status) => {
      if(errStat) throw errStat;

      let size = Math.round(status.size / 1024);
      console.log(
        name + ' - ' + ext + ' - ' + size + 'kb'
      );
    });
  }
});