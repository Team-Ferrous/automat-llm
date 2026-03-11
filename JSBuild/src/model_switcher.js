import { ModelHub } from './model_hub.js';

/*const stack = {
    llm:     "mistral",
    image:   "newbie",
    model3d: "sparc3d",
    tts:     "piper",
    video:   "luma"
};*/

const hub = new ModelHub();

// Example usage:
async function testHF() {
    const models = await hub.listHuggingFaceModels();
    console.log("HF models:", models.slice(0,10));
}

function HF_Login() {
    window.open("https://huggingface.co/settings/tokens", "_blank");
    const token = prompt("Paste your HuggingFace token:");

    if (token) {
        localStorage.setItem("hf_token", token);
    }
}

function MS_Login() {

    window.open("https://modelscope.cn/my/access/token", "_blank");
    const token = prompt("Paste your ModelScope token:");

    if (token) {
        localStorage.setItem("ms_token", token);
    }
}

const activeStack = {
    llm: "mistral-7b",
    generators: [
        { type: "image", model: "newbie"  },
        { type: "3d",    model: "sparc3d" }
    ] //capped at 2 at a time in addition to the LLM, more models can be orchestrated)
};

let modelRegistry = {
    llm: {
        mistral7b: {
            source: "huggingface",
            repo: "mistralai/Mistral-7B-Instruct"
        }
    },

    image: {
        newbie: {
            source: "modelscope",
            repo: "AI-ModelScope/NewBie"
        }
    },

    model3d: {
        sparc3d: {
            source: "python",
            repo: "ben-kaye/Sparc3Dsdf"
        }
    }
};

const python3DModels = {
    download_model: {
        generate: async (prompt) => {
            const res = await fetch("http://localhost:5001/download_model", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ "message": prompt })
            });
            return await res.json();
        }
    },
    sparc3d: {
        generate: async (prompt) => {
            const res = await fetch("http://localhost:5001/generate_3d", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ prompt })
            });

            return await res.json();
        }
    },
    newbie: {
        generate: async (prompt) => {
            const res = await fetch("http://localhost:5001/generate_image", {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ prompt })
            });

            return await res.json();
        }
    }
};

function findGenerator(type) {
    return activeStack.generators.find(g => g.type === type);
}

async function generate3D(prompt) {

    const res = await fetch("http://localhost:5001/generate_3d", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ prompt })
    });

    return await res.json();
}

async function runPipeline(prompt) {
    const intent = detectIntent(prompt);
    if (intent === "3d") {
        return await generate3D(prompt);
    }

    if (intent === "image") {
        return await imageGen(prompt);
    }

    return await llm(prompt);
}

export {
    activeStack,
    python3DModels,
    modelRegistry,
    findGenerator,
    runPipeline,
    hub,
    HF_Login,
    MS_Login
};