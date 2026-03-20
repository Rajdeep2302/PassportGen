from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import io
import torch
from transformers import pipeline
from PIL import Image

# --- THE FIX for newer Transformers versions ---
_orig_getattr = torch.nn.Module.__getattr__
def _patched_getattr(self, name):
    if name == "all_tied_weights_keys":
        return {} # Give transformers an empty dict instead of crashing
    return _orig_getattr(self, name)
torch.nn.Module.__getattr__ = _patched_getattr
# -----------------------------------------------

app = FastAPI(title="Local RMBG-1.4 API")

print("Loading RMBG-1.4 AI model. This may take a moment...")
# Initialize the pipeline globally so it only loads once at startup
pipe = pipeline("image-segmentation", model="briaai/RMBG-1.4", trust_remote_code=True)
print("Model loaded successfully!")

# Add CORS middleware to allow the Vite dev server and built frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Background removal API is running locally using RMBG-1.4! The frontend uses the /removebg endpoint."}

@app.post("/removebg")
async def remove_background(image_file: UploadFile = File(...)):
    try:
        input_data = await image_file.read()
        
        # Read the image file as a Pillow Image
        original_image = Image.open(io.BytesIO(input_data))
        
        # Remove background using the loaded model. The AI returns a transparent PIL Image
        transparent_cutout = pipe(original_image)
        
        # Convert the resulting PIL Image back to raw PNG bytes
        img_byte_arr = io.BytesIO()
        transparent_cutout.save(img_byte_arr, format='PNG')
        output_data = img_byte_arr.getvalue()
        
        # Return as PNG image
        return Response(content=output_data, media_type="image/png")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
