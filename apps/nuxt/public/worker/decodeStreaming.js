var status1 = false
var offsetCanvas = null
var ctx = null
var width = 0
var height = 0
var ws01 = null
var ws01Int = null
var fps = 0
var fliter = 0
var frontPlayStatus = 0
var pattern = null
var encodeObj = (data) => {
    const obj = data;

    // 使用 TextEncoder 将对象编码为二进制数据
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(obj));

    // 创建一个 ArrayBuffer 并将编码后的数据存储其中
    const buffer = new ArrayBuffer(encodedData.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < encodedData.length; i++) {
        view[i] = encodedData[i];
    }
    return buffer
}
var intbufferCode = null
var intbufferCodest = false
var fasss = 0
var connectWs01 = () => {
    // ws01 = new WebSocket("ws://192.168.0.128:8701/");
    // ws01 = new WebSocket("ws://192.168.0.173:8701/");
    ws01 = new WebSocket("ws://localhost:8701/");
    ws01.onopen = (e) => {
        console.log('(wk)串流連接成功::8701');
    }
    ws01.onclose = (e) => {
        console.log("(wk)串流連接中斷::8701");
        console.log("(wk)嘗試重新連結...::8701");
        if (ws01Int !== null) {
            clearTimeout(ws01Int)
        }
        // ws01Int = setTimeout(() => {
        //     connectWs01()
        //     clearTimeout(ws01Int)
        //     ws01Int = null
        // }, 3000)
    }
    // var index = 0
    ws01.onmessage = (event) => {
        var data = event.data
        // console.log("xxx", data);
        fasss++
        if (status1) {
            var data = JSON.parse(event.data)
            // console.log(data);
            if (pattern !== data.pattern) {
                pattern = data.pattern
                // var bufferCode = encodeObj({
                //     type: 'pattern', parameter: {
                //         pattern
                //     }
                // })
                var co = ['rainbow', 'gray', 'iron']
                var fineindex = co.findIndex((item) => item === pattern)
                // console.log(pattern);
                const sharedBuffer = new ArrayBuffer( // (A)
                    2 * Int32Array.BYTES_PER_ELEMENT); // 10 個 int
                const sharedArray = new Float32Array(sharedBuffer); // (C)
                sharedArray[0] = 1
                sharedArray[1] = fineindex
                self.postMessage(sharedBuffer, [sharedBuffer]);
                // self.postMessage(bufferCode, [bufferCode]);
            }
            var runimg = () => {
                if (offsetCanvas !== null) {
                    var frame = 'data:image/png;base64, ' + data.frame
                    var x = new XMLHttpRequest();
                    x.responseType = 'blob';
                    x.open('GET', frame, true);
                    x.onload = function (e) {
                        // console.log(x);
                        // ctx.drawImage(data, 0, 0);
                        if (x.status === 200) {
                            // 判斷請求成功
                            var blob = x.response;
                            if (blob.size > 10) {
                                createImageBitmap(blob)
                                    .then(bitmap => {
                                        // console.log(bitmap);
                                        // 計算圖片的縮放比例
                                        var scaleX = width / bitmap.width;
                                        var scaleY = height / bitmap.height;
                                        var scale = Math.max(scaleX, scaleY);

                                        // 計算圖片縮放後的尺寸
                                        var scaledWidth = bitmap.width * scale;
                                        var scaledHeight = bitmap.height * scale;

                                        // 計算縮放後放置的位置
                                        var offsetX = (width - scaledWidth) / 2;
                                        var offsetY = (height - scaledHeight) / 2;
                                        // console.log('(wk)', fliter, frontPlayStatus);
                                        // if (fliter === data.index && frontPlayStatus === 0) {
                                        //     ctx.drawImage(bitmap, offsetX, offsetY, scaledWidth, scaledHeight);
                                        // } else if (fliter !== data.index && frontPlayStatus === 0) {
                                        //     console.log("pass");
                                        // } else {
                                        ctx.drawImage(bitmap, offsetX, offsetY, scaledWidth, scaledHeight);
                                        // }
                                        blob = null
                                        scaleX = null
                                        scaleY = null
                                        scale = null
                                        scaledWidth = null
                                        scaledHeight = null
                                        offsetX = null
                                        offsetY = null
                                    })
                                    .catch(err => {
                                        console.log('漏禎');
                                        blob = null
                                    })
                            } else {
                                console.log('圖像錯誤');
                            }
                        }
                        fps++
                        frame = null
                        x = null
                    }
                    x.send();
                }

                intbufferCode = data
                intbufferCodest = true
                // self.postMessage(intbufferCode, [intbufferCode]);
                // self.postMessage({ type: 'temp', data: data.temp });
            }
            // if (fliter === data.index && frontPlayStatus === 0) {
            if (frontPlayStatus === 1) {
                runimg()
            } else if (frontPlayStatus === 0 && fliter === data.index) {
                runimg()
            }
            // console.log('(wk)', fliter, frontPlayStatus, data.index);
            data = null
            // split
            // var data = null
            // var str = event.data;
            // var firstDashIndex = str.indexOf("-");
            // if (firstDashIndex !== -1) {
            //     index = parseInt(str.substring(0, firstDashIndex));
            //     data = str.substring(firstDashIndex + 1);
            // } else {
            //     console.log("錯誤");
            // }
            // // var blobUrl = getBlob(atob(data), 'image/jpg')
            // self.postMessage([index, data]);
            // data = null
            // str = null
            // firstDashIndex = null
        }
    }
}
// setInterval(() => {
//     console.log(fasss);
//     fasss = 0
// }, 1000)
connectWs01()
setInterval(() => {
    if (intbufferCodest) {
        const sharedBuffer = new ArrayBuffer( // (A)
            10 * Int32Array.BYTES_PER_ELEMENT); // 10 個 int
        const sharedArray = new Float32Array(sharedBuffer); // (C)
        sharedArray[0] = 2
        sharedArray[1] = intbufferCode.index
        sharedArray[2] = intbufferCode.temp.max.auto
        sharedArray[3] = intbufferCode.temp.max.temp
        sharedArray[4] = intbufferCode.temp.min.auto
        sharedArray[5] = intbufferCode.temp.min.temp
        self.postMessage(sharedBuffer, [sharedBuffer]);
        intbufferCodest = false
    }
    // self.postMessage({ type: 'fps', fps });
    //     fps = 0
    // if (intbufferCode !== null && intbufferCode?.byteLength > 0) {
    // self.postMessage(intbufferCode, [intbufferCode]);
    // }

    // const sharedBuffer = new ArrayBuffer( // (A)
    //     10 * Int32Array.BYTES_PER_ELEMENT); // 10 個 int
    // const sharedArray = new Float32Array(sharedBuffer); // (C)
    // sharedArray[0] = 100.21
    // console.log(sharedArray);
}, 1000 / 10)
self.addEventListener('message', function (e) {
    var event = e.data
    // console.log(event);
    if (event.type === 'init') {
        offsetCanvas = event.canvas
        width = event.width
        height = event.height
        offsetCanvas.width = width
        offsetCanvas.height = height
        ctx = offsetCanvas.getContext("2d");
    } else if (event.type === 'status') {
        status1 = event.parameter
    } else if (event.type === 'playStatus') {
        fliter = event.parameter.index
        frontPlayStatus = event.parameter.status
    } else if (event.type === 'webscoketStatus') {
        const sharedBuffer = new ArrayBuffer( // (A)
            2 * Int32Array.BYTES_PER_ELEMENT); // 10 個 int
        const sharedArray = new Float32Array(sharedBuffer); // (C)
        sharedArray[0] = 0
        sharedArray[1] = ws01.readyState
        self.postMessage(sharedBuffer, [sharedBuffer]);
    }
})

// function getBlob(byteString, mimeString) {
//     var ab = new ArrayBuffer(byteString.length)
//     var ia = new Uint8Array(ab)
//     for (var i = 0; i < byteString.length; i++) {
//         ia[i] = byteString.charCodeAt(i)
//     }
//     var blob = new Blob([ab], { type: mimeString })
//     return blob
// }