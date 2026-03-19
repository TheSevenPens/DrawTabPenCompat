function parseSearchTokens(input) {
  if (!input) return [];

  const tokens = [];
  const regex = /"([^"]+)"|(\S+)/g;
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match[1]) {
      tokens.push(match[1].toLowerCase());
    } else if (match[2]) {
      tokens.push(match[2].toLowerCase());
    }
  }

  return tokens;
}

export function matchesDeviceSearch(item, searchTerm) {
  const tokens = parseSearchTokens(searchTerm);
  if (tokens.length === 0) return true;

  const haystack = [item.id, item.name, item.family]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}