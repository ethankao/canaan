import gWorker from './src/google_sheets.js';
import nWorker from './src/notion.js';

const videoSheet = '1QoN8CKFdt9PnMLlowUw3nOVUvmeEGSNeg_z1GzoG3_0';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/// Video
(async () => {
  try {
    const tabName = 'Public';
    const importedField = 'H';
    const auth = await gWorker.authorize();
    const records = await gWorker.fetchSheetRecords(auth, videoSheet, tabName);

    if (records.length == 0) { return; }

    const notion = await nWorker.createNotionClient();

    for (const r of records) {
      try {
        console.log(`Importing Video: ${JSON.stringify(r)}`);
        await nWorker.createVideoTestimonyRecord(notion, r, false);
        await gWorker.markRecordIsImported(auth, videoSheet, tabName, r.rowIndex, importedField);
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
