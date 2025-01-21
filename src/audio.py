from flask import Flask, request, jsonify
from llm import process_audio_transcription
from constants import MAX_INPUT_LENGTH

app = Flask(__name__)

@app.route('/api/interview', methods=['POST'])
def interview():
    try:
        data = request.get_json()
        transcription = data.get('question', '')

        if not transcription:
            return jsonify({"error": "No transcription provided."}), 400

        if len(transcription) > MAX_INPUT_LENGTH:
            return jsonify({"error": f"Input exceeds maximum length of {MAX_INPUT_LENGTH} characters."}), 400

        # Process transcription and get GPT response
        response = process_audio_transcription(transcription)
        return jsonify({"response": response})

    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "Internal server error."}), 500

if __name__ == '__main__':
    app.run(debug=True)
