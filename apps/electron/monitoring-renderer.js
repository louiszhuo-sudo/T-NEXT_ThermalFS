const state = {
  libraries: [],
  snapshot: null,
};

const elements = {
  remoteUrl: document.getElementById('remoteUrl'),
  librarySelect: document.getElementById('librarySelect'),
  newLibraryName: document.getElementById('newLibraryName'),
  connectionStatus: document.getElementById('connectionStatus'),
  manualSendBtn: document.getElementById('manualSendBtn'),
  pauseRecording: document.getElementById('pauseRecording'),
  pauseUpload: document.getElementById('pauseUpload'),
  pendingBatches: document.getElementById('pendingBatches'),
  pendingBytes: document.getElementById('pendingBytes'),
  pendingSamples: document.getElementById('pendingSamples'),
  lastUploadAt: document.getElementById('lastUploadAt'),
  sessionId: document.getElementById('sessionId'),
  clientId: document.getElementById('clientId'),
  currentLibrary: document.getElementById('currentLibrary'),
  lastAckSequence: document.getElementById('lastAckSequence'),
  lastError: document.getElementById('lastError'),
  batchPolicy: document.getElementById('batchPolicy'),
};

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (!value) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let nextValue = value;
  while (nextValue >= 1024 && unitIndex < units.length - 1) {
    nextValue /= 1024;
    unitIndex += 1;
  }

  return `${nextValue.toFixed(nextValue >= 100 ? 0 : 1)} ${units[unitIndex]}`;
}

function renderLibraries(libraries, selectedId) {
  elements.librarySelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '未指定 / 先選擇收錄庫';
  elements.librarySelect.appendChild(placeholder);

  libraries.forEach((library) => {
    const option = document.createElement('option');
    option.value = library.id;
    option.textContent = library.name;
    if (library.id === selectedId) {
      option.selected = true;
    }
    elements.librarySelect.appendChild(option);
  });
}

function renderState(snapshot) {
  state.snapshot = snapshot;
  elements.remoteUrl.value = snapshot.config.remoteUrl || '';
  elements.pauseRecording.checked = Boolean(snapshot.pauseRecording);
  elements.pauseUpload.checked = Boolean(snapshot.pauseUpload);
  elements.manualSendBtn.disabled = Boolean(snapshot.isUploading);
  elements.manualSendBtn.textContent = snapshot.isUploading ? '傳送中...' : '手動傳送';
  elements.pendingBatches.textContent = String(snapshot.pendingBatches || 0);
  elements.pendingBytes.textContent = formatBytes(snapshot.pendingBytes);
  elements.pendingSamples.textContent = String(snapshot.pendingSamples || 0);
  elements.lastUploadAt.textContent = snapshot.lastUploadAt || '-';
  elements.sessionId.textContent = `Session: ${snapshot.sessionId || '-'}`;
  elements.clientId.textContent = `Client: ${snapshot.clientId || '-'}`;
  elements.currentLibrary.textContent = snapshot.config.libraryName || snapshot.config.libraryId || '未指定';
  elements.lastAckSequence.textContent = String(snapshot.state.lastAckSequence || 0);
  elements.lastError.textContent = snapshot.lastError || '無';
  elements.batchPolicy.textContent = `${snapshot.config.batchFlushIntervalMs / 1000} 秒 / ${snapshot.config.batchMaxSamples} sample`;
  renderLibraries(state.libraries, snapshot.config.libraryId);
}

async function saveConfigPatch(patch) {
  const snapshot = await window.monitoringAPI.saveConfig(patch);
  renderState(snapshot);
}

async function refreshLibraries() {
  const remoteUrl = elements.remoteUrl.value.trim();
  const libraries = await window.monitoringAPI.refreshLibraries(remoteUrl);
  state.libraries = libraries;
  if (state.snapshot) {
    renderLibraries(libraries, state.snapshot.config.libraryId);
  }
  elements.connectionStatus.textContent = `已載入 ${libraries.length} 個收錄庫。`;
}

document.getElementById('saveConfigBtn').addEventListener('click', async () => {
  const selectedId = elements.librarySelect.value;
  const selectedLibrary = state.libraries.find((library) => library.id === selectedId);
  await saveConfigPatch({
    remoteUrl: elements.remoteUrl.value.trim(),
    libraryId: selectedId,
    libraryName: selectedLibrary?.name || '',
  });
  elements.connectionStatus.textContent = '設定已儲存。';
});

document.getElementById('testConnectionBtn').addEventListener('click', async () => {
  try {
    const result = await window.monitoringAPI.testConnection(elements.remoteUrl.value.trim());
    elements.connectionStatus.textContent = `連線成功：${result.message || 'collector online'}`;
  } catch (error) {
    elements.connectionStatus.textContent = `連線失敗：${error.message}`;
  }
});

document.getElementById('refreshLibrariesBtn').addEventListener('click', async () => {
  try {
    await refreshLibraries();
  } catch (error) {
    elements.connectionStatus.textContent = `讀取失敗：${error.message}`;
  }
});

document.getElementById('manualSendBtn').addEventListener('click', async () => {
  try {
    elements.connectionStatus.textContent = '正在手動傳送批次...';
    const snapshot = await window.monitoringAPI.manualSend();
    renderState(snapshot);
    elements.connectionStatus.textContent = snapshot.manualSendMessage || '手動傳送完成。';
  } catch (error) {
    elements.connectionStatus.textContent = `手動傳送失敗：${error.message}`;
  }
});

document.getElementById('createLibraryBtn').addEventListener('click', async () => {
  const name = elements.newLibraryName.value.trim();
  if (!name) {
    elements.connectionStatus.textContent = '請輸入新收錄庫名稱。';
    return;
  }

  try {
    const library = await window.monitoringAPI.createLibrary(name, elements.remoteUrl.value.trim());
    elements.newLibraryName.value = '';
    elements.connectionStatus.textContent = `已建立收錄庫：${library.name}`;
    await refreshLibraries();
    await saveConfigPatch({
      remoteUrl: elements.remoteUrl.value.trim(),
      libraryId: library.id,
      libraryName: library.name,
    });
  } catch (error) {
    elements.connectionStatus.textContent = `建立失敗：${error.message}`;
  }
});

elements.pauseRecording.addEventListener('change', async () => {
  const snapshot = await window.monitoringAPI.setPauseRecording(elements.pauseRecording.checked);
  renderState(snapshot);
});

elements.pauseUpload.addEventListener('change', async () => {
  const snapshot = await window.monitoringAPI.setPauseUpload(elements.pauseUpload.checked);
  renderState(snapshot);
});

elements.librarySelect.addEventListener('change', async () => {
  const selectedId = elements.librarySelect.value;
  const selectedLibrary = state.libraries.find((library) => library.id === selectedId);
  await saveConfigPatch({
    libraryId: selectedId,
    libraryName: selectedLibrary?.name || '',
  });
});

window.monitoringAPI.onState((snapshot) => {
  renderState(snapshot);
});

window.monitoringAPI.requestState().then((snapshot) => {
  renderState(snapshot);
}).catch((error) => {
  elements.connectionStatus.textContent = `初始化失敗：${error.message}`;
});
