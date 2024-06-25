import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const ChatForm = ({ username, channel }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    socket.emit('join channel', { username, channel });

    socket.on('chat message', (msg) => {
      if (msg.channel === channel) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    socket.on('update members', (members) => {
      setMembers(members);
    });

    return () => {
      socket.emit('leave channel', { username, channel });
      socket.off();
    };
  }, [channel, username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit('chat message', { username, channel, message });
      setMessage('');
    }
  };

  const handleToggle = (e) => {
    e.preventDefault();
    if (socket.connected) {
      socket.disconnect();
    } else {
      socket.connect();
      socket.emit('join channel', { username, channel });
    }
  };

  return (
    <div>
      <div id="channel">
        <span>Channel: <span id="currentChannel">{channel}</span></span>
      </div>
      <ul id="messages">
        {messages.map((msg, index) => (
          <li key={index}>{msg.username}: {msg.message}</li>
        ))}
      </ul>
      <form id="form" onSubmit={handleSubmit}>
        <input 
          id="input" 
          autoComplete="off" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Envoyer</button>
        <button id="toggle-btn" onClick={handleToggle}>Déconnecter</button>
      </form>
      <div id="members">
        <h3>Membres</h3>
        <ul id="membersList">
          {members.map((member, index) => (
            <li key={index}>{member}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatForm;
