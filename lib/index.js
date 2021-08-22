const fs =  require("fs");
const path = require("path");
const readline = require("readline");


const pathPattern =  /^.*\.(js|jsx|ts|tsx)$/g;

const checkFileExist = (filepath) => {
  let isExist = false;
  try{
  fs.statSync(filepath);
  isExist = true;
  } catch (err){
    isExist = false;
  }
  return isExist;
};

const writeFile = (filePath, txt) =>{
var result = false;
try {
  fs.writeFileSync(filePath, txt);
  return true;
} catch(err) {
  console.error(err)
  return false;
}
}

/**
 * 指定したフォルダ配下のファイルのパスを取得 (同期版)
 * 
 * @param  {String} dir - このパスの配下を検索
 * @param  {String|Array<String>} suffix - (option) ファイル名のサフィックス(拡張子とかを想定)
 * @return {Array<String>} ヒットしたファイルのフルパスの一覧
 */
function walkSync(dir, suffix) {
  let results = [];
  if (fs.statSync(dir).isFile()){
    return [dir]
  }
  let list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.resolve(dir, file);
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(walkSync(file, suffix));
    } else {
      // NOTE: append files with specified suffix:
      if (!suffix || suffix.length <= 0 || _hasSuffix(file, suffix)) {
        results.push(file);
      }
    }
  });
  return results;

  function _hasSuffix(filename, list) {
    if (typeof list === "string") {
      return filename.endsWith(list);
    } else if (Array.isArray(list)) {
      for (let len = list.length, i = 0; i < len; i++) {
        const suffix = list[i];
        if (filename.endsWith(suffix)) {
          return true;
        }
      }
    }
    return false;
  }
}

const createFile = (componentPath) =>{
  if (! componentPath.match(pathPattern)){
    throw `args path:${componentPath} is not (js|jsx|ts|tsx) file!!`
  }
  const dirpath = componentPath.split("/").slice(0, componentPath.split("/").length-1).join("/");
  const filename = componentPath.split("/").slice(-1)[0];
  const componentName= filename.split(".")[0];
  const fileType = filename.split(".").slice(-1)[0];
  
  const saveFilePath = dirpath + "/" + componentName + ".stories."  + fileType;

  const template = `
import { ComponentStory, ComponentMeta } from "@storybook/react";

import ${componentName}  from "./${componentName}";

export default {
  title: "${componentName}",
  component: ${componentName},
} as ComponentMeta<typeof ${componentName}>;

const Template: ComponentStory<typeof ${componentName}> = (args) => (
  <${componentName} {...args} />
);

export const Default = Template.bind({});
Default.args = {
};
`
if (checkFileExist(saveFilePath)){
  throw `file:${saveFilePath} is already exist`
}
else{
 const is_successed = writeFile(saveFilePath, template);

 return is_successed
}

}

const confirm = async (msg) => {
  const answer = await question(`${msg}(y/n): `);
  return answer.trim().toLowerCase() === 'y';
};

/**
 * 標準入力を取得する
 */
const question = (question) => {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    readlineInterface.question(question, (answer) => {
      resolve(answer);
      readlineInterface.close();
    });
  });
};

module.exports = async () =>{
const [, , firstArg] = process.argv;

if (!firstArg){
	console.error("Please pass filename")
	process.exit(0);
}

const ComponentName = firstArg
const pathList = walkSync(firstArg, ["jsx", "tsx"]);

console.log("jsx|tsx files are:")
console.log(pathList)


const getAgree =async () =>{
let userNotConsent = true;
while (userNotConsent){
  if (await( confirm("create all components stories?"))){
    userNotConsent=false;
  }
  else{
  process.exit(0);
  }
}
}
await getAgree()


pathList.forEach((path) =>
{
try{
  console.log(path)
createFile(path);
} catch(err){
  console.error(err);
  process.exit(0);
}
}
)


};