import React, { useState, useEffect } from 'react';
import LoginForm from './loginForm';
import ChatForm from './chatForm';
import './App.css';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeChannel, setActiveChannel] = useState('');
  const [channels, setChannels] = useState([]);
  const [members, setMembers] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});
  const [channelMessages, setChannelMessages] = useState({});

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('channels', (channels) => {
      setChannels(channels);
    });

    socket.on('members', (members) => {
      setMembers(members);
    });

    socket.on('private message', ({ from, to, message }) => {
      setPrivateMessages((prevMessages) => ({
        ...prevMessages,
        [from]: [...(prevMessages[from] || []), { from, to, message }],
        [to]: [...(prevMessages[to] || []), { from, to, message }],
      }));
    });

    socket.on('channel message', ({ channel, message }) => {
      setChannelMessages((prevMessages) => ({
        ...prevMessages,
        [channel]: [...(prevMessages[channel] || []), message],
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogin = (username) => {
    setUsername(username);
    setIsLoggedIn(true);
  };

  const handleChannelChange = (channel) => {
    setActiveChannel(channel);
  };

  const handleUsernameChange = (newUsername) => {
    setUsername(newUsername);
    socket.emit('change username', { oldUsername: username, newUsername });
  };

  const handlePrivateMessage = (to, message) => {
    socket.emit('private message', { from: username, to, message });
    setPrivateMessages((prevMessages) => ({
      ...prevMessages,
      [to]: [...(prevMessages[to] || []), { from: username, to, message }],
    }));
  };

  const handleChannelMessage = (channel, message) => {
    socket.emit('channel message', { channel, message });
    setChannelMessages((prevMessages) => ({
      ...prevMessages,
      [channel]: [...(prevMessages[channel] || []), { from: username, message }],
    }));
  };

  return (
    <div className="app">
      {!isLoggedIn ? (
        <div className="login-container">
          <LoginForm onLogin={handleLogin} />
        </div>
      ) : (
        <div className="chat-container">
          <div className="sidebar sidebar-left">
            <h2>Channels</h2>
            <ul className="channels-list">
              {channels.map((channel) => (
                <li key={channel}>
                  <button onClick={() => handleChannelChange(channel)}>{channel}</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="chat">
            <ChatForm
              username={username}
              channel={activeChannel}
              onUsernameChange={handleUsernameChange}
              onPrivateMessage={handlePrivateMessage}
              onChannelMessage={handleChannelMessage}
              privateMessages={privateMessages[username] || []}
              channelMessages={channelMessages[activeChannel] || []}
              members={members}
            />
            <div className="chat-footer">
              <input
                type="text"
                placeholder={`Message ${activeChannel ? `#${activeChannel}` : 'privé'}`}
                className="message-input"
              />
              <button className="send-button">Envoyer</button>
            </div>
          </div>
          <div className="sidebar sidebar-right">
            <h2>Membres actifs</h2>
            <ul className="members-list">
              {members.map((member) => (
                <li key={member}>
                  {member !== username && (
                    <button onClick={() => handlePrivateMessage(member, '')}>{member}</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
