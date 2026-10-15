const path = require('path');
const express = require('express');
const apiRouter = require('./routes/api');

const app = express();

app.use(express.json({ limit: '50kb' }));
app.use('/api', apiRouter);
app.use('/api', (req, res) => res.status(404).json({ error: 'Nije pronađeno.' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Malformed JSON and other unexpected errors.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Neispravan zahtev.' });
  console.error(err);
  res.status(500).json({ error: 'Došlo je do greške. Pokušajte ponovo.' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`moja-tabla radi na http://localhost:${port}`));
