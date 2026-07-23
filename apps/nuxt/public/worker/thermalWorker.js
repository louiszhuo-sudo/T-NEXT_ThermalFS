let width = 0, height = 0;
let canvas, ctx;
const palettes = ['iron', 'rainbow', 'lava', 'ice', 'hotmetal'];
let LUTs = {};

self.onmessage = async (e) => {
    const { type, image } = e.data;

    if (type === 'init') {
        width = e.data.width;
        height = e.data.height;
        canvas = new OffscreenCanvas(width, height);
        ctx = canvas.getContext('2d');
        LUTs = Object.fromEntries(palettes.map(p => [p, getColorMap(p)]));
    }

    else if (type === 'frame') {
        const result = await processFrame(image);
        self.postMessage({ type: 'result', payload: result });
    }
};

// ===== LUT 產生器 =====
function getColorMap(type) {
    const map = [];
    for (let i = 0; i < 256; i++) {
        let r = 0, g = 0, b = 0;
        switch (type) {
            case 'iron': r = Math.min(255, i * 1.2); g = i > 128 ? (i - 128) * 2 : i * 0.3; b = i < 64 ? i * 4 : 255 - i; break;
            case 'rainbow': r = Math.sin(0.024 * i + 0) * 127 + 128; g = Math.sin(0.024 * i + 2) * 127 + 128; b = Math.sin(0.024 * i + 4) * 127 + 128; break;
            case 'lava': r = i; g = i > 128 ? (i - 128) * 2 : i * 0.2; b = i < 64 ? i * 2 : i * 0.1; break;
            case 'ice': r = i * 0.3; g = i * 0.6; b = 200 + i * 0.2; break;
            case 'hotmetal': r = Math.min(255, i * 1.5); g = Math.min(255, i * 0.9); b = Math.min(255, i * 0.5); break;
        }
        map.push([Math.round(r), Math.round(g), Math.round(b)]);
    }
    return map;
}

// ===== 主轉換流程 =====
async function processFrame(imageData) {
    const { data } = imageData;
    const gray = new Uint8Array(width * height);

    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        gray[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    const results = [];

    for (const p of palettes) {
        const lut = LUTs[p];
        const temp = new Uint8ClampedArray(data.length);

        for (let i = 0, j = 0; i < data.length; i += 4, j++) {
            const [r, g, b] = lut[gray[j]];
            temp[i] = r;
            temp[i + 1] = g;
            temp[i + 2] = b;
            temp[i + 3] = 255;
        }

        const out = new ImageData(temp, width, height);
        ctx.putImageData(out, 0, 0);

        // ✅ OffscreenCanvas 轉 Base64
        const blob = await canvas.convertToBlob({ type: 'image/png' });
        const base64 = await blobToBase64(blob);

        results.push({ style: p, base64 });
    }
    return results;
}

// ===== Blob → Base64 工具 =====
function blobToBase64(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}
