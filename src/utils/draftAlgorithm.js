export function snakeDraft(items, desired, acquired) {
  const itemsCopy = [...items];
  const acquiredCopy = acquired.map(list => [...list]);

  for (let i = 0; i < desired[0].length; i++) {
    // Determine which person is drafting in this turn
    let personIndex;
    if (i % 2 === 0) {
      personIndex = i % desired.length; // First, third, fifth, etc. turns
    } else {
      personIndex = desired.length - 1 - (i % desired.length); // Second, fourth, sixth, etc. turns
    }

    // Determine the highest available item on this person's desired list
    let item;
    for (let j = 0; j < desired[personIndex].length; j++) {
      if (itemsCopy.includes(desired[personIndex][j])) {
        item = desired[personIndex][j];
        break;
      }
    }

    // Add the acquired item to the person's acquired list and remove it from the list of available items
    if (item) {
      acquiredCopy[personIndex].push(item);
      itemsCopy.splice(itemsCopy.indexOf(item), 1);
    }
  }

  // Ensure each person has an equal number of items
  const minLen = Math.min(...acquiredCopy.map(list => list.length));
  acquiredCopy.forEach(list => {
    while (list.length < minLen) {
      list.push('');
    }
  });

  return acquiredCopy;
}
