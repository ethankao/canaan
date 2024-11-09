function parseJwt (token) {
  if (!token) {
    return 'unknown';
  }
  return Buffer.from(token.split('.')[1], 'base64').toString();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { parseJwt, sleep }
