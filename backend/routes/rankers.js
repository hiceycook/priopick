const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');

// Get collection for ranker
router.get('/:accessCode', async (req, res) => {
  console.log('Ranker route hit with accessCode:', req.params.accessCode);
  try {
    const { accessCode } = req.params;
    const collection = await Collection.findOne({ 'rankers.accessCode': accessCode });

    console.log('Collection found:', collection ? 'Yes' : 'No');

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const ranker = collection.rankers.find(r => r.accessCode === accessCode);

    console.log('Ranker found:', ranker ? 'Yes' : 'No');

    if (!ranker) {
      return res.status(404).json({ message: 'Ranker not found' });
    }

    // Sort items by rank before sending
    const sortedItems = collection.items.sort((a, b) => a.rank - b.rank);

    res.json({
      collectionId: collection._id,
      collectionName: collection.name,
      items: sortedItems,
      hasSubmitted: ranker.hasSubmitted
    });
  } catch (error) {
    console.error('Error in ranker route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit rankings
router.post('/:accessCode/submit', async (req, res) => {
  try {
    const { accessCode } = req.params;
    const { rankings } = req.body;

    const collection = await Collection.findOne({ 'rankers.accessCode': accessCode });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    const rankerIndex = collection.rankers.findIndex(r => r.accessCode === accessCode);

    if (rankerIndex === -1) {
      return res.status(404).json({ message: 'Ranker not found' });
    }

    collection.rankers[rankerIndex].rankings = rankings;
    collection.rankers[rankerIndex].hasSubmitted = true;
    await collection.save();

    res.json({ message: 'Rankings submitted successfully' });
  } catch (error) {
    console.error('Error submitting rankings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:accessCode/update', async (req, res) => {
  try {
    const { accessCode } = req.params;
    const { rankings } = req.body;
    console.log('Received update request for access code:', accessCode);
    console.log('Rankings data:', rankings);

    const collection = await Collection.findOne({ 'rankers.accessCode': accessCode });

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Update the items array with new rankings
    collection.items = collection.items.map(item => {
      const ranking = rankings.find(r => r.id === item._id.toString());
      if (ranking) {
        item.rank = ranking.rank;
      }
      return item;
    });

    // Sort the items array based on the new rankings
    collection.items.sort((a, b) => a.rank - b.rank);

    console.log('Updated collection items:', collection.items);

    // Save the updated collection
    await collection.save();

    console.log('Collection saved successfully');

    res.json({ message: 'Rankings updated successfully', updatedItems: collection.items });
  } catch (error) {
    console.error('Error updating rankings:', error);
    res.status(500).json({ error: 'Failed to update rankings' });
  }
});

module.exports = router;