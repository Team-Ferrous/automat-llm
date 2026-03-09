# sparc_server.py
from flask       import Flask, request, send_file
from sparc3d_sdf.scripts.sdf import run  # ✅ correct local import

app = Flask(__name__)

@app.route("/generate_sdf", methods=["POST"])
def generate():
    prompt = request.json["prompt"]
    sdf_file = run("assets/{prompt.userID}.obj", prompt.n, prompt, f"./local_generations/{prompt.userID}_{prompt.n}.obj") #This is what run expects: -i assets/plane.obj --N 1024 -o plane_1024.obj
    return send_file(sdf_file)

app.run(port=5001)