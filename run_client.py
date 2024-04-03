import os
from whisper_live.client import TranscriptionClient

client = TranscriptionClient(
    host=os.environ.get("HOST"),
    port=os.environ.get("PORT"),
    lang="en",
    translate=False,
    model="small",
    use_vad=False)
client("/assets/jfk.flac")
