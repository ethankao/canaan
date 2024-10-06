import gWorker from '../base/google_sheets.js';
import nWorker from '../base/notion.js';

const config = {
  sheet: '1QoN8CKFdt9PnMLlowUw3nOVUvmeEGSNeg_z1GzoG3_0',
  tabName: 'Public',
  importedField: 'H',
  database: '63709361257a479390bbc45b96cea5f0'
  // database: '15b72557477e4c8c85de1b8566c89770' // test
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/// Video
(async () => {
  try {
    const auth = await gWorker.authorize();
    const records = await gWorker.fetchSheetRecords(auth, config.sheet, config.tabName);

    if (records.length == 0) { return; }

    const notion = await nWorker.createNotionClient();

    for (const r of records) {
      try {
        console.log(`Importing Video: ${JSON.stringify(r)}`);
        await nWorker.createVideoTestimonyRecord(notion, config.database, r, false);
        await gWorker.markRecordIsImported(auth, config.sheet, config.tabName, r.rowIndex, config.importedField);
        console.log(`Importing: ${r.rowIndex} done.\n`);
        await sleep(350); // avoid rate limits
      } catch(error) {
        console.error(`Fail to create video record ${r.rowIndex}: ${error}\n`);
      }
    }
  } catch(error) {
    console.error(error);
  }
})();
