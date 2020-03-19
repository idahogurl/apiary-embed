const express = require('express');
const url = require('url');
const getContents = require('../lib/github');

require('dotenv').config();

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index');
});

router.get('/apiary/embed', (req, res) => {
  const parsed = url.parse(req.query.url);

  const [name] = parsed.hostname.split('.');
  res.json({
    version: '1.0',
    type: 'rich',
    provider_name: 'Apiary',
    provider_url: 'http://www.apiary.io/',
    width: 425,
    height: 344,
    title: '',
    author_name: 'Rebecca Vest',
    author_url: 'http://www.github.com/idahogurl',
    html: `<iframe src="https://notion-embed.herokuapp.com/apiary/${name}"></iframe>`,
  });
});

router.get('/apiary/:name', (req, res) => {
  res.render('index', { name: req.params.name });
});

router.get('/github', async (req, res) => {
  const content = getContents(req.query.url);
  res.render('github', content);
});

router.get('/github/embed', (req, res) => {
  res.json({
    version: '1.0',
    type: 'rich',
    provider_name: 'GitHub',
    provider_url: 'http://www.github.com/',
    width: 425,
    height: 344,
    title: '',
    author_name: 'Rebecca Vest',
    author_url: 'http://www.github.com/idahogurl',
    html: `<iframe src="https://notion-embed.herokuapp.com/github/?permalink=${req.query.url}"></iframe>`,
  });
});

module.exports = router;
