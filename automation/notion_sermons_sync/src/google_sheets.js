import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

import { filePath, readFileAsJson, writeJsonToFile } from './fs_utils.js';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_FILE = 'token.json';
const CREDENTIALS_FILE = 'credentials.json';
const LAST_COL = 'J';

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const credentials = await readFileAsJson(TOKEN_FILE);
    return google.auth.fromJSON(credentials);
  } catch {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const keys = await readFileAsJson(CREDENTIALS_FILE);
  const key = keys.installed || keys.web;
  const json = {
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  };
  await writeJsonToFile(json, CREDENTIALS_FILE);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: filePath(CREDENTIALS_FILE),
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

const arrayKeys = {
  tags: 1,
  speakers: 1,
  verses: 1
};

async function fetchSundaySchoolSheetRecords(auth, spreadsheetId, tab) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A1:${LAST_COL}` // skip header
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log(`No data found in ${tab}.`);
    throw new Error(`No data found in ${tab}`);
  }

  const valueMap = createHeaderMap(rows.shift());
  return rows
    .map((row, index) => { return rowToRecord(row, index, valueMap) })
    .filter(n => n)
    .filter(n => n.title && !n.imported);
}

// Example record:
// {
//    date: '8/18/2024',
//    topic: '戲劇性的轉變',
//    speakers: [ '許司提 牧師' ],
//    verses: [ '使徒行傳 9:1-22' ],
//    ministry: 'MM',
//    videoLink: 'https://youtu.be/GL9S2sq2XUM?si=6KrHX5uQFo2XlTAH',
//    audioLink: 'https://drive.google.com/file/d/1akUTOPiR77QXPcmVLKtqStDFHT8sBJwf/view',
//    tags: ['any tags'],
//    rowIndex: 2
//  }
//
async function fetchSheetRecords(auth, spreadsheetId, tab) {
  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A1:${LAST_COL}` // skip header
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log(`No data found in ${tab}.`);
    throw new Error(`No data found in ${tab}`);
  }

  const valueMap = createHeaderMap(rows.shift());
  return rows
    .map((row, index) => { return rowToRecord(row, index, valueMap) })
    .filter(n => n)
    .filter(n => n.topic && n.ministry && n.videoLink && !n.imported);
}

async function markRecordIsImported(auth, spreadsheetId, tab, index, lastCol, pageId) {
  const sheets = google.sheets({ version: 'v4', auth });
  const values = [ [ pageId || 1 ] ];
  const resource = { values };

  const lastPos = `${lastCol || LAST_COL}${index}`;
  const range = `${tab}!${lastPos}:${lastPos}`;
  const params = {
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource
  };
  const result = await sheets.spreadsheets.values.update(params);

  console.log('%d cells updated.', result.data.updatedCells);
  return result;
}

function rowToRecord(row, index, valueMap) {
  if (row.length == 0) {
    return null;
  }

  return {
    ...Object.fromEntries(row.map((value, index) => {
      const key = [valueMap[index]];
      if (arrayKeys[key]) {
        if (!value) {
          return [];
        }
        return [key, value.split(',').map(n => n.trim())];
      }
      return [key, value.trim()];
    })),
    rowIndex: index + 2
  }
}

function toCamelCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
            index === 0 ? match.toLowerCase() : match.toUpperCase()
        )
        .replace(/\s+/g, '');
}

function createHeaderMap(headerRow) {
  return Object.fromEntries(headerRow.map((value, index) => [index, toCamelCase(value)]));
}

export default {
  authorize,
  fetchSheetRecords,
  fetchSundaySchoolSheetRecords,
  markRecordIsImported
}
