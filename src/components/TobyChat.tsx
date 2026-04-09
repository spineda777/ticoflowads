import React, { useState, useEffect } from 'react';
import { TobyService } from '../services/tobyService';
import { Button } from 'your-ui-library';
import { LucideIcon } from 'lucide-react';

const TobyChat: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        setMessages(prev => [...prev, inputValue]);
        const response = await TobyService.getResponse(inputValue);
        setMessages(prev => [...prev, response]);
        setInputValue('');
    };

    return (
        <div className={`toby-chat ${isOpen ? 'open' : 'closed'}`}>  
            <div className="chat-header bg-gradient-to-r from-blue-500 to-purple-500 p-4 flex justify-between items-center">
                <h2 className="text-white">Toby Chat</h2>
                <Button onClick={toggleChat}>{isOpen ? 'Minimize' : 'Maximize'}</Button>
            </div>
            {isOpen && (
                <div className="chat-body">
                    {messages.map((msg, index) => (
                        <div key={index} className="message">
                            {msg}
                        </div>
                    ))}
                    <input 
                        type="text" 
                        value={inputValue} 
                        onChange={(e) => setInputValue(e.target.value)} 
                        placeholder="Type your message here..."
                    />
                    <Button onClick={handleSendMessage}>Send</Button>
                </div>
            )}
        </div>
    );
};

export default TobyChat;