import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Paperclip, Send, Smile } from 'lucide-react';
import { getLinkedInMessages, sendLinkedInMessage } from '../../services/unipileService';
import { toast } from 'react-toastify';

interface Message {
  id: string;
  sender: {
    name: string;
    profile_url: string;
    initials?: string;
  };
  content: string;
  timestamp: string;
  isConnected?: boolean;
}

interface Contact {
  id: string;
  name: string;
  title: string;
  initials: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: boolean;
}

export function LinkedInInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await getLinkedInMessages({ limit: 50 });
      setMessages(response.items);
      
      // Create contacts from messages
      const uniqueContacts = new Map();
      response.items.forEach((message: Message) => {
        if (!uniqueContacts.has(message.sender.name)) {
          uniqueContacts.set(message.sender.name, {
            id: message.id,
            name: message.sender.name,
            title: 'Frontend Developer', // This should come from the API
            initials: message.sender.name.split(' ').map(n => n[0]).join(''),
            lastMessage: message.content,
            timestamp: message.timestamp,
            unread: false
          });
        }
      });
      setContacts(Array.from(uniqueContacts.values()));
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error al cargar los mensajes');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !newMessage.trim()) return;

    try {
      await sendLinkedInMessage(selectedContact.id, newMessage);
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          sender: {
            name: 'You',
            profile_url: '',
            initials: 'YO'
          },
          content: newMessage,
          timestamp: new Date().toISOString()
        }
      ]);
      setNewMessage('');
      toast.success('Mensaje enviado con éxito');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white">
      {/* Left sidebar - Contact list */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar conversación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 ${
                selectedContact?.id === contact.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                contact.unread ? 'bg-blue-600' : 'bg-gray-400'
              }`}>
                {contact.initials}
              </div>
              <div className="flex-1 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.title}</p>
                  </div>
                  {contact.timestamp && (
                    <span className="text-xs text-gray-500">
                      {new Date(contact.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                {contact.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right side - Chat */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white">
                  {selectedContact.initials}
                </div>
                <div>
                  <h2 className="font-medium text-gray-900">{selectedContact.name}</h2>
                  <p className="text-sm text-gray-500">{selectedContact.title}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter(msg => msg.sender.name === selectedContact.name || msg.sender.name === 'You')
                .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender.name === 'You' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender.name === 'You'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender.name === 'You' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="text-gray-400 hover:text-gray-600">
                  <Smile size={20} />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className={`p-2 rounded-lg ${
                    newMessage.trim()
                      ? 'text-blue-600 hover:bg-blue-50'
                      : 'text-gray-400'
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecciona una conversación para comenzar
          </div>
        )}
      </div>
    </div>
  );
}