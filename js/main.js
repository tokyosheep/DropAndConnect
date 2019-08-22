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
        constructor(target){
            this.target = target;
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
    }
    
    
    class DragToServsr extends Drag{
        constructor(url){
            super(toPhotoshop)
            this.url = url;
        }
        
        async handleEvent(e){
            const pathList = this.getFiles(e);
            console.log(pathList);
            const res = await fetch(this.url,{
                method:"POST",
                body:JSON.stringify(pathList)
            }).catch(err => alert("No response from Photoshop"));
            const flag = await res.text();
            console.log(flag);
        }
    }
    
    const dropToPs = new DragToServsr(PSurl);
    
    class DropAnotherApp extends Drag{
        constructor(target){
            super(target);
        }
        
        handleEvent(e){
            if(!VulcanInterface.isAppRunning(`illustrator`)){
                csInterface.evalScript(`alert("Illustrorが立ち上がっていません")`);
                return;
            }
            const pathList = this.getFiles(e);
            console.log(pathList);
            const vulcanNamespace = VulcanMessage.TYPE_PREFIX + extensionId;
            const msg = new VulcanMessage(vulcanNamespace);
            msg.setPayload(JSON.stringify(pathList));
            VulcanInterface.dispatchMessage(msg);
        }
    }
    const toAi = new DropAnotherApp(toIllustrator);
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
    
