import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io();

function App() {
  const [code, setCode] = useState('');
  const [roomId] = useState('default-room');
  const [connected, setConnected] = useState(false);
  const isTyping = useRef(false);

  useEffect(() => {
    socket.emit('join-room', roomId);

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('code-sync', (syncedCode) => {
      setCode(syncedCode);
    });

    socket.on('code-update', (newCode) => {
      if (!isTyping.current) {
        setCode(newCode);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('code-sync');
      socket.off('code-update');
    };
  }, [roomId]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    isTyping.current = true;
    clearTimeout(isTyping.current);
    setTimeout(() => {
      isTyping.current = false;
    }, 100);
    socket.emit('code-change', { roomId, code: newCode });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Code Collab</h1>
        <span className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </header>
      <main>
        <textarea
          className="code-editor"
          value={code}
          onChange={handleCodeChange}
          placeholder="Start typing code to collaborate..."
          spellCheck="false"
        />
      </main>
    </div>
  );
}

export default App;
