"""Audio utilities."""
import numpy as np
import soundcard as sc
import soundfile as sf
from loguru import logger

from src.constants import OUTPUT_FILE_NAME, RECORD_SEC, SAMPLE_RATE

SPEAKER_ID = str(sc.default_speaker().name)


def record_batch(record_sec: int = RECORD_SEC) -> np.ndarray:
    logger.debug("Recording for {record_sec} second(s)...")
    with sc.get_microphone(
        id=SPEAKER_ID,
        include_loopback=True,
    ).recorder(samplerate=SAMPLE_RATE) as mic:
        audio_sample = mic.record(numframes=SAMPLE_RATE * record_sec)
    return audio_sample


def save_audio_file(audio_data: np.ndarray, output_file_name: str = OUTPUT_FILE_NAME) -> None:
    logger.debug(f"Saving audio file to {output_file_name}...")
    sf.write(file=output_file_name, data=audio_data, samplerate=SAMPLE_RATE)

