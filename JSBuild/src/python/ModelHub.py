# model_hub.py
import os
from huggingface_hub import hf_hub_download
import requests

LOCAL_MODEL_DIR = "./local_models"
os.makedirs(LOCAL_MODEL_DIR, exist_ok=True)

class ModelHub:
    def __init__(self):
        self.hfToken = None
        self.msToken = None

    # ---------------- HuggingFace ----------------
    def download_huggingface_model(self, model_name):
        if not self.hfToken:
            raise ValueError("HuggingFace token not set")
        
        # Save everything under LOCAL_MODEL_DIR/model_name
        model_dir = os.path.join(LOCAL_MODEL_DIR, model_name.replace("/", "_"))
        os.makedirs(model_dir, exist_ok=True)
        
        # Using hf_hub_download for simplicity
        # This downloads the model weights only (config & tokenizer can also be downloaded)
        try:
            # Example: download config.json as a minimal check
            hf_hub_download(
                repo_id=model_name,
                filename="config.json",
                cache_dir=model_dir,
                use_auth_token=self.hfToken
            )
        except Exception as e:
            raise RuntimeError(f"HuggingFace download failed: {e}")

        return model_dir

    # ---------------- ModelScope ----------------
    def download_modelscope_model(self, model_name):
        if not self.msToken:
            raise ValueError("ModelScope token not set")
        
        model_dir = os.path.join(LOCAL_MODEL_DIR, model_name.replace("/", "_"))
        os.makedirs(model_dir, exist_ok=True)

        # Minimal example: download model info via REST API
        url = f"https://www.modelscope.cn/api/v1/models/{model_name}"
        headers = {"Authorization": f"Bearer {self.msToken}"}
        resp = requests.get(url, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(f"ModelScope request failed: {resp.text}")

        # Save metadata.json locally
        with open(os.path.join(model_dir, "metadata.json"), "w", encoding="utf-8") as f:
            f.write(resp.text)

        # TODO: Extend this to download actual model weights if needed
        return model_dir