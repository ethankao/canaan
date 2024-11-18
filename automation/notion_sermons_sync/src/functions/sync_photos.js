import gBase from '../base/google_base.js';
import gPhotos from '../base/google_photos.js';
import nWorker from '../base/notion.js';
import { sleep }  from '../base/utils.js';

const defaultConfig = {
  albums: [
    {
      albumTitle: 'CTCC All',
      target: 'allgallery',
    },
    {
      albumTitle: 'CTCC TM',
      target: 'tmgallery',
    },
    {
      albumTitle: 'CTCC MM',
      target: 'mmgallery',
    },
    {
      albumTitle: 'CTCC EM',
      target: 'emgallery',
    },
    {
      albumTitle: 'CTCC YM',
      target: 'ymgallery',
    },
    {
      albumTitle: 'CTCC CM',
      target: 'cmgallery',
    }
  ],
  pageId: '140ba8467b7a80b4ada4c51047ad9b67'
};

async function syncPhotos(options = {}) {
  const config = { ...defaultConfig, ...options };
  try {
    console.log(`Fetcing albums: ${config.albums.map(n => n.albumTitle)}`);
    const auth = await gBase.authorize();
    const albums = await gPhotos.fetchAlumbs(auth, config.albums);

    console.log(`Updating page: ${config.pageId}`);
    const notion = await nWorker.createNotionClient();
    for (const album of albums) {
      await nWorker.updateAlumb(notion, album, config.pageId);
      await sleep(350); // avoid rate limits
    }
    console.log(`Sync Photos Done`);
  } catch(error) {
    console.error(error);
  }
}

export { syncPhotos }
