const fsp = require('fs/promises');
const path = require('path');


async function readFolder(pathFolder) {
  try {
    const items = await fsp.readdir(pathFolder, { withFileTypes: true });
    return items;
  }
  catch(err) {
    console.error(err);
  }
}

async function removeFolder(path) {
  await fsp.rm(path, {force: true, recursive: true});
}

async function createFolder(pathDir) {
  try {
    let pathParse = path.parse(pathDir);
    let createdDirName = pathParse.name;
    let parentDirPath = pathParse.dir;
    let itemsInParentDir = await readFolder(parentDirPath);
    let dirAlreadyCreated = itemsInParentDir.some(item => item.isDirectory() && item.name == createdDirName);
    if (dirAlreadyCreated) await removeFolder(pathDir);

    await fsp.mkdir(pathDir, {recursive: true});
  }
  catch(err) {
    console.error(err);
  }
}

async function copyFile(srcFilePath, copyFilePath) {
  try {
    await fsp.copyFile(srcFilePath, copyFilePath);
  }
  catch(err) {
    console.error(err);
  }
}

async function copyFolder(pathSrcDir, pathCopyDir) {
  try {
    await createFolder(pathCopyDir);
    let srcDirItems = await readFolder(pathSrcDir);
    
    for (let item of srcDirItems) {
      const srcItemPath = path.join(pathSrcDir, item.name);
      const copyItemPath = path.join(pathCopyDir, item.name);

      item.isDirectory() 
        ? await copyFolder(srcItemPath, copyItemPath)
        : await copyFile(srcItemPath, copyItemPath);
    }

    const copiedFolderName = path.parse(pathSrcDir).name;
    console.log(`folder "${copiedFolderName}" has been copied!`);
  }
  catch(err) {
    console.error(err);
  }
}

copyFolder(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));
