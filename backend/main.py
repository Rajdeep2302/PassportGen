from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from gradio_client import Client, handle_file
import tempfile
import os
import io

HF_SPACE_URL = "torboukechudbo/passport-bg-remover" 

app = FastAPI(title="Background Removal API using HF Space")

client = None

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
    return {"message": "Background removal API is running locally! It delegates to the Hugging Face Space API."}

@app.post("/removebg")
async def remove_background(image_file: UploadFile = File(...)):
    global client
    tmp_path = None
    try:
        if client is None:
            if HF_SPACE_URL == "torboukechudbo/passport-bg-remover":
                print("WARNING: HF_SPACE_URL is not set to a real Hugging Face space.")
            print(f"Connecting to Hugging Face Space: {HF_SPACE_URL}...")
            client = Client(HF_SPACE_URL)
            print("Connected successfully!")

        input_data = await image_file.read()
        
        # Save uploaded file to a temporary location for gradio_client
        fd, tmp_path = tempfile.mkstemp(suffix=".png")
        with os.fdopen(fd, "wb") as tmp:
            tmp.write(input_data)

        # Call the Hugging Face Space API without explicit fn_index or api_name 
        # as it auto-resolves to the unnamed default endpoint.
        print("Sending image to Hugging Face Space...")
        result_path = client.predict(
            image=handle_file(tmp_path)
        )
        print("Received result from Hugging Face Space.")
        
        # Read the transparent image byte result
        with open(result_path, "rb") as f:
            output_data = f.read()
            
        # Return as PNG image stream
        return Response(content=output_data, media_type="image/png")
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up the temporary input file
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception as cleanup_err:
                print(f"Failed to clean up temp file {tmp_path}: {cleanup_err}")
