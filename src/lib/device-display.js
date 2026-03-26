/**
 * Returns a display name in the format "Name (ID)" when name differs from id,
 * or just "Name" when they are the same.
 */
export function getDisplayName(id, name) {
  if (name && name !== id) return `${name} (${id})`;
  return id;
}
