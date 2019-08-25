function isFolder(filePath){//ファイルが存在していてなおかつフォルダーだったらtrueを返す
    const fs = require("fs");
    return fs.existsSync(filePath)&&fs.statSync(filePath).isDirectory();
}