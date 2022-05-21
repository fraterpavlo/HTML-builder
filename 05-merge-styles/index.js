const fsp = require('fs/promises');
const path = require('path');

async function readFolder(pathFolder) {
  try {
    const items = fsp.readdir(pathFolder, { withFileTypes: true });
    return items;
  }
  catch(err) {
    console.error(err);
  }
};

async function readFile(pathFile) {
  try {
    const data = fsp.readFile(pathFile, 'utf8');
    return data;
  }
  catch(err) {
    console.error(err);
  }
};

async function createGeneralCss(srcFolderPath, generalCssPath) {
  try {
    await fsp.writeFile(generalCssPath, '');
    const filesInSrcFolder = await readFolder(srcFolderPath);
    const cssFiles = filesInSrcFolder.filter(file => path.extname(file.name) === '.css');

    for (let file of cssFiles) {
      const fileData = await readFile(path.join(srcFolderPath, file.name));

      fsp.appendFile(generalCssPath, `${fileData}\n`);
    }
    const generalFileName = path.parse(generalCssPath).name;
    console.log(`${generalFileName} has been uploaded!`);
  }
  catch(err) {
    console.error(err);
  }
}
createGeneralCss(path.join(__dirname, 'styles'), path.join(__dirname, 'project-dist', 'bundle.css'));