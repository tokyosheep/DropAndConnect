(function(){
    JSON.stringify(readPlaced(app.document.selections));
    function readPlaced(files){
        var fls = isSelect(files);
        if (!fls) return false; 
        var prop = "Ingredients";
        var ns ="http://ns.adobe.com/xap/1.0/mm/";// === XMPConst.NS_XMP_MM
        if(xmpLib==undefined) var xmpLib = new ExternalObject('lib:AdobeXMPScript');
        var xmpFile = new XMPFile(fls, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_READ);
        //ライブラリ読み込み
        var xmpPackets = xmpFile.getXMP();
        var xmp = new XMPMeta(xmpPackets.serialize());
        $.writeln(XMPConst.NS_XMP_MM);
        //$.writeln(xmp.getProperty(XMPConst.NS_XMP_MM, "Ingredients[1]/stRef:filePath").toString());
        $.writeln(xmp.countArrayItems(ns,prop));//対象の要素の配列の長さを取得
        /*
        XMPファイルオブジェクトからパケットを抽出します。
        続いてメタデータのシリアライズ処理を行ないます。ここまでの処理は定型だと考えて良いでしょう。
        メタデータ全体がシリアライズされて読み出す準備が整いました。
        */
        var images = [];
        for(var i=1/*xmpの配列は1から始まるので注意*/;i<=xmp.countArrayItems(ns,prop);i++){
            //$.writeln(xmp.getProperty(ns,prop +"["+i+"]"+"/stRef:filePath").toString());
            images[i] = xmp.getProperty(ns,prop +"["+i+"]"+"/stRef:filePath").toString();
            $.writeln(images[i]);
        }
        return(images);
    }
    
    function isSelect(select){
        if(select.length != 1){
            alert("select file just one");
            return false;
        }
        $.writeln(select[0].name);
        var nameProp = select[0].name.split(".");
        var ext = nameProp[nameProp.length-1].toLowerCase();
        $.writeln(ext);
        
        if(ext !== "ai"&&ext !== "pdf"){
            alert("you must select Illustrator data!");
            return false;
        }
        return select[0];
    }
})();