const fs = require('fs');

// Mock DOM/Browser
const localStorage = { 
  store: {}, 
  getItem(k) { return this.store[k]; }, 
  setItem(k,v) { this.store[k] = v; } 
};
const RATINGS_KEY = 'seniorSwipeTraitRatings';

// data/members.js content
const members = [
  { id: 1, name: "Arjun Mehta" },
  { id: 2, name: "Priya Singh" },
  { id: 3, name: "Rohan Patel" }
];

// traits
const traits = [
    { id: 't1', category: "social" },
    { id: 't2', category: "personality" }
];

let ratings = {};
traits.forEach(t => ratings[t.id] = {});

// Simulate swipe "yes" for Arjun on trait t1
ratings['t1'][1] = 'yes';
// Simulate swipe "yes" for Priya on trait t1
ratings['t1'][2] = 'no';
localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));

// Simulate reload
let loadedRatings = JSON.parse(localStorage.getItem(RATINGS_KEY));

const scoredMembers = members.map(m => {
  let yesVotes = 0;
  traits.forEach(trait => {
      // test filterId = 'overall'
      if ('overall' === 'overall' || trait.id === 'overall') {
          if (loadedRatings[trait.id] && loadedRatings[trait.id][m.id] === 'yes') {
              yesVotes++;
          }
      }
  });
  return { ...m, yesVotes };
});

console.log(JSON.stringify(scoredMembers, null, 2));
