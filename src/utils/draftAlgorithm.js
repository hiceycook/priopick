export function snakeDraft(items, desired, acquired) {
  const numRankers = desired.length;
  const rounds = Math.ceil(items.length / numRankers);

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < numRankers; i++) {
      const rankerIndex = round % 2 === 0 ? i : numRankers - 1 - i;
      
      // Find the highest-ranked available item for this ranker
      let selectedItem = null;
      for (const item of desired[rankerIndex]) {
        if (items.includes(item)) {
          selectedItem = item;
          break;
        }
      }

      if (selectedItem) {
        acquired[rankerIndex].push(selectedItem);
        items.splice(items.indexOf(selectedItem), 1);
      }

      // If all items have been distributed, end the draft
      if (items.length === 0) {
        return acquired;
      }
    }
  }

  return acquired;
}

export function draftResultsToCSV(results, rankers) {
  // Find the maximum number of items any ranker has
  const maxItems = Math.max(...results.map(rankerResults => rankerResults.length));

  // Create headers
  const headers = ['Rank', ...rankers.map(r => r.email)];

  // Create rows
  const rows = [];
  for (let i = 0; i < maxItems; i++) {
    const row = [i + 1]; // Rank
    for (let j = 0; j < results.length; j++) {
      row.push(results[j][i] || ''); // Item for each ranker, or empty string if no item
    }
    rows.push(row.join(','));
  }

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows].join('\n');
  
  return csvContent;
}
