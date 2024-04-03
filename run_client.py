from whisper_live.client import TranscriptionClient
client = TranscriptionClient(host="34.163.171.129", port=9091, lang="en", translate=False, model="small",use_vad=False)
