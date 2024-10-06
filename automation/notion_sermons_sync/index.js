import functions from '@google-cloud/functions-framework';
import { syncSermons } from './src/functions/sync_sermons.js';

functions.http('syncSermons', async (_, res) => {
  try {
    await syncSermons();
    res.send('Sync Sermons Done.');
  } catch(error) {
    console.log(error);
    res.send('Sync Sermons Failed.');
  }
});

functions.http('syncSundaySchools', async (_, res) => {
  res.send('Hello World2!');
});
