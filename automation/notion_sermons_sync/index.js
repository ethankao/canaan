import functions from '@google-cloud/functions-framework';
import { syncSermons } from './src/functions/sync_sermons.js';
import { syncSundaySchools } from './src/functions/sync_sunday_school.js';
import { syncVideos } from './src/functions/sync_videos.js';
import { parseJwt } from './src/base/utils.js';


function logAuth(req, name) {
  const auth = parseJwt(req.header('Authorization'));
  console.log(`Starting ${name} by ${auth}`);
}

functions.http('syncSermons', async (req, res) => {
  logAuth(req, 'syncSermons');
  try {
    await syncSermons();
    res.send('Sync Sermons Done.');
  } catch(error) {
    console.log(error);
    res.send('Sync Sermons Failed');
  }
});

functions.http('syncSundaySchools', async (req, res) => {
  logAuth(req, 'syncSundaySchools');
  try {
    await syncSundaySchools();
    res.send('Sync Sunday Schools Done.');
  } catch(error) {
    console.log(error);
    res.send('Sync Sunday Schools Failed.');
  }
});

functions.http('syncVideos', async (req, res) => {
  logAuth(req, 'syncVideos');
  try {
    await syncVideos();
    res.send('Sync Videos Done.');
  } catch(error) {
    console.log(error);
    res.send('Sync Videos Failed.');
  }
});
