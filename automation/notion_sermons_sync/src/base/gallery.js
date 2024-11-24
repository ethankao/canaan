function galleryHtml(album) {
  const items = album.items || [];
  if (items.length === 0) {
    return '';
  }

  const itemTags = items.map(itemHtml);

  const target = album.album.target;
  return `\
  <div class="swiper rounded-box bg-neutral h-96 container max-w-3xl ${target}" id="swiper-${target}">
  <div class="pswp-galler gallery swiper-wrapper" id="${target}" data-album-id="${album.album.id}" >
  ${itemTags.join('')}
  </div>

  <div class="swiper-scrollbar"></div>

  <div class="swiper-button-prev"></div>
  <div class="swiper-button-next"></div>
  </div>`;
}


function itemHtml(item) {
  const width = item.imageMediaMetadata?.width || 1920;
  const height = item.imageMediaMetadata?.height || 1080;
  const previewLink = `https://lh3.googleusercontent.com/d/${item.id}=s1200`
  const largeLink = `https://lh3.googleusercontent.com/d/${item.id}=s${Math.min(width, 2880)}`
  if (item.mimeType?.startsWith('video')) {
    return `\
    <a href="${item.webViewLink}"
       data-pswp-src="${largeLink}"
       data-action-type="open"
       data-media-id="${item.id}"
       data-pswp-width="${width}" data-pswp-height="${height}"
       class="swiper-slide"
       target="_blank">
      <img src="${previewLink}" class="mx-auto object-contain h-full" />
    </a>\n`;
  } else {
    return `\
    <a href="${largeLink}"
       class="swiper-slide"
       data-media-id="${item.id}"
       data-pswp-width="${width}" data-pswp-height="${height}">
      <img src="${previewLink}" class="mx-auto object-contain h-full" />
    </a>\n`;
  }
}

export { galleryHtml }
