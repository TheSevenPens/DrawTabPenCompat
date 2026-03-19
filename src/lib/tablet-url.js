export function slugifyPathSegment(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'tablet';
}

export function buildTabletDetailHref(basePath, tablet) {
  const slugSource = tablet.brand || tablet.name || tablet.id;
  const slug = slugifyPathSegment(slugSource);
  return `${basePath}/tablets/${slug}/${encodeURIComponent(tablet.id)}/`;
}
