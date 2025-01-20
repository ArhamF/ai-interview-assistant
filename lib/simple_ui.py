import PySimpleGUI as sg
import numpy as np
from loguru import logger

from src import audio, llm
from src.constants import APPLICATION_WIDTH, OFF_IMAGE, ON_IMAGE

# Custom theme to match the React component's dark theme
sg.LOOK_AND_FEEL_TABLE['CustomDark'] = {
    'BACKGROUND': '#0f172a',
    'TEXT': '#e2e8f0',
    'INPUT': '#1e293b',
    'TEXT_INPUT': '#e2e8f0',
    'SCROLL': '#4a5568',
    'BUTTON': ('#e2e8f0', '#3730a3'),
    'PROGRESS': ('#0369a1', '#0284c7'),
    'BORDER': 1,
    'SLIDER_DEPTH': 0,
    'PROGRESS_DEPTH': 0,
}

sg.theme('CustomDark')

def get_text_area(text: str, size: tuple) -> sg.Text:
    return sg.Text(
        text,
        size=size,
        background_color='#1e293b',
        text_color='#e2e8f0',
        pad=(10, 5),
    )

class BtnInfo:
    def __init__(self, state=False):
        self.state = state

# Icons (you may need to replace these with actual icon data)
MIC_ICON = '🎤'
BRAIN_ICON = '🧠'
SPARKLES_ICON = '✨'

# Main layout
left_column = [
    [sg.Text("AI Interview Assistant", font=('Helvetica', 24), justification='center', expand_x=True)],
    [sg.Text("Real-time interview support powered by AI", font=('Helvetica', 14), justification='center', expand_x=True, text_color='#94a3b8')],
    [sg.Column([
        [sg.Text("Interview Session", font=('Helvetica', 18), text_color='#c4b5fd')],
        [sg.Button(MIC_ICON,
                   key='-TOGGLE1-',
                   button_color=(sg.theme_background_color(), sg.theme_background_color()),
                   border_width=0,
                   font=('Helvetica', 24),
                   pad=(20, 20))],
        [sg.Text("Click to start recording", key='-RECORD_STATUS-', justification='center', expand_x=True)],
    ], background_color='#1e293b', expand_x=True, element_justification='center', pad=(10, 10))],
    [sg.Column([
        [sg.Text(f"{BRAIN_ICON} Current Question", font=('Helvetica', 16), text_color='#93c5fd')],
        [sg.Multiline(size=(40, 3), key='-CURRENT_QUESTION-', background_color='#0f172a', text_color='#e2e8f0', border_width=0)],
    ], background_color='#1e293b', expand_x=True, pad=(10, 10))],
]

right_column = [
    [sg.Text(f"{SPARKLES_ICON} AI Response", font=('Helvetica', 18), text_color='#c4b5fd')],
    [sg.Multiline(size=(50, 20), key='-AI_RESPONSE-', background_color='#0f172a', text_color='#e2e8f0', border_width=0)],
]

layout = [
    [sg.Column(left_column, expand_y=True), sg.VSeperator(), sg.Column(right_column, expand_y=True, expand_x=True)],
    [sg.Button("Exit", button_color=('#e2e8f0', '#7c3aed'))]
]

# Create the Window
window = sg.Window("AI Interview Assistant", layout, return_keyboard_events=True, use_default_focus=False, finalize=True)
window['-TOGGLE1-'].metadata = BtnInfo()

def background_recording_loop() -> None:
    audio_data = None
    while window['-TOGGLE1-'].metadata.state:
        audio_sample = audio.record_batch()
        if audio_data is None:
            audio_data = audio_sample
        else:
            audio_data = np.vstack((audio_data, audio_sample))
    audio.save_audio_file(audio_data)

# Event Loop
while True:
    event, values = window.read()
    if event in ("Exit", sg.WIN_CLOSED):
        break

    if event == '-TOGGLE1-':
        window['-TOGGLE1-'].metadata.state = not window['-TOGGLE1-'].metadata.state
        if window['-TOGGLE1-'].metadata.state:
            window['-RECORD_STATUS-'].update("Listening...")
            window.perform_long_operation(background_recording_loop, '-RECORDING-')
        else:
            window['-RECORD_STATUS-'].update("Click to start recording")
        window['-TOGGLE1-'].update(MIC_ICON + ' 🔴' if window['-TOGGLE1-'].metadata.state else MIC_ICON)

    elif event == '-RECORDING-':
        logger.debug("Analyzing audio...")
        window['-CURRENT_QUESTION-'].update("Start analyzing...")
        window.perform_long_operation(llm.transcribe_audio, '-WHISPER COMPLETED-')

    elif event == '-WHISPER COMPLETED-':
        audio_transcript = values['-WHISPER COMPLETED-']
        window['-CURRENT_QUESTION-'].update(audio_transcript)

        window['-AI_RESPONSE-'].update("AI is thinking...")
        window.perform_long_operation(
            lambda: llm.generate_answer(audio_transcript, short_answer=False, temperature=0.7),
            '-CHAT_GPT ANSWER-',
        )

    elif event == '-CHAT_GPT ANSWER-':
        window['-AI_RESPONSE-'].update(values['-CHAT_GPT ANSWER-'])

window.close()

