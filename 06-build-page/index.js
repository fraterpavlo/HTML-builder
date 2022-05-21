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
}

// создаем папку если она не создана 
async function removeFolder(path) {
  await fsp.rm(path, {force: true, recursive: true});
}

async function createFolder(pathDir) {
  try {
    const pathParse = path.parse(pathDir);
    const createdDirName = pathParse.name;
    const parentDirPath = pathParse.dir;
    const itemsInParentDir = await readFolder(parentDirPath);
    const dirAlreadyCreated = itemsInParentDir.some(item => item.isDirectory() && item.name == createdDirName);
    if (dirAlreadyCreated) await removeFolder(pathDir);

    await fsp.mkdir(pathDir, {recursive: true});
  }
  catch(err) {
    console.error(err);
  }
}

async function readFile(pathFile) {
  try {
    const data = fsp.readFile(pathFile, 'utf8');
    return data;
  }
  catch(err) {
    console.error(err);
  }
}

// собираем файл из шаблона и пишем его в папку project
async function buildFileFromTemplate(srcFilePath, componentsFolderPath, destFilePath) {
  
  async function replaceTemplateTags (fileData) {
    try {
      const anyTemplateTagRegExp = new RegExp('{{.+}}', 'g');
      const templateTagsInFileArr = fileData.match(anyTemplateTagRegExp);
      const componentsFolderItems = await readFolder(componentsFolderPath);
      const availableHTMLComponentsArr = componentsFolderItems
        .filter((item) => path.extname(item.name) === '.html')
        .map((item) => (item = item.name.replace('.html', '')));
    
      for (let templateTag of templateTagsInFileArr) {
        const tagName = templateTag.slice(2, -2);
        const isExistingTag = availableHTMLComponentsArr.some(item => item === tagName);
        if (!isExistingTag) console.error(`-XXX-component for tag "${tagName}" not found-XXX-`);

        let componentData = await readFile(path.join(componentsFolderPath, `${tagName}.html`));

        const currentTagRegExp = new RegExp(templateTag, 'g');
        fileData = fileData.replace(currentTagRegExp, componentData);
      };

      return fileData;
    }
    catch(err) {
      console.error(err);
    }
  }


  try {
    const srcFileData = await readFile(srcFilePath);
    const destFileData = await replaceTemplateTags(srcFileData);
    await fsp.writeFile(destFilePath, `${destFileData} \n`);

    const destFileName = path.basename(destFilePath);
    console.log(`${destFileName} has been builded!`);
  }
  catch(err) {
    console.error(err);
  }
}

//собираем файл style.css
async function buildGeneralCss(srcFolderPath, generalCssPath) {
  try {
    await fsp.writeFile(generalCssPath, '');
    const filesInSrcFolder = await readFolder(srcFolderPath);
    const cssFiles = filesInSrcFolder.filter(file => path.extname(file.name) === '.css');

    for (let file of cssFiles) {
      const fileData = await readFile(path.join(srcFolderPath, file.name));

      fsp.appendFile(generalCssPath, `${fileData} \n`);
    }
    const generalFileName = path.basename(generalCssPath);
    console.log(`${generalFileName} has been builded!`);
  }
  catch(err) {
    console.error(err);
  }
}

//копируем папку assets
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

async function buildProject (srcProjectFolder, distProjectFolder) {
  const srcComponentsFolder = path.join(srcProjectFolder, 'components');
  const srcStylesFolder = path.join(srcProjectFolder, 'styles');
  const srcAssetsFolder = path.join(srcProjectFolder, 'assets');
  const srcTemplateFile = path.join(srcProjectFolder, 'template.html');

  try {
    await createFolder(distProjectFolder);
    await buildFileFromTemplate(srcTemplateFile, srcComponentsFolder, path.join(distProjectFolder, 'index.html'));
    await buildGeneralCss(srcStylesFolder, path.join(distProjectFolder, 'style.css'));
    await copyFolder(srcAssetsFolder, path.join(distProjectFolder, 'assets'));

    console.log('***Project has been builded***');
  }
  catch(err) {
    console.error(err);
  }
}

buildProject (__dirname, path.join(__dirname, 'project-dist'));