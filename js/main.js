window.onload = () =>{
    "use strict";
    const csInterface = new CSInterface();
    themeManager.init();
    const toPhotoshop = document.getElementById("toPhotoshop");
    const filePath = csInterface.getSystemPath(SystemPath.EXTENSION) +`/js/`;
    const extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) +`/jsx/`;
    csInterface.evalScript(`$.evalFile("${extensionRoot}json2.js")`);//json2読み込み
    
    prevent_drag_event();
    
    class Drag{
        constructor(){
            this.PSurl = "http://localhost:8000/";
            this.toPS = toPhotoshop;
            this.toPS.addEventListener("dropover",this.handleDragOver);
            this.toPS.addEventListener("drop",this);
        }
        
        handleDragOver(e){
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        }
        
        async handleEvent(e){
            e.stopPropagation();
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            const pathList = files.map(v =>{ return v.path});
            console.log(pathList);
            const res = await fetch(this.PSurl,{
                method:"POST",
                body:JSON.stringify(pathList)
            }).catch(err => alert("No response from Photoshop"));
            const flag = await res.text();
            console.log(flag);
        }
    }
    
    const dropToPs = new Drag();
    
    
}
    
