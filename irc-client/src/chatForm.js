import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const ChatForm = ({ username, onUsernameChange }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [channel, setChannel] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [memberToRemove, setMemberToRemove] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('chat message', (msg) => {
      if (msg.channel === channel || msg.channel === 'global') {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    newSocket.on('chat history', (history) => {
      setMessages(history);
    });

    newSocket.on('update members', (members) => {
      setMembers(members);
    });

    newSocket.on('connect_error', () => {
      setError('Connexion échouée');
    });

    newSocket.on('disconnect', () => {
      setNotification('Vous avez été déconnecté');
    });

    return () => {
      newSocket.emit('leave channel', { username, channel });
      newSocket.off('chat message');
      newSocket.off('chat history');
      newSocket.off('update members');
      newSocket.disconnect();
    };
  }, [channel, username]);

  const handleSubmite = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit('chat message', { username, channel, message });
      setMessage('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && channel) {
      socket.emit('join channel', { username, channel });
      setError('');
      setNotification(`Vous avez rejoint le channel ${channel}`);
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

  const handleUsernameChangeSubmit = (e) => {
    e.preventDefault();
    if (newUsername) {
      socket.emit('change username', { oldUsername: username, newUsername });
      onUsernameChange(newUsername);
      setNewUsername('');
    }
  };

  const handleRemoveMember = (e) => {
    e.preventDefault();
    if (memberToRemove) {
      socket.emit('remove member', { channel, memberToRemove });
      setMemberToRemove('');
    }
  };

  const handleDeleteChannel = () => {
    socket.emit('delete channel', { channel });
    setChannel('');
    setMessages([]);
    setMembers([]);
  };

  return (
    <div>
      <div id="channel">
        <span>Channel: <span id="currentChannel">{channel || 'Aucun'}</span></span><br />
        <span>Utilisateur: <span>{username}</span></span>
      </div>
      <form onSubmit={handleSubmit}>
        <div id="channel">
          <input
            type="text"
            placeholder="Nom du channel"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            required
          />
        </div>
        <button type="submit">Créer un Channel</button>
      </form>
      <form id="form" onSubmit={handleSubmite}>
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
      <form onSubmit={handleUsernameChangeSubmit}>
        <input
          type="text"
          placeholder="Nouveau nom d'utilisateur"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        />
        <button type="submit">Changer d'utilisateur</button>
      </form>
      <form onSubmit={handleRemoveMember}>
        <input
          type="text"
          placeholder="Nom du membre à supprimer"
          value={memberToRemove}
          onChange={(e) => setMemberToRemove(e.target.value)}
        />
        <button type="submit">Supprimer membre</button>
      </form>
      <button onClick={handleDeleteChannel}>Supprimer le channel</button>
      {error && <div className="error">{error}</div>}
      {notification && <div className="notification">{notification}</div>}
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
