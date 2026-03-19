function slugifyPathSegment(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'pen';
}

export function buildPenDetailHref(basePath, pen) {
  const slugSource = pen.brand || pen.name || pen.id;
  const slug = slugifyPathSegment(slugSource);
  return `${basePath}/pens/${slug}/${encodeURIComponent(pen.id)}/`;
}
