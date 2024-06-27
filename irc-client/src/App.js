import React, { useEffect, useState } from 'react';
import LoginForm from './loginForm';
import ChatForm from './chatForm';
import './App.css';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [username, setUsername] = useState('');
  const [channel, setChannel] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  const handleLogin = (username) => {
    setUsername(username);
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
