import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ChatForm = ({ username, channel }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.emit('join channel', { username, channel });

    newSocket.on('chat message', (msg) => {
      if (msg.channel === channel) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    newSocket.on('update members', (members) => {
      setMembers(members);
    });

    return () => {
      newSocket.emit('leave channel', { username, channel });
      newSocket.off('chat message');
      newSocket.off('update members');
      newSocket.disconnect();
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
    if (socket) {
      if (socket.connected) {
        socket.disconnect();
      } else {
        socket.connect();
        socket.emit('join channel', { username, channel });
      }
    }
  };

  return (
    <div>
      <div id="channel">
        <span>Utilisateur: <span>{username}</span></span>
      </div>
      <div id="channel">
        <span>Channel: <span id="currentChannel">{channel}</span></span>
      </div>
      <form id="form" onSubmit={handleSubmit}>
        <input 
          id="input" 
          autoComplete="off" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Envoyer</button>
        <button id="toggle-btn" onClick={handleToggle}>
          {socket && socket.connected ? 'Déconnecter' : 'Reconnecter'}
        </button>
      </form>
      <div id="members">
        <span>Membres: </span>
        <ul id="membersList">
          {members.filter(member => member !== username).map((member, index) => (
            <li key={index}>{member}</li>
          ))}
        </ul>
      </div>
      <ul id="messages">
        {messages.map((msg, index) => (
          <li key={index}>{msg.username}: {msg.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default ChatForm;
