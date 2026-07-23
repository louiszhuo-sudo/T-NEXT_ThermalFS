const http = require('http');
const https = require('https');

function requestJson(method, requestUrl, payload = null, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    let urlObject;
    try {
      urlObject = new URL(requestUrl);
    } catch (error) {
      reject(new Error(`Invalid URL: ${requestUrl}`));
      return;
    }

    const transport = urlObject.protocol === 'https:' ? https : http;
    const body = payload == null ? null : JSON.stringify(payload);
    const request = transport.request(
      {
        method,
        hostname: urlObject.hostname,
        port: urlObject.port || (urlObject.protocol === 'https:' ? 443 : 80),
        path: `${urlObject.pathname}${urlObject.search}`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        },
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let parsedBody = null;

          if (text) {
            try {
              parsedBody = JSON.parse(text);
            } catch (error) {
              parsedBody = { raw: text };
            }
          }

          resolve({
            statusCode: response.statusCode || 0,
            headers: response.headers,
            body: parsedBody,
          });
        });
      },
    );

    request.on('error', reject);
    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`Request timed out after ${timeoutMs} ms.`));
    });

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

module.exports = {
  requestJson,
};
