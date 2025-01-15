import React from 'react';
import ReactDOM from 'react-dom';
import InterviewAssistant from './components/InterviewAssistant';

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">AI Interview Assistant</h1>
      <InterviewAssistant />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));

