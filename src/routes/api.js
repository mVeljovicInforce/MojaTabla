const express = require('express');
const queries = require('../queries');
const { validateStreet, validatePost, validateComment } = require('../validation');

const router = express.Router();

// Route params must be positive integers; anything else is "not found".
function parseId(value) {
  return /^\d+$/.test(value) ? Number(value) : null;
}

function findCity(req, res) {
  const city = queries.getCity(parseId(req.params.cityId));
  if (!city) res.status(404).json({ error: 'Grad nije pronađen.' });
  return city;
}

function findStreet(req, res) {
  const street = queries.getStreet(parseId(req.params.streetId));
  if (!street) res.status(404).json({ error: 'Ulica nije pronađena.' });
  return street;
}

function findPost(req, res) {
  const post = queries.getPost(parseId(req.params.postId));
  if (!post) res.status(404).json({ error: 'Objava nije pronađena.' });
  return post;
}

router.get('/cities', (req, res) => {
  res.json(queries.listCities());
});

router.get('/cities/:cityId/streets', (req, res) => {
  const city = findCity(req, res);
  if (city) res.json(queries.listStreets(city.id));
});

// Creates the street, or returns the existing one if the normalized name matches.
router.post('/cities/:cityId/streets', (req, res) => {
  const city = findCity(req, res);
  if (!city) return;

  const { error, value } = validateStreet(req.body);
  if (error) return res.status(400).json({ error });

  const existing = queries.findStreetByNormalizedName(city.id, value.normalizedName);
  if (existing) return res.json(existing);

  res.status(201).json(queries.createStreet(city.id, value.name, value.normalizedName));
});

router.get('/streets/:streetId', (req, res) => {
  const street = findStreet(req, res);
  if (street) res.json(street);
});

router.get('/streets/:streetId/posts', (req, res) => {
  const street = findStreet(req, res);
  if (street) res.json(queries.listPosts(street.id));
});

router.post('/streets/:streetId/posts', (req, res) => {
  const street = findStreet(req, res);
  if (!street) return;

  const { error, value } = validatePost(req.body);
  if (error) return res.status(400).json({ error });

  res.status(201).json(queries.createPost(street.id, value));
});

router.get('/posts/:postId', (req, res) => {
  const post = findPost(req, res);
  if (post) res.json(post);
});

router.get('/posts/:postId/comments', (req, res) => {
  const post = findPost(req, res);
  if (post) res.json(queries.listComments(post.id));
});

router.post('/posts/:postId/comments', (req, res) => {
  const post = findPost(req, res);
  if (!post) return;

  const { error, value } = validateComment(req.body);
  if (error) return res.status(400).json({ error });

  res.status(201).json(queries.createComment(post.id, value));
});

module.exports = router;
