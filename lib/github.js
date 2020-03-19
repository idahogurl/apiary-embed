const request = require('request-promise-native');
const url = require('url');

module.exports = async function getContents(permalink) {
  const API_URL = 'https://api.github.com/repos/{:owner}/{:repo}/contents/{:file}';
  const parsed = url.parse(permalink);
  const [_, owner, repo, ...rest] = parsed.pathname.split('/');

  let ref = '';
  if (rest[0] === 'blob') {
    rest.shift();
    const sha = rest.shift();
    ref = `?ref=${sha}`;
  }
  const file = rest.join('/');
  const uri = `${API_URL.replace('{:owner}', owner).replace('{:repo}', repo).replace('{:file}', file)}${ref}`;

  const response = await request.get(uri, {
    json: true,
    headers: {
      'User-Agent': 'Request-Promise',
      Authorization: `token ${process.env.GITHUB}`,
    },
  });

  const lineNumbers = parsed.hash; // ex. L1-L7
  const selection = lineNumbers.replace(/#L/gi, '').split('-');
  const [start, end] = selection;

  const decodedData = Buffer.from(response.content, 'base64').toString('ascii');
  const lines = decodedData.split('\n');
  return {

    lines: lines.slice(start - 1, end || start).join('/n'),
    owner,
    repo,
    file: `${file}:${selection.join('-')}`,
    htmlUrl: response.html_url,
    lineNumbers,
  };
};
