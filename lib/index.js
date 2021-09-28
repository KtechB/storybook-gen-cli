const fs =  require("fs");
const path = require("path");
const readline = require("readline");
const walkSync = require("./walkSync");


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
try {
  fs.writeFileSync(filePath, txt);
  return true;
} catch(err) {
  console.error(err)
  return false;
}
}



const createFile = (componentPath) =>{

  const pathPattern =  /^.*\.(js|jsx|ts|tsx)$/g;
  if (! componentPath.match(pathPattern)){
    throw `args path:${componentPath} is not (js|jsx|ts|tsx) file!!`
  }
  const dirpath = componentPath.split("/").slice(0, componentPath.split("/").length-1).join("/");
  const filename = componentPath.split("/").slice(-1)[0];
  const componentName= filename.split(".")[0];
  const fileType = filename.split(".").slice(-1)[0];
  
  const saveFilePath = dirpath + "/" + componentName + ".stories."  + fileType;

  let dirpathWithoutTop = componentPath.split("/").slice(1, componentPath.split("/").length-1).join("/");
  dirpathWithoutTop = dirpathWithoutTop ?dirpathWithoutTop+"/" : ""

const template = `
import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";

import ${componentName}  from "./${componentName}";

export default {
  title: "${dirpathWithoutTop}${componentName}",
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
const confirm = async (msg) => {
  const answer = await question(`${msg}(y/n): `);
  return answer.trim().toLowerCase() === 'y';
};

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

module.exports = async () =>{
const [, , firstArg] = process.argv;

// args check
if (!firstArg){
	console.error("Please pass filename")
	process.exit(0);
}
const pathList = walkSync(firstArg, ["jsx", "tsx"]);

console.log("jsx|tsx files are:")
console.log(pathList)
await getAgree()

// create storybooks
pathList.forEach((path) =>
{
try{
  console.log(path)
createFile(path);
} catch(err){
  console.error(err);
  // process.exit(0);
}
}
)


};