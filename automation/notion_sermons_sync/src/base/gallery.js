
function galleryHtml(album) {
  const items = album.mediaItems || [];
  if (items.length === 0) {
    return '';
  }

  const itemTags = items.map(itemHtml);

  const target = album.album.target;
  return `\
  <div class="swiper rounded-box bg-neutral h-96 container max-w-3xl ${target}" id="swiper-${target}">
  <div class="pswp-galler gallery swiper-wrapper" id="${target}">
  ${itemTags.join('')}
  </div>

  <div class="swiper-scrollbar"></div>

  <div class="swiper-button-prev"></div>
  <div class="swiper-button-next"></div>
  </div>`;
}


function itemHtml(item) {
  const width = item.mediaMetadata?.width || 1920;
  const height = item.mediaMetadata?.height || 1080;
  if (item.mimeType?.startsWith('video')) {
    return `\
    <a href="${item.productUrl}"
       data-pswp-src="${item.baseUrl}"
       data-action-type="open"
       data-media-id="${item.id}"
       data-pswp-width="${width}" data-pswp-height="${height}"
       class="swiper-slide"
       target="_blank">
      <img src="${item.baseUrl}" class="mx-auto object-contain h-full" />
    </a>`;
  } else {
    return `\
    <a href="${item.baseUrl}=w${width}-h${height}"
       class="swiper-slide"
       data-media-id="${item.id}"
       data-pswp-width="${width}" data-pswp-height="${height}">
      <img src="${item.baseUrl}" class="mx-auto object-contain h-full" />
    </a>`;
  }
}

export { galleryHtml }
