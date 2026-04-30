import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, MapPin, Calendar, X, Search, ArrowUpDown, MessageSquare, Send, Bot } from 'lucide-react';

function App() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [bookingEmail, setBookingEmail] = useState('');
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [bookingStatus, setBookingStatus] = useState(null);

  // New state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('none');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'astro', content: "Hi! I'm Astro, your ProTicket AI assistant. What kind of match are you in the mood for?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('https://proticket-app.onrender.com/api/matches');
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingStatus('processing');
    try {
      await axios.post('https://proticket-app.onrender.com/api/bookings', {
        matchId: selectedMatch._id,
        userEmail: bookingEmail,
        seatsBooked: parseInt(seatsToBook),
      });
      setBookingStatus('success');
      setTimeout(() => {
        setSelectedMatch(null);
        setBookingStatus(null);
        setSeatsToBook(1);
        setBookingEmail('');
        fetchMatches(); // Refresh matches after booking
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingStatus('error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await axios.post('https://proticket-app.onrender.com/api/chat', { message: userMessage });
      setChatMessages(prev => [...prev, { role: 'astro', content: response.data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { role: 'astro', content: 'Oops! My circuits got scrambled. Can you try asking again?' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const filteredAndSortedMatches = matches
    .filter(match => 
      match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) || 
      match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.stadium.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      if (sortOrder === 'desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans pb-24 md:pb-8">
      <header className="max-w-6xl mx-auto mb-10 text-center mt-4 md:mt-8">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-electric-cyan to-deep-violet mb-4 tracking-tight"
        >
          ProTicket
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-lg md:text-xl font-light"
        >
          Experience the future of sports ticketing.
        </motion.p>
      </header>

      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row gap-4 justify-between items-center bg-card-dark p-4 rounded-2xl border border-deep-violet/30 shadow-[0_0_20px_rgba(138,43,226,0.1)]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search teams or stadiums..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-bg-dark border border-deep-violet/30 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-electric-cyan focus:ring-1 focus:ring-electric-cyan transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <ArrowUpDown className="text-electric-cyan shrink-0" size={20} />
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full md:w-auto bg-bg-dark border border-deep-violet/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-electric-cyan focus:ring-1 focus:ring-electric-cyan transition-all appearance-none cursor-pointer"
          >
            <option value="none">Sort by Price</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-12">
        {filteredAndSortedMatches.map((match, index) => (
          <motion.div
            key={match._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="bg-card-dark rounded-2xl p-7 border border-deep-violet/30 shadow-[0_0_20px_rgba(138,43,226,0.1)] hover:shadow-[0_0_30px_rgba(0,255,255,0.25)] hover:border-electric-cyan/60 relative overflow-hidden group flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-deep-violet to-electric-cyan transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-electric-cyan font-bold text-xl md:text-2xl">{match.homeTeam}</span>
              <span className="text-gray-600 font-black text-sm mx-2 italic">VS</span>
              <span className="text-deep-violet font-bold text-xl md:text-2xl text-right">{match.awayTeam}</span>
            </div>

            <div className="space-y-4 mb-10 text-gray-300 flex-grow">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-electric-cyan shrink-0" />
                <span className="text-sm font-medium truncate">{match.stadium}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-deep-violet shrink-0" />
                <span className="text-sm font-medium">{new Date(match.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <Ticket size={20} className="text-gray-400 shrink-0" />
                <span className="text-sm font-medium">{match.availableSeats} <span className="text-gray-500">seats available</span></span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <span className="text-3xl font-bold text-white tracking-tight">${match.price}</span>
              <button
                onClick={() => setSelectedMatch(match)}
                className="bg-gradient-to-r from-deep-violet to-electric-cyan text-bg-dark font-bold py-2.5 px-6 rounded-full hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:brightness-110 transition-all duration-300"
              >
                Book Ticket
              </button>
            </div>
          </motion.div>
        ))}
        {filteredAndSortedMatches.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500 text-lg">
            No matches found.
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-card-dark border border-deep-violet/40 rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(138,43,226,0.3)] max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => {
                  setSelectedMatch(null);
                  setBookingStatus(null);
                }}
                className="absolute top-5 right-5 text-gray-500 hover:text-electric-cyan transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-extrabold text-white mb-2">Book Your Seat</h2>
              <p className="text-electric-cyan font-medium mb-8">
                {selectedMatch.homeTeam} <span className="text-gray-500">vs</span> {selectedMatch.awayTeam}
              </p>

              <form onSubmit={handleBooking} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    className="w-full bg-bg-dark border border-deep-violet/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-electric-cyan focus:ring-1 focus:ring-electric-cyan transition-all"
                    placeholder="fan@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Number of Seats</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedMatch.availableSeats}
                    required
                    value={seatsToBook}
                    onChange={(e) => setSeatsToBook(e.target.value)}
                    className="w-full bg-bg-dark border border-deep-violet/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-electric-cyan focus:ring-1 focus:ring-electric-cyan transition-all"
                  />
                </div>

                <div className="flex justify-between items-center py-5 border-t border-deep-violet/20 mt-6">
                  <span className="text-gray-400 font-medium">Total Price</span>
                  <span className="text-3xl font-bold text-electric-cyan">
                    ${(selectedMatch.price * seatsToBook) || 0}
                  </span>
                </div>

                {bookingStatus === 'error' && (
                  <div className="text-red-400 text-sm mb-4 text-center">Failed to process booking. Please try again.</div>
                )}

                <button
                  type="submit"
                  disabled={bookingStatus === 'processing' || bookingStatus === 'success'}
                  className="w-full bg-gradient-to-r from-deep-violet to-electric-cyan text-bg-dark font-black text-lg py-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:brightness-110 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {bookingStatus === 'processing' ? 'Processing...' : 
                   bookingStatus === 'success' ? 'Booking Confirmed! 🎉' : 
                   'Confirm Booking'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Astro AI Assistant Floating UI */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 md:bottom-28 md:right-8 w-[calc(100vw-32px)] md:w-96 bg-card-dark border border-electric-cyan/40 rounded-2xl shadow-[0_0_30px_rgba(0,255,255,0.2)] flex flex-col z-40 overflow-hidden"
            style={{ maxHeight: '60vh' }}
          >
            <div className="bg-gradient-to-r from-deep-violet to-electric-cyan p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="text-bg-dark" size={24} />
                <span className="font-bold text-bg-dark">Astro Assistant</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-bg-dark hover:brightness-150 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-bg-dark/50" style={{ minHeight: '300px' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-electric-cyan text-bg-dark rounded-tr-sm' : 'bg-card-dark border border-deep-violet/40 text-gray-200 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-2xl text-sm bg-card-dark border border-deep-violet/40 text-gray-400 rounded-tl-sm flex gap-1">
                    <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-card-dark border-t border-deep-violet/30 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Astro..."
                className="flex-grow bg-bg-dark border border-deep-violet/30 rounded-full px-4 py-2 text-white focus:outline-none focus:border-electric-cyan focus:ring-1 focus:ring-electric-cyan transition-all text-sm"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="bg-electric-cyan text-bg-dark p-2 rounded-full hover:brightness-110 disabled:opacity-50 transition-all"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-gradient-to-r from-deep-violet to-electric-cyan text-bg-dark p-4 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] hover:scale-105 transition-all z-50 flex items-center justify-center group"
      >
        <MessageSquare size={28} className="group-hover:hidden" />
        <Bot size={28} className="hidden group-hover:block" />
      </button>

    </div>
  );
}

export default App;
