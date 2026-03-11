// hf-modelscope.js
export class ModelHub {
    constructor() {
        this.hfToken = null;          // HuggingFace token
        this.msToken = null;          // ModelScope token
        this.ollamaHost = "http://localhost:11434"; // Ollama endpoint
    }

    /* ---------------- HuggingFace ---------------- */
    async loginHuggingFace() {
        const token = prompt("Enter your HuggingFace API token:");
        if (!token) return false;
        this.hfToken = token;
        localStorage.setItem("hfToken", token);
        alert("HuggingFace token saved!");
        return true;
    }

    async listHuggingFaceModels() {
        if (!this.hfToken) throw new Error("HuggingFace not authenticated");
        const res = await fetch("https://huggingface.co/api/models", {
            headers: { Authorization: `Bearer ${this.hfToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch HF models");
        return res.json();
    }

    async queryHuggingFaceModel(modelId, inputs) {
        if (!this.hfToken) throw new Error("HuggingFace not authenticated");
        const res = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.hfToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs }),
        });
        if (!res.ok) throw new Error("HF inference failed");
        return res.json();
    }

    /* ---------------- ModelScope ---------------- */
    async loginModelScope() {
        const token = prompt("Enter your ModelScope API token:");
        if (!token) return false;
        this.msToken = token;
        localStorage.setItem("msToken", token);
        alert("ModelScope token saved!");
        return true;
    }

    async listModelScopeModels() {
        if (!this.msToken) throw new Error("ModelScope not authenticated");
        const res = await fetch("https://www.modelscope.cn/api/v1/models", {
            headers: { Authorization: `Bearer ${this.msToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch ModelScope models");
        return res.json();
    }

    async queryModelScopeModel(modelId, inputs) {
        if (!this.msToken) throw new Error("ModelScope not authenticated");
        const res = await fetch(`https://www.modelscope.cn/api/v1/models/${modelId}/predict`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.msToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ input: inputs }),
        });
        if (!res.ok) throw new Error("ModelScope inference failed");
        return res.json();
    }

    /* ---------------- Ollama ---------------- */

    setOllamaHost(host) {
        this.ollamaHost = host;
        localStorage.setItem("ollamaHost", host);
    }

    async listOllamaModels() {
        const res = await fetch(`${this.ollamaHost}/api/tags`);
        if (!res.ok) throw new Error("Failed to fetch Ollama models");
        const data = await res.json();
        return data.models || [];
    }

    async queryOllamaModel(modelId, prompt) {
        const res = await fetch(`${this.ollamaHost}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: modelId,
                prompt: prompt,
                stream: false
            }),
        });

        if (!res.ok) throw new Error("Ollama inference failed");
        return res.json();
    }
}