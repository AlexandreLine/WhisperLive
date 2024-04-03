import os
from whisper_live.client import TranscriptionClient

print("[INFO]: Connection attempted on server " + os.environ.get("HOST") + ":" + os.environ.get("PORT"))

client = TranscriptionClient(
    host=os.environ.get("HOST"),
    port=os.environ.get("PORT"),
    lang="en",
    translate=False,
    model="small",
    use_vad=False)
client("/assets/jfk.flac")
