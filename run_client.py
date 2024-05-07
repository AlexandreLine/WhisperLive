import os
from env import *
from whisper_live.client import TranscriptionClient


host = os.environ.get("HOST") if os.environ.get("HOST") != None else HOST
port = os.environ.get("PORT") if os.environ.get("PORT") != None else PORT

print("[INFO]: Connection attempted on server " + host + ":" + str(port))

client = TranscriptionClient(
    host=host,
    port=int(port),
    lang="en",
    translate=True,
    model="distil-large-v3",
    use_vad=True,
    #play=True,
    folder="default",
    speakers="1"
    )
client("./assets/jfk.flac")
