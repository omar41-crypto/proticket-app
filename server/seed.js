const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Match = require('./models/Match');

dotenv.config();

const dummyMatches = [
  {
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    stadium: 'Santiago Bernabéu',
    date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
    price: 150,
    totalSeats: 80000,
    availableSeats: 5000,
  },
  {
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    stadium: 'Etihad Stadium',
    date: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // In 2 weeks
    price: 90,
    totalSeats: 55000,
    availableSeats: 1200,
  },
  {
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    stadium: 'Allianz Arena',
    date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // In 3 days
    price: 110,
    totalSeats: 75000,
    availableSeats: 8000,
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected for seeding');
    await Match.deleteMany({});
    console.log('Cleared existing matches');
    
    await Match.insertMany(dummyMatches);
    console.log('Inserted dummy matches');
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Seeding error:', err);
    mongoose.connection.close();
  });
