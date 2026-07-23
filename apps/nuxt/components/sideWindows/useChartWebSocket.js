import { onUnmounted } from 'vue';
import * as msgpack from '@msgpack/msgpack';

export function useChartWebSocket(url, subscriptionMessage, onUpdate = null) {
  let worker = null;
  // 極致優化：只在需要時創建 TextDecoder
  let textDecoder = null;
  
  // Eagerly load decode function instead of lazy loading
  const decode = msgpack.decode.bind(msgpack);
  
  // 8702 端口檢測相關變量
  const is8702Port = url && url.includes(':8702');
  let dataTimeoutTimer = null;
  let reconnectPromise = null;

  // 非阻塞延遲函數
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 非阻塞重連函數
  const reconnectAsync = async () => {
    // 如果已經有重連任務在進行，不重複執行
    if (reconnectPromise) return;
    
    reconnectPromise = (async () => {
      console.log('[WS2] 3 秒內未收到數據，準備斷開重連');
      disconnect();
      await delay(500);
      console.log('[WS2] 開始重連...');
      connect();
      reconnectPromise = null;
    })();
    
    return reconnectPromise;
  };

  const connect = () => {
    if (worker) return;
    
    worker = new Worker('/chart-worker.js', { type: 'classic' });
    
    worker.onmessage = (event) => {
      const { type, data, isBinary } = event.data;
      
      if (type === 'MESSAGE') {
        // 如果是 8702 端口，重置數據接收計時器
        if (is8702Port) {
          resetDataTimeout();
        }
        handleMessage(data, isBinary);
      } else if (type === 'CONNECTED' && is8702Port) {
        // 連接成功後，開始監聽數據接收
        console.log('[WS2] WebSocket 已連接，開始監聽數據接收');
        startDataTimeout();
      }
    };
    
    worker.postMessage({
      type: 'START',
      url: url,
      subscriptionMessage: subscriptionMessage
    });
  };
  
  // 開始數據接收超時檢測（僅針對 8702 端口）
  const startDataTimeout = () => {
    if (!is8702Port) return;
    
    clearDataTimeout();
    
    console.log('[WS2] 開始監聽數據接收，3 秒內未收到數據將重連');
    
    dataTimeoutTimer = setTimeout(() => {
      if (worker) {
        // 非阻塞方式觸發重連
        reconnectAsync().catch(err => {
          console.error('[WS2] 重連過程出錯:', err);
        });
      }
    }, 3000); // 3 秒超時
  };
  
  // 重置數據接收超時計時器
  const resetDataTimeout = () => {
    if (!is8702Port) return;
    
    clearDataTimeout();
    startDataTimeout(); // 重新開始計時
  };
  
  // 清除數據接收超時計時器
  const clearDataTimeout = () => {
    if (dataTimeoutTimer) {
      clearTimeout(dataTimeoutTimer);
      dataTimeoutTimer = null;
    }
  };

  const handleMessage = (data, isBinary) => {
    if (!onUpdate) return;
    
    try {
      let parsedData;
      
      if (isBinary && data instanceof ArrayBuffer) {
        // 极緻優化：直接使用 ArrayBuffer，避免額外創建 Uint8Array
        parsedData = decode(data);
      } else {
        // 文本數據 - 延遲創建 TextDecoder
        if (!textDecoder) {
          textDecoder = new TextDecoder();
        }
        parsedData = JSON.parse(data);
      }
      
      // 直接調用回調
      if (parsedData) {
        if (is8702Port) {
          console.log('[WS2] 收到數據');
        }
        onUpdate(parsedData);
      }
    } catch (e) {
      // 靜默跳過無效數據
      if (is8702Port) {
        console.log('[WS2] 數據解析失敗:', e.message);
      }
      return;
    }
  };

  const disconnect = () => {
    if (is8702Port) {
      console.log('[WS2] 斷開連接');
    }
    
    // 清除數據接收超時計時器
    clearDataTimeout();
    
    // 取消正在進行的重連任務
    reconnectPromise = null;
    
    if (worker) {
      worker.postMessage({ type: 'STOP' });
      worker.terminate();
      worker = null;
    }
    // 清理 textDecoder
    textDecoder = null;
  };

  const send = (data) => {
    if (worker) {
      worker.postMessage({ type: 'SEND', data });
    }
  };

  onUnmounted(() => {
    clearDataTimeout();
    disconnect();
  });

  return {
    connect,
    disconnect,
    send
  };
}

