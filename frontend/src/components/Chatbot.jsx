import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend } from 'react-icons/fi';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  const script = {
    start: {
      bot: "Welcome to ShifeBooks! I'm here to help you get started. What would you like to do?",
      options: ["How do I find a book?", "How do I download a book?", "What is this site about?"],
      responses: {
        "How do I find a book?": "find_book",
        "How do I download a book?": "download_book",
        "What is this site about?": "about_site",
      },
    },
    find_book: {
      bot: "You can use the search bar at the top of the page to search for books by title or author. You can also browse the collection on the main page.",
      options: ["How do I download a book?", "Thanks, that's all!"],
      responses: {
        "How do I download a book?": "download_book",
        "Thanks, that's all!": "end",
      },
    },
    download_book: {
      bot: "To download a book, you first need to be logged in and approved. Once you are, click the 'Request Download' button on any book. You'll see payment details. After paying, submit the request, and an admin will approve it. You can then download the book from your profile.",
      options: ["How do I find a book?", "Thanks, that's all!"],
      responses: {
        "How do I find a book?": "find_book",
        "Thanks, that's all!": "end",
      },
    },
    about_site: {
      bot: "ShifeBooks is a modern e-book store where you can discover and request a wide variety of digital books. Our goal is to provide a seamless and futuristic reading experience.",
      options: ["How do I find a book?", "How do I download a book?"],
      responses: {
        "How do I find a book?": "find_book",
        "How do I download a book?": "download_book",
      },
    },
    end: {
      bot: "You're welcome! Feel free to ask if you have more questions. Happy reading!",
      options: [],
    },
  };

  const [currentStep, setCurrentStep] = useState('start');

  useEffect(() => {
    if (isOpen) {
      addBotMessage(script.start.bot);
      setCurrentStep('start');
    } else {
      setMessages([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addBotMessage = (message) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { text: message, sender: 'bot' }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleOptionClick = (option) => {
    setMessages(prev => [...prev, { text: option, sender: 'user' }]);
    const nextStepKey = script[currentStep].responses[option];
    if (nextStepKey) {
      const nextStep = script[nextStepKey];
      setCurrentStep(nextStepKey);
      addBotMessage(nextStep.bot);
    } 
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-80 h-[450px] bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col border border-gray-700 overflow-hidden"
          >
            <div className="p-4 bg-gray-800/50 text-white text-center font-bold border-b border-gray-700">
              ShifeBooks Assistant
            </div>
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-white ${msg.sender === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-2 rounded-2xl bg-gray-700 rounded-bl-none text-white">
                    <div className="flex items-center space-x-1">
                       <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-0"></span>
                       <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></span>
                       <span className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-2 border-t border-gray-700">
              <div className="flex flex-wrap gap-2 justify-center">
                {script[currentStep] && script[currentStep].options.map((option, index) => (
                  <button 
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className="px-3 py-1.5 bg-gray-700/80 text-white text-sm rounded-full hover:bg-blue-600 transition-colors duration-200"
                    disabled={isTyping}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'x' : 'message'}
            initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <FiX /> : <FiMessageSquare />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default Chatbot;
