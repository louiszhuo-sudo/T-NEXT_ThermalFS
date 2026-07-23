var offsetCanvas = null
var ctx = null
var width = 0
var height = 0
var tempfps = 0
var fps = 0
// var ws = new WebSocket('ws://192.168.0.128:8773')
// var tempframe = ''
// var tempbitmap = null
var ws = new WebSocket('ws://localhost:8731')
ws.onopen = () => {
    console.log("open");
    ws.send("send");
}
ws.onmessage = (event) => {
    // var data = JSON.parse(event.data).cam_00_00001
    var data = event.data
    // console.log(data);
    var runimg = () => {
        if (offsetCanvas !== null) {
            var frame = 'data:image/png;base64, ' + data
            tempframe = data
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
                                // tempbitmap = bitmap
                                if (true) {
                                    ctx.drawImage(bitmap, offsetX, offsetY, scaledWidth, scaledHeight);
                                    const fontSize = 16;
                                    const fontFamily = 'Arial';
                                    const text = fps + ' fps';
                                    const x = 10; // 文字左上角 x 坐标
                                    const y = 20; // 文字左上角 y 坐标

                                    // 绘制文本边框
                                    ctx.strokeStyle = 'black'; // 设置边框颜色为黑色
                                    ctx.lineWidth = 1; // 设置边框宽度为 1px
                                    ctx.font = fontSize + 'px ' + fontFamily; // 设置文字大小和字体
                                    ctx.strokeText(text, x, y); // 绘制文本边框

                                    // 绘制白色文本
                                    ctx.fillStyle = 'white'; // 设置文本颜色为白色
                                    ctx.fillText(text, x, y); // 绘制文本
                                }
                                // }
                                tempfps++
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
                frame = null
                x = null
            }
            x.send();
        }
    }
    runimg()
}
setInterval(() => {
    // self.postMessage(tempframe);
    fps = tempfps
    tempfps = 0
}, 1000)
ws.onclose = () => {
    console.log("close");
}
self.addEventListener('message', function (e) {
    var event = e.data
    if (event.type === 'init') {
        offsetCanvas = event.canvas
        width = event.width
        height = event.height
        offsetCanvas.width = width
        offsetCanvas.height = height
        ctx = offsetCanvas.getContext("2d");
        console.log('ctx', ctx);
    }
})


// const runGL = (base64) => {
//     if (offsetCanvas !== null) {
//         const canvas = offsetCanvas
//         const gl = canvas.getContext('webgl');

//         if (!gl) {
//             console.error('WebGL not supported.');
//             return;
//         }

//         // 创建顶点着色器
//         const vertexShaderSource = `
//       attribute vec2 a_position;
//       varying vec2 v_texcoord;
//       void main() {
//         gl_Position = vec4(a_position, 0, 1);
//         v_texcoord = (a_position + 1.0) / 2.0; // 将顶点坐标转换为纹理坐标
//       }
//     `;
//         const vertexShader = gl.createShader(gl.VERTEX_SHADER);
//         gl.shaderSource(vertexShader, vertexShaderSource);
//         gl.compileShader(vertexShader);

//         // 创建片元着色器
//         const fragmentShaderSource = `
//       precision mediump float;
//       varying vec2 v_texcoord;
//       uniform sampler2D u_texture;
//       void main() {
//         gl_FragColor = texture2D(u_texture, v_texcoord); // 使用纹理坐标获取纹理数据
//       }
//     `;
//         const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
//         gl.shaderSource(fragmentShader, fragmentShaderSource);
//         gl.compileShader(fragmentShader);

//         // 创建着色器程序
//         const program = gl.createProgram();
//         gl.attachShader(program, vertexShader);
//         gl.attachShader(program, fragmentShader);
//         gl.linkProgram(program);
//         gl.useProgram(program);

//         // 创建顶点缓冲区
//         const positionBuffer = gl.createBuffer();
//         gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//         const positions = [
//             -1, 1,
//             1, 1,
//             -1, -1,
//             1, -1,
//         ];
//         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

//         // 获取属性位置和 uniform 位置
//         const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
//         const textureUniformLocation = gl.getUniformLocation(program, 'u_texture');

//         // 指定顶点属性
//         gl.enableVertexAttribArray(positionAttributeLocation);
//         gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

//         // 创建纹理
//         const texture = gl.createTexture();
//         gl.bindTexture(gl.TEXTURE_2D, texture);
//         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tempbitmap);

//         // 设置纹理参数
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

//         // 绘制
//         gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

//         // function createImage() {
//         //     // const base64ImageData = 'YourBase64EncodedImageDataHere'; // 替换为实际的 base64 编码的图像数据
//         //     const image = new Image();
//         //     image.src = 'data:image/png;base64,' + base64;
//         //     return image;
//         // }
//     }
// }