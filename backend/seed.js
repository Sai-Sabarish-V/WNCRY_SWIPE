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

  // You can fill in the actual names, roles, and filenames for all 7 people here!
  const myRealSeniors = [
    { name: "Sarah", alias: "Board", image: "person1.png.JPG" },
    { name: "Varsith", alias: "Board", image: "person2.png.JPG" },
    { name: "Acharya", alias: "Board", image: "person3.jpeg" },
    { name: "Reenu", alias: "Board", image: "person4.png.JPG" },
    { name: "Shashank", alias: "SC", image: "person5.png.JPG" },
    { name: "Humaidh", alias: "SC", image: "person6.png.JPG" },
    { name: "Akhyan", alias: "SC", image: "person7.png.JPG" },
    { name: "Upayan (Baddie)", alias: "SC", image: "upayan.jpeg" },
    { name: "Daivik", alias: "SC", image: "daivik.jpeg" },
    { name: "Chirayu", alias: "SC", image: "chirayu.jpeg" },
    { name: "Shikhar", alias: "SC", image: "shikhar.jpeg" },
    { name: "Rujin", alias: "SC", image: "rujin.jpeg" },
    { name: "Nithin", alias: "SC", image: "nithin.jpeg" },
    { name: "Radhika", alias: "Board", image: "radhika.jpeg" },
    { name: "Shukla", alias: "Board", image: "shukla.jpeg" },
    { name: "Suhani", alias: "SC", image: "suhani.jpeg" },
    { name: "Swayam", alias: "SC", image: "swayam.jpeg" },
    { name: "Devansh", alias: "SC", image: "devansh.jpeg" },
    { name: "Aman", alias: "Board", image: "aman.jpeg" },
    { name: "Jo", alias: "SC", image: "jo.jpeg" },
    { name: "Ashvik", alias: "SC", image: "ashvik.jpeg" },
    { name: "Maneet", alias: "SC", image: "maneet.png" },
    { name: "Utkarsh", alias: "SC", image: "utkarsh.png" },
    { name: "Sachin", alias: "SC", image: "sachin.png" },
    { name: "Shourya", alias: "SC", image: "shourya.jpeg" },
    { name: "Bhavya", alias: "SC", image: "bhavya.jpeg" },
    { name: "Aayush", alias: "SC", image: "aayush.jpeg" },

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
