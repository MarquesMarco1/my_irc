import React, { useState } from 'react';
import LoginForm from './loginForm';
import ChatForm from './chatForm';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [channel, setChannel] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (username, channel) => {
    setUsername(username);
    setChannel(channel);
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <ChatForm username={username} channel={channel} />
      )}
    </div>
  );
}

export default App;
