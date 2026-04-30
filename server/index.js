const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

// Models
const Match = require('./models/Match');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes

// GET /api/matches (fetch all matches)
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching matches', error: error.message });
  }
});

// POST /api/matches (add a new match)
app.post('/api/matches', async (req, res) => {
  try {
    const newMatch = new Match(req.body);
    const savedMatch = await newMatch.save();
    res.status(201).json(savedMatch);
  } catch (error) {
    res.status(400).json({ message: 'Error adding match', error: error.message });
  }
});

// POST /api/bookings (create a booking, check availability, subtract seats)
app.post('/api/bookings', async (req, res) => {
  const { matchId, userEmail, seatsBooked } = req.body;

  try {
    // 1. Check if match exists and has enough seats
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    if (match.availableSeats < seatsBooked) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    // 2. Calculate total price
    const totalPrice = match.price * seatsBooked;

    // 3. Create and save the booking
    const newBooking = new Booking({
      matchId,
      userEmail,
      seatsBooked,
      totalPrice
    });
    const savedBooking = await newBooking.save();

    // 4. Subtract seats from the match and save
    match.availableSeats -= seatsBooked;
    await match.save();

    res.status(201).json({ message: 'Booking successful', booking: savedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Error processing booking', error: error.message });
  }
});

// POST /api/chat (Astro AI Assistant)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // Fetch all matches to provide context to the AI
    const matches = await Match.find();
    const matchContext = matches.map(m => 
      `${m.homeTeam} vs ${m.awayTeam} at ${m.stadium} on ${new Date(m.date).toLocaleDateString()} - Price: $${m.price} - Available Seats: ${m.availableSeats}`
    ).join('\n');

    console.log("Checking API Key before Gemini call:", process.env.GEMINI_API_KEY);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are Astro, an enthusiastic, energetic, and helpful AI assistant for ProTicket, a futuristic sports ticketing app.
A user is asking for match suggestions based on their mood or preferences.
Here are the currently available matches:
${matchContext}

User message: "${message}"

Respond to the user in a friendly, conversational, and energetic tone. Suggest 1 or 2 matches that best fit their request, and briefly explain why. Keep it relatively short and formatted well.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    res.json({ reply: responseText });
  } catch (error) {
    console.error('Gemini API Error details:', error.status, error.statusText, error.message);
    res.status(error.status || 500).json({ 
      message: 'Error communicating with Astro', 
      error: error.message,
      status: error.status 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
