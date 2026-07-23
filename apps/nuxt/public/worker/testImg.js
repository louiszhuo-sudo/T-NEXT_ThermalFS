self.addEventListener('message', function (e) {
    var res = e.data
    if (res.type === 'handleBase64') {
        var base64 = res.base64
        var output = []
        for (var i = 0; i < 1000; i++) {
            output.push(base64)
        }
        // console.log("ok", base64);
        const myArray = output;
        const sizeInBytes = sizeof(myArray);
        const sizeInMegabytes = sizeInBytes / (1024 * 1024);

        console.log(`Array size: ${sizeInMegabytes.toFixed(2)} MB`);
        self.postMessage({ type: 'handleBase64', output });

    }
    res = null
})

function sizeof(obj) {
    let bytes = 0;

    function sizeOf(obj) {
        if (obj !== null && obj !== undefined) {
            switch (typeof obj) {
                case 'number':
                    bytes += 8; // 64 bits
                    break;
                case 'string':
                    bytes += obj.length * 2; // 16 bits per character
                    break;
                case 'boolean':
                    bytes += 4; // 32 bits
                    break;
                case 'object':
                    if (Array.isArray(obj)) {
                        for (let i = 0; i < obj.length; i++) {
                            sizeOf(obj[i]);
                        }
                    } else {
                        for (const key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                sizeOf(obj[key]);
                            }
                        }
                    }
                    break;
            }
        }
    }

    sizeOf(obj);

    return bytes;
}