window.onload = () =>{
    "use strict";
    const csInterface = new CSInterface();
    themeManager.init();
    const extensionId = csInterface.getExtensionID(); 
    const toPhotoshop = document.getElementById("toPhotoshop");
    const toIllustrator = document.getElementById("toIllustrator");
    const change = document.getElementById("change");
    const IllustratorArea = document.getElementById("IllustratorArea");
    const PhotoshopArea = document.getElementById("PhotoshopArea");
    const filePath = csInterface.getSystemPath(SystemPath.EXTENSION) +`/js/`;
    const extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) +`/jsx/`;
    const PSurl = "http://localhost:8000/";
    const imgExt = [".tif",".tiff",".jpg",".jpeg",".psd",".psb",".png",".gif",".eps"];
    
    

    const fs = require("fs");
    const path = require("path"); 
    csInterface.evalScript(`$.evalFile("${extensionRoot}json2.js")`);//json2読み込み
    
    prevent_drag_event();
    
    class ModeManage{
        constructor(btn,areas){
            this.btn = btn;
            this.areas = areas;
            this.btn.addEventListener("click",this);
        }
        
        handleEvent(){
            this.areas.forEach(v=>{
                if(v.classList.contains("hide")){
                    v.classList.remove("hide");
                }else{
                    v.classList.add("hide");
                }
            });
        }
    }
    
    const modeChange = new ModeManage(change,[PhotoshopArea,IllustratorArea]);
    
    class Drag{
        constructor(target,app){
            this.target = target;
            this.app = app;
            this.target.addEventListener("dropover",this.handleDragOver);
            this.target.addEventListener("drop",this);
        }
        
        handleDragOver(e){
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        }
        
        handleEvent(){}
        
        getFiles(e){
            e.stopPropagation();
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            const pathList = files.map(v =>{ return v.path});
            return pathList;
        }
        
        isAI(array){
            return array.every(ext => ext === ".ai");
        }
        
        isAnImg(array){
            if( array.length > 1){ 
                alert("image files shold be one")    
                return false;
            }
            return imgExt.some(e => e === array[0]);
        }
        
        isImgs(array){
            return array.every(ext => imgExt.some(e => e === ext));
        }
        
        filterFolderImg(folderPath){
            if(!isFolder(folderPath[0]) || folderPath.length < 1){
                return folderPath.filter(v => imgExt.some(e=> e === path.extname(v).toLowerCase() ));
            }else{
                const files = fs.readdirSync(folderPath[0]);
                const images = files.filter(v => imgExt.some(e=> e === path.extname(v).toLowerCase() ));
                return images.map(v => path.join(folderPath[0],v));//取得したパスを全て絶対パスに変換;
            }
        }
        
        
        sendMassage(object){
            const vulcanNamespace = VulcanMessage.TYPE_PREFIX + extensionId;
            const msg = new VulcanMessage(vulcanNamespace);
            msg.setPayload(JSON.stringify(object));
            VulcanInterface.dispatchMessage(msg);
        }
        
        isAppRun(){
            if(!VulcanInterface.isAppRunning(this.app)){
                csInterface.evalScript(`alert("${this.app}が立ち上がっていません")`);
                return false;
            }
            return true;
        }
    }
    
    
    class DragToPhotoshop extends Drag{
        constructor(app){
            super(toPhotoshop,app)
            //this.url = url;
        }
        
        /*
        async handleEvent(e){
            let fileList
            const pathList = this.getFiles(e);
            fileList = this.filterFolderImg(pathList);
            console.log(fileList);
            
            const res = await fetch(this.url,{
                method:"POST",
                body:JSON.stringify(fileList)
            }).catch(err => alert("No response from Photoshop"));
            const flag = await res.text();
            console.log(flag);
        }
        */
        async handleEvent(e){
            if(!this.isAppRun()) return false;
            const pathList = this.getFiles(e);
            const fileList = this.filterFolderImg(pathList);
            console.log(fileList);
            const object = {
                fileList:fileList,
                app:this.app
            }
            this.sendMassage(object);
        }
    }
    
    const dropToPs = new DragToPhotoshop("photoshop");
    
    class DropAnotherAI extends Drag{
        constructor(target,app){
            super(target,app);
        }
        
        handleEvent(e){
            if(!this.isAppRun()) return false;
            const pathList = this.getFiles(e);
            console.log(pathList);
            const extensions = pathList.map(f=> path.extname(f).toLowerCase());
            //if(!this.isAI(extensions)&&!this.isAnImg(extensions)) return;
            const object = {
                AI:this.isAI(extensions),
                img:this.isAnImg(extensions),
                folder:(isFolder(pathList[0])&&pathList.length == 1),
                pathList:pathList,
                app:this.app
            }
            console.log(object);
            this.sendMassage(object);
        }
    }
    
    const toAi = new DropAnotherAI(toIllustrator,"illustrator");
    console.log(VulcanInterface.isAppRunning(`bridge`)); // false
    
    class ListeningMs{
        constructor(sender){
            this.sender = sender;
            const vulcanNamespace = VulcanMessage.TYPE_PREFIX + this.sender;
            VulcanInterface.addMessageListener(vulcanNamespace,this.recive);
        }
        
        async recive(message){
            console.log(message);
            const object = await messageHandler(message).catch(err => alert(err));
            console.log("Message Payload: ", object);
            
            
            function messageHandler(message){
                return new Promise(resolve=>{
                    const payload = VulcanInterface.getPayload(message);
                    const object = JSON.parse(payload);
                    resolve(object);
                });    
            }
        }
    
        
    }
    const hear = new ListeningMs("DropFrombridge");
}
    
