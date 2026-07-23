console.log('Electron version:', process.versions.electron);
console.log('Chromium version:', process.versions.chrome);
console.log('Node.js version:', process.versions.node);
console.log('V8 version:', process.versions.v8);

function checkHardwareAcceleration() {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    return 'WebGL is unavailable. Hardware acceleration may be disabled.';
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (debugInfo) {
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    if (renderer.includes('Software') || renderer.includes('SwiftShader') || renderer.includes('llvmpipe')) {
      return `Software rendering detected: ${renderer}`;
    }

    return `GPU renderer detected: ${renderer}`;
  }

  return 'WebGL is available, but the renderer could not be identified.';
}

async function checkH264HardwareSupport() {
  const h264Config = {
    type: 'file',
    video: {
      contentType: 'video/mp4; codecs="avc1.42E01E"',
      width: 1920,
      height: 1080,
      bitrate: 2000000,
      framerate: 30,
    },
  };

  try {
    const result = await navigator.mediaCapabilities.decodingInfo(h264Config);
    console.log('--- H.264 decoding support ---');
    console.log(`Supported: ${result.supported}`);
    console.log(`Smooth playback: ${result.smooth}`);
    console.log(`Power efficient: ${result.powerEfficient}`);
  } catch (error) {
    console.error('Failed to query media capabilities:', error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    #dragDiv {
      -webkit-app-region: drag;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 0%;
      background: transparent;
      transition: background 0.2s ease;
      z-index: 9999;
    }
    #dragDiv:hover {
      background: rgba(200, 200, 200, 0.2);
    }
  `;
  document.head.appendChild(style);

  const dragDiv = document.createElement('div');
  dragDiv.id = 'dragDiv';
  document.body.appendChild(dragDiv);

  console.log(checkHardwareAcceleration());
  checkH264HardwareSupport();
});
