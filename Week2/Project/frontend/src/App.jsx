import Extractor from './components/Extractor';
import Chatbot from './components/Chatbot';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Smart Extractor & Streaming Chat Service</h1>
      </header>
      
      <main className="dashboard">
        <section className="left-panel">
          <Extractor />
        </section>
        
        <section className="right-panel">
          <Chatbot />
        </section>
      </main>
    </div>
  );
}

export default App;
