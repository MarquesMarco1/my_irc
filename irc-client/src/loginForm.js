import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [channel, setChannel] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && channel) {
      onLogin(username, channel);
    }
  };

  return (
    <div id="login">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Entrez votre nom" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required 
        />
        <input 
          type="text" 
          placeholder="Nom du channel" 
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          required 
        />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default LoginForm;
