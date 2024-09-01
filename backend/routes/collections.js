const express = require('express');
const Collection = require('../models/Collection');
const auth = require('../middleware/auth');
const router = express.Router();

// Add this function at the top of the file
function generateAccessCode() {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Apply auth middleware to all routes
router.use(auth);

// Get all collections
router.get('/', async (req, res) => {
	try {
		const collections = await Collection.find({ createdBy: req.userId });
		res.json(collections);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Create a new collection
router.post('/', async (req, res) => {
	const collection = new Collection({
		...req.body,
		createdBy: req.userId
	});

	try {
		const newCollection = await collection.save();
		res.status(201).json(newCollection);
	} catch (error) {
		res.status(400).json({ message: error.message });
	}
});

// Update a collection
router.put('/:id', async (req, res) => {
	try {
		console.log('Received update request for collection:', req.params.id);
		console.log('Request body:', req.body);
		
		const collection = await Collection.findOneAndUpdate(
			{ _id: req.params.id, createdBy: req.userId },
			req.body,
			{ new: true, runValidators: true }
		);
		
		if (!collection) {
			console.log('Collection not found or user not authorized');
			return res.status(404).send({ error: 'Collection not found or user not authorized' });
		}
		
		console.log('Updated collection:', collection);
		res.send(collection);
	} catch (error) {
		console.error('Error updating collection:', error);
		res.status(400).send({ error: error.message });
	}
});

// Delete a collection
router.delete('/:id', async (req, res) => {
	try {
		const collection = await Collection.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });

		if (!collection) {
			return res.status(404).json({ message: 'Collection not found' });
		}

		res.json({ message: 'Collection deleted' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Add a ranker to a collection
router.post('/:id/rankers', async (req, res) => {
	try {
		const { email } = req.body;
		const collection = await Collection.findById(req.params.id);
		
		if (!collection) {
			return res.status(404).json({ message: 'Collection not found' });
		}

		const accessCode = generateAccessCode();
		collection.rankers.push({ email, accessCode, hasSubmitted: false });
		await collection.save();

		// Here you would typically send an email to the ranker with their access link
		// For now, we'll just return the access code
		res.json({ message: 'Ranker added successfully', accessCode });
	} catch (error) {
		res.status(500).json({ message: 'Error adding ranker', error: error.message });
	}
});

// Delete a ranker from a collection
router.delete('/:collectionId/rankers/:rankerId', async (req, res) => {
	try {
		const { collectionId, rankerId } = req.params;
		const collection = await Collection.findById(collectionId);
		
		if (!collection) {
			return res.status(404).json({ message: 'Collection not found' });
		}
		
		collection.rankers = collection.rankers.filter(ranker => ranker._id.toString() !== rankerId);
		await collection.save();
		
		res.json({ message: 'Ranker removed successfully' });
	} catch (error) {
		console.error('Error removing ranker:', error);
		res.status(500).json({ message: 'Error removing ranker', error: error.toString() });
	}
});

module.exports = router;
