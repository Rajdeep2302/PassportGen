from gradio_client import Client, handle_file
import traceback

with open("error.txt", "w") as f:
    try:
        client = Client("torboukechudbo/passport-bg-remover")
        res = client.predict(handle_file("check_api.py"))
        f.write(f"Success: {res}\n")
    except Exception as e:
        traceback.print_exc(file=f)
