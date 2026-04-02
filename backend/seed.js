const { dbPromise, initDB } = require('./database');

const traits = [
  "will you go to this senior for fashion advice",
  "will you go to this senior for pointers to pull baddies",
  "will you go to this senior for gossip/tea",
  "will you go to this senior for tutoring",
  "will you go to this senior to bail you out of jail (metaphorically)",
  "will you go to this senior for partying",
  "will you go to this senior for consolation after heartbreak",
  "will you go to this senior for deep conversations",
  "will you go to this senior to put one psych scene"
];

async function seed() {
  const db = await initDB();

  // Clear existing data for fresh seed
  await db.exec('DELETE FROM traits');
  await db.exec('DELETE FROM sqlite_sequence WHERE name="traits"');
  await db.exec('DELETE FROM seniors');
  await db.exec('DELETE FROM sqlite_sequence WHERE name="seniors"');
  await db.exec('DELETE FROM pair_stats');

  console.log('Seeding traits...');
  for (const text of traits) {
    await db.run('INSERT INTO traits (question_text) VALUES (?)', [text]);
  }

  console.log('Seeding real seniors...');

  // PASTE YOUR CLOUDINARY PUBLIC IDs HERE for the `image` field!
  // Example: image: "person1" (instead of "person1.png.JPG")
  const myRealSeniors = [
    // TODO: Update these image values with your newly uploaded Cloudinary Public IDs
    { name: "Sarah", alias: "Board", image: "sarah" },
    { name: "Varshith", alias: "Board", image: "varshith" },
    { name: "Acharya", alias: "Board", image: "acharya" },
    { name: "Reenu", alias: "Board", image: "reenu" },
    { name: "Shashank", alias: "SC", image: "shashank" },
    { name: "Humaidh", alias: "SC", image: "humaidh" },
    { name: "Akhyan", alias: "SC", image: "akhyan" },
    { name: "Upayan (Baddie)", alias: "SC", image: "upayan" },
    { name: "Daivik", alias: "SC", image: "daivik" },
    { name: "Chirayu", alias: "SC", image: "chirayu" },
    { name: "Shikhar", alias: "SC", image: "shikhar" },
    { name: "Rujin", alias: "Board", image: "rujin" },
    { name: "Nithin", alias: "Board", image: "nithin" },
    { name: "Radhika", alias: "Board", image: "radhika" },
    { name: "Shukla", alias: "Board", image: "shukla" },
    { name: "Suhani", alias: "SC", image: "suhani" },
    { name: "Swayam", alias: "SC", image: "swayam" },
    { name: "Devansh", alias: "SC", image: "devansh" },
    { name: "Aman", alias: "Board", image: "aman" },
    { name: "Jo", alias: "SC", image: "jo" },
    { name: "Ashvik", alias: "SC", image: "ashvik" },
    { name: "Maneet", alias: "SC", image: "maneet" },
    { name: "Utkarsh", alias: "SC", image: "utkarsh" },
    { name: "Sachin", alias: "SC", image: "sachin" },
    { name: "Shourya", alias: "SC", image: "shourya" },
    { name: "Bhavya", alias: "Board", image: "bhavya" },
    { name: "Aayush K", alias: "SC", image: "aayush" },
    { name: "Rohilia", alias: "SC", image: "rohilia" },
    { name: "Aayushman", alias: "SC", image: "aayushman" },
    { name: "Ananya", alias: "SC", image: "ananya" },
    { name: "Utpal", alias: "SC", image: "Utpal" },
    { name: "Aakarsh", alias: "SC", image: "aakarsh" },
    { name: "Aayush", alias: "SC", image: "aayushcc" },
    { name: "Taba", alias: "SC", image: "taba" }
  ];

  for (const person of myRealSeniors) {
    await db.run(
      'INSERT INTO seniors (name, alias, caricature_id) VALUES (?, ?, ?)',
      [person.name, person.alias, person.image]
    );
  }

  console.log('Pre-populating pair_stats...');
  const seniorRows = await db.all('SELECT id FROM seniors');
  const traitRows = await db.all('SELECT id FROM traits');

  const insertStat = await db.prepare('INSERT INTO pair_stats (senior_id, trait_id) VALUES (?, ?)');
  for (const s of seniorRows) {
    for (const t of traitRows) {
      await insertStat.run([s.id, t.id]);
    }
  }
  await insertStat.finalize();

  console.log('Database seeded successfully!');
  await db.close();
}

seed().catch(console.error);
