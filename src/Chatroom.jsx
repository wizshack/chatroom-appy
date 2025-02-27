import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './ChatRoom.css';

// Connect to the Socket.IO server
const socket = io('http://localhost:3001');

function ChatRoom() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [bgColor, setBgColor] = useState('#d3d3d3'); // Default gray background
  const [userCount, setUserCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const messageEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const colorOptions = ['#d3d3d3', '#f9f9f9', '#e0f7fa', '#ffe0b2', '#fce4ec'];

  // Focus on chat input after registration
  useEffect(() => {
    if (isRegistered && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [isRegistered]);

  // Socket event listeners
  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user count', (count) => {
      setUserCount(count);
    });

    socket.on('user list', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('chat message');
      socket.off('user count');
      socket.off('user list');
    };
  }, []);

  // Auto-scroll messages on update
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chat message', message);
      setMessage('');
      chatInputRef.current.focus();
    }
  };

  const registerUser = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit('register user', username);
      setIsRegistered(true);
    }
  };

  return (
    <div className="chat-container" style={{ backgroundColor: bgColor }}>
      {/* Registration Modal */}
      {!isRegistered && (
        <div className="modal">
          <div className="modal-content">
            <form className="modal-form" onSubmit={registerUser}>
              <h2>Enter Your Name</h2>
              <input
                type="text"
                placeholder="Your name..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                ref={nameInputRef}
                autoFocus
              />
              <button type="submit">Join Chat</button>
            </form>
          </div>
        </div>
      )}

      {/* Top Right Controls: Color Picker & User Count */}
      <div className="top-right">
        <div className="color-picker">
          {colorOptions.map((color) => (
            <button
              key={color}
              className="color-option"
              style={{ backgroundColor: color }}
              onClick={() => setBgColor(color)}
            />
          ))}
        </div>
        <div className="user-count">
          {userCount} {userCount === 1 ? 'user' : 'users'}
        </div>
      </div>

      {/* Right-Side User List */}
      <div className="user-list">
        <h3>Connected Users</h3>
        <ul>
          {users.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>

      {/* Chat Messages */}
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            {msg}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Chat Input */}
      {isRegistered && (
        <form className="chat-input" onSubmit={sendMessage}>
          <input
            type="text"
            ref={chatInputRef}
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => chatInputRef.current.focus()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage(e);
            }}
          />
        </form>
      )}
    </div>
  );
}

export default ChatRoom;
