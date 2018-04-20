
const {ipcRenderer,desktopCapturer}= require('electron');
window.ipcMacMethod={};




//初始化截屏监听事件
const initShortcutCapture= () =>{

    ipcRenderer.on("shortcut-capture",(e)=>{
        getScreenShotSource();
    })
    ipcRenderer.on("selectSessionChat",()=>{
        selectSessionChat();
    });

    //截取屏幕数据
    ipcMacMethod.onScreenCapture=function(){
        getScreenShotSource();
    }

}


const  dataURLtoBlob= (dataURL) =>{  
        var arr=dataURL.split(","),mime=arr[0].match(/:(.*?);/)[1],
        bstr=atob(arr[1]),n=bstr.length,u8arr=new Uint8Array(n);
        while(n--){
            u8arr[n]=bstr.charCodeAt(n);
        }
        return new Blob([u8arr],{type:mime});
    //   return new Buffer(dataURL,'base64');
}

const  getScreenShotSource= (binder_id) =>{
    let options = { types: ['screen'], thumbnailSize: { width: screen.width, height: screen.height }  }
    desktopCapturer.getSources(options, function (error, sources) {
        if (error) return console.log(error)
            let source=sources[0];
            localStorage['imgdata']=source.thumbnail.toDataURL();//.toPNG();//.
            ipcRenderer.send('shortcut-captureed',sources[0],binder_id)
    
    })
}



initShortcutCapture();

  