import gradio as gr
from transformers import pipeline
import torch
from PIL import Image

# --- THE FIX for newer Transformers versions ---
# We still need this fix on the Hugging Face space if it uses newer transformers
_orig_getattr = torch.nn.Module.__getattr__
def _patched_getattr(self, name):
    if name == "all_tied_weights_keys":
        return {} # Give transformers an empty dict instead of crashing
    return _orig_getattr(self, name)
torch.nn.Module.__getattr__ = _patched_getattr
# -----------------------------------------------

# Initialize the pipeline
try:
    print("Loading RMBG-1.4 AI model...")
    pipe = pipeline("image-segmentation", model="briaai/RMBG-1.4", trust_remote_code=True)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    pipe = None

def remove_background(image):
    if pipe is None:
        raise gr.Error("Model failed to load. Please check logs.")
    try:
        # The pipeline returns a PIL Image
        result = pipe(image)
        return result
    except Exception as e:
        raise gr.Error(f"Error during processing: {e}")

# Define the Gradio interface
iface = gr.Interface(
    fn=remove_background,
    inputs=gr.Image(type="pil", label="Upload Image"),
    outputs=gr.Image(type="pil", label="Transparent Result"),
    title="Passport Generator Background Removal API",
    description="This Space hosts the RMBG-1.4 model for extracting subjects from their backgrounds. It serves as the backend for the Passport Generator app.",
    allow_flagging="never"
)

if __name__ == "__main__":
    iface.launch()
