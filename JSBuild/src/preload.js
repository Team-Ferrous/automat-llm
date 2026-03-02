// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    sendMessage: (msg)      => ipcRenderer.send("chat-message", msg),
    //onResponse: (callback)  => ipcRenderer.on("chat-response", (_, data) => callback(data)),
    onImageDone: (callback) => ipcRenderer.on("image-done", callback),
    onAssetDone: (callback) => ipcRenderer.on("asset-done", callback),
    loadModel: (path)       => ipcRenderer.invoke("load-model", path),
    onToken: (callback) => ipcRenderer.on("stream-token", (_, t) => callback(t))
});

window.addEventListener("DOMContentLoaded", () => {
  // nothing here yet
})

session.prompt({
    messages: [
        { role: "system", content: "You are CYBEL CORE." },
        ...chatHistory,
        { role: "user", content: message }
    ]
});

