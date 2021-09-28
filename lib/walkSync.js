// cite from:https://memo.appri.me/programming/node-get-files-under-dir

module.exports =  function walkSync(dir, suffix) {
  let results = [];
  if (fs.statSync(dir).isFile()){
    return [dir]
  }
  let list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkSync(file, suffix));
    } else {
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