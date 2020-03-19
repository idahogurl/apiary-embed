const request = require('request-promise-native');
const url = require('url');

require('dotenv').config();

function getLanguage(extension) {
  switch (extension) {
    case 'js':
      return 'javascript';
    case 'json':
      return 'jsonp';
    case 'md':
      return 'markdown';
    default:
      return extension;
  }
}

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

  let selection;
  let start = 1;
  let end;
  const lineNumbers = parsed.hash || ''; // ex. L1-L7
  if (lineNumbers) {
    selection = lineNumbers.replace(/[#]?L/gi, '').split('-');
    [start, end] = selection;
  }

  const decodedData = Buffer.from(response.content, 'base64').toString('ascii');
  const fileParts = rest.pop().split('.');
  const language = getLanguage(fileParts.pop());

  return {
    lines: lineNumbers === '' ? decodedData : decodedData.split('\n').slice(start - 1, end || start).join('\n'),
    owner,
    repo,
    file: `${file}${selection ? `:${selection.join('-')}` : ''}`,
    htmlUrl: response.html_url + lineNumbers,
    language,
    lineNumbers,
  };
};
