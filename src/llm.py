import openai
from loguru import logger

from src.constants import INTERVIEW_POSTION, OPENAI_API_KEY, OUTPUT_FILE_NAME

openai.api_key = OPENAI_API_KEY

SYSTEM_PROMPT = f"""You are interviewing for a {INTERVIEW_POSTION} position.
You will receive an audio transcription of the question. It may not be complete. You need to understand the question and write an answer to it.\n
"""
SHORTER_INSTRACT = "Concisely respond, limiting your answer to 50 words."
LONGER_INSTRACT = (
    "Before answering, take a deep breath and think one step at a time. Believe the answer in no more than 150 words."
)


def transcribe_audio(path_to_file: str = OUTPUT_FILE_NAME) -> str:
    with open(path_to_file, "rb") as audio_file:
        try:
            transcript = openai.Audio.translate("whisper-1", audio_file)
        except Exception as error:
            logger.error(f"Can't transcribe audio: {error}")
            raise error
    return transcript["text"]


def generate_answer(transcript: str, short_answer: bool = True, temperature: float = 0.7) -> str:
    if short_answer:
        system_prompt = SYSTEM_PROMPT + SHORTER_INSTRACT
    else:
        system_prompt = SYSTEM_PROMPT + LONGER_INSTRACT
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            temperature=temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcript},
            ],
        )
    except Exception as error:
        logger.error(f"Can't generate answer: {error}")
        raise error
    return response["choices"][0]["message"]["content"]

