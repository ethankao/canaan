
const ALBUMS_URL = 'https://photoslibrary.googleapis.com/v1/sharedAlbums';
const ITEMS_URL = 'https://photoslibrary.googleapis.com/v1/mediaItems:search';

async function fetchAlumbs(auth, albums) {
  const accessToken = await auth.getAccessToken();
  const sharedAlbums = await photoRequest(ALBUMS_URL, accessToken);
  if (sharedAlbums.error) {
    throw sharedAlbums.error;
  }

  const targetAlbums = sharedAlbums.sharedAlbums?.map(n => {
    const config = albums.find(a => a.albumTitle === n.title)
    if (!config) { return null; }

    return { ...config, ...n };
  })
  .filter(n => n !== null);

  const ret = await Promise.all(targetAlbums.map(async album => {
    const body = {
      albumId: album.id,
      pageSize: 50
    };
    const result = await photoRequest(ITEMS_URL, accessToken, body);
    if (result.error) {
      throw result.error;
    }

    const mediaItems = result.mediaItems;

    return { album, mediaItems }
  }));
  return ret;
}

async function photoRequest(url, accessToken, body) {
  const res = await fetch(url, {
    method: body == null ? 'GET' : 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': `Bearer ${accessToken.token}`,
    },
    body: JSON.stringify(body)
  })

  return await res.json();
}

export default {
  fetchAlumbs
}
