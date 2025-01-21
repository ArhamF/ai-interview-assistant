from openai import OpenAI
import os

# Initialize the OpenAI client with the API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def process_audio_transcription(transcription):
    """
    Takes a transcription from audio input, formats it as a question,
    and sends it to GPT to generate an answer.

    Args:
        transcription (str): The transcribed audio text.

    Returns:
        str: The AI-generated response.
    """
    try:
        # Ensure the transcription is valid
        if not transcription.strip():
            return "Error: The transcription is empty or invalid."

        # Format the transcription into a question
        question_prompt = f"Based on the following transcription, generate an appropriate answer: \"{transcription}\""

        # Make a request to the OpenAI API
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "developer", "content": "You are a helpful assistant answering questions based on transcribed audio."},
                {"role": "user", "content": question_prompt},
            ],
        )

        # Return the AI's response
        return completion.choices[0].message.content.strip()

    except ValueError as e:
        return f"Error: {str(e)}"
    except Exception as e:
        return f"Error: An unexpected error occurred ({str(e)})."
