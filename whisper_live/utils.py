import os
import textwrap
from scipy.io import wavfile
import ffmpeg
import numpy as np
import logging
import pandas as pd
from datetime import datetime

def clear_screen():
    """Clears the console screen."""
    os.system("cls" if os.name == "nt" else "clear")


def print_transcript(text):
    """Prints formatted transcript text."""
    wrapper = textwrap.TextWrapper(width=60)
    for line in wrapper.wrap(text="".join(text)):
        print(line)


def format_time(s):
    """Convert seconds (float) to SRT time format."""
    hours = int(s // 3600)
    minutes = int((s % 3600) // 60)
    seconds = int(s % 60)
    milliseconds = int((s - int(s)) * 1000)
    return f"{hours:02}:{minutes:02}:{seconds:02},{milliseconds:03}"


""" def create_srt_file(segments, output_file):
    with open(output_file, 'w', encoding='utf-8') as srt_file:
        segment_number = 1
        for segment in segments:
            start_time = format_time(float(segment['start']))
            end_time = format_time(float(segment['end']))
            text = segment['text']

            srt_file.write(f"{segment_number}\n")
            srt_file.write(f"{start_time} --> {end_time}\n")
            srt_file.write(f"{text}\n\n")

            segment_number += 1 """


def update_srt_file(segments, element):
    if element.folder == "":
        path = "transcripts/"+element.output_file
    else :
        path = "transcripts/" + element.folder + "/" + element.output_file
        if not os.path.exists("transcripts/" + element.folder):
            os.makedirs("transcripts/" + element.folder)

    if not os.path.exists(path):
        with open(path, 'w', encoding='utf-8') as srt_file:
            srt_file.write("start;end;text\n")

    with open(path, 'a', encoding='utf-8') as srt_file:
        for segment in segments:
            start_time = format_time(float(segment['start']))
            end_time = format_time(float(segment['end']))
            text = segment['text']

            srt_file.write(f"{start_time};{end_time};{text}\n")


def clean_output(folder, file, cleaned_suffix : bool = False, del_temp : bool = True):
    path = "transcripts/" + folder + "/" + file

    try :
        df = pd.read_csv(path, sep=";")
    except Exception as e:
        logging.error(f"[ERROR]: Failed to load temp transcript located {path} : {e}")
        return


    df['start_dt'] = pd.to_datetime(df['start'], format='%H:%M:%S,%f')
    df['end_dt'] = pd.to_datetime(df['end'], format='%H:%M:%S,%f')

    df.drop_duplicates(['start_dt'], keep='last', inplace=True)
    df.drop_duplicates(['end_dt'], keep='last', inplace=True)
    df.drop_duplicates(['text'], keep='last', inplace=True)
    df.sort_values(['start_dt'], inplace=True)


    index_to_drop = []
    for k, value in enumerate(df.index):
        if k > 0 :
            if prev_value > value:
                index_to_drop.append(value)
        prev_value = value

    df.drop(index=index_to_drop, inplace=True)

    if del_temp:
        # Try to delete the file.
        try:
            os.remove(path)
        except OSError as e:
            # If it fails, inform the user.
            logging.error("[ERROR]: %s - %s." % (e.filename, e.strerror))

    if cleaned_suffix:
        path = path[0:-4] + "_cleaned.srt"

    df[['start','end','text']].to_csv(path, sep=";")





def resample(file: str, sr: int = 16000):
    """
    # https://github.com/openai/whisper/blob/7858aa9c08d98f75575035ecd6481f462d66ca27/whisper/audio.py#L22
    Open an audio file and read as mono waveform, resampling as necessary,
    save the resampled audio

    Args:
        file (str): The audio file to open
        sr (int): The sample rate to resample the audio if necessary

    Returns:
        resampled_file (str): The resampled audio file
    """
    try:
        # This launches a subprocess to decode audio while down-mixing and resampling as necessary.
        # Requires the ffmpeg CLI and `ffmpeg-python` package to be installed.
        out, _ = (
            ffmpeg.input(file, threads=0)
            .output("-", format="s16le", acodec="pcm_s16le", ac=1, ar=sr)
            .run(cmd=["ffmpeg", "-nostdin"], capture_stdout=True, capture_stderr=True)
        )
    except ffmpeg.Error as e:
        raise RuntimeError(f"Failed to load audio: {e.stderr.decode()}") from e
    np_buffer = np.frombuffer(out, dtype=np.int16)

    resampled_file = f"{file.split('.')[0]}_resampled.wav"
    wavfile.write(resampled_file, sr, np_buffer.astype(np.int16))
    return resampled_file

def output_name(prefix : str = "", file_type:str = ".srt"):
    now = datetime.now()
    return prefix + now.strftime("%Y%m%d_%H%M%S") + file_type

if __name__ == "__main__":
    clean_output("20240429_130052.srt")
