import React, { useState, useEffect } from 'react';
import { getCollections, createCollection, updateCollection, deleteCollection, addRanker } from '../utils/api';
import api from '../utils/api';
import './AdminPanel.css';
import RankerListModal from './RankerListModal';
import { snakeDraft, draftResultsToCSV } from '../utils/draftAlgorithm';
import DraftResultsModal from './DraftResultsModal';

function AdminPanel({ user, onLogout }) {
  const [collections, setCollections] = useState([]);
  const [currentCollectionId, setCurrentCollectionId] = useState(null);
  const [collectionName, setCollectionName] = useState('');
  const [itemName, setItemName] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [error, setError] = useState('');
  const [rankerEmail, setRankerEmail] = useState('');
  const [selectedRanker, setSelectedRanker] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [draftResults, setDraftResults] = useState(null);
  const [showDraftModal, setShowDraftModal] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await api.get('/collections');
      console.log('Fetched collections:', response.data);
      setCollections(response.data);
      if (response.data.length > 0 && !currentCollectionId) {
        setCurrentCollectionId(response.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to fetch collections: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    try {
      const response = await createCollection({ name: collectionName });
      console.log('Created collection:', response.data);
      setCollections(prev => {
        const newCollections = [...prev, response.data];
        console.log('Updated collections after creation:', newCollections);
        return newCollections;
      });
      setCollectionName('');
      setCurrentCollectionId(response.data._id);
    } catch (err) {
      console.error('Error creating collection:', err);
      setError('Failed to create collection');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const currentCollection = collections.find(c => c._id === currentCollectionId);
      if (!currentCollection) {
        console.error('Current collection not found');
        return;
      }
      const updatedItems = [...currentCollection.items, { name: itemName }];
      const response = await updateCollection(currentCollectionId, { items: updatedItems });
      const updatedCollection = response.data;
      console.log('Added item:', updatedCollection);
      setCollections(prev => {
        const newCollections = prev.map(c => c._id === currentCollectionId ? updatedCollection : c);
        console.log('Updated collections after adding item:', newCollections);
        return newCollections;
      });
      setItemName('');
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const currentCollection = collections.find(c => c._id === currentCollectionId);
      if (!currentCollection) {
        console.error('Current collection not found');
        return;
      }
      const updatedItems = currentCollection.items.filter(item => item._id !== itemId);
      const response = await updateCollection(currentCollectionId, { items: updatedItems });
      const updatedCollection = response.data;
      console.log('Deleted item:', itemId, 'Updated collection:', updatedCollection);
      setCollections(prev => {
        const newCollections = prev.map(c => c._id === currentCollectionId ? updatedCollection : c);
        console.log('Updated collections after deleting item:', newCollections);
        return newCollections;
      });
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  const handleEditItem = (item) => {
    setEditingItemId(item._id);
    setItemName(item.name);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const currentCollection = collections.find(c => c._id === currentCollectionId);
      if (!currentCollection) {
        console.error('Current collection not found');
        return;
      }
      const updatedItems = currentCollection.items.map(item => 
        item._id === editingItemId ? { ...item, name: itemName } : item
      );
      const response = await updateCollection(currentCollectionId, { items: updatedItems });
      const updatedCollection = response.data;
      console.log('Updated item:', editingItemId, 'Updated collection:', updatedCollection);
      setCollections(prev => {
        const newCollections = prev.map(c => c._id === currentCollectionId ? updatedCollection : c);
        console.log('Updated collections after updating item:', newCollections);
        return newCollections;
      });
      setEditingItemId(null);
      setItemName('');
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item');
    }
  };

  const handleAddRanker = async (e) => {
    e.preventDefault();
    try {
      const response = await addRanker(currentCollectionId, rankerEmail);
      console.log('New ranker access code:', response.data.accessCode);
      alert(`Ranker added successfully. Access code: ${response.data.accessCode}`);
      setRankerEmail('');
      // Optionally, refresh the collection to show the new ranker
      fetchCollections();
    } catch (error) {
      setError('Failed to add ranker: ' + error.message);
    }
  };

  const handleRemoveRanker = async (rankerId) => {
    if (!currentCollectionId) {
      setError('No collection selected');
      return;
    }
    try {
      await api.delete(`/collections/${currentCollectionId}/rankers/${rankerId}`);
      console.log('Ranker removed successfully');
      fetchCollections(); // Refresh the collections after removing a ranker
    } catch (err) {
      console.error('Error removing ranker:', err);
      setError('Failed to remove ranker: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewRankerList = (ranker) => {
    // Ensure the ranker object includes the full collection data
    const rankerWithCollection = {
      ...ranker,
      collection: currentCollection
    };
    console.log('Ranker data being passed to modal:', rankerWithCollection);
    setSelectedRanker(rankerWithCollection);
    setShowModal(true);
  };

  const currentCollection = collections.find(c => c._id === currentCollectionId);

  const handleDraft = () => {
    if (!currentCollection) return;

    const items = currentCollection.items.map(item => item.name);
    const desired = currentCollection.rankers.map(ranker => 
      ranker.rankings.map(itemId => {
        const item = currentCollection.items.find(i => i._id === itemId);
        return item ? item.name : null;
      }).filter(Boolean)
    );
    const acquired = currentCollection.rankers.map(() => []);

    const result = snakeDraft(items, desired, acquired);

    console.log('Draft result:', result);
    setDraftResults(result);
    setShowDraftModal(true);
    // TODO: Update the backend with the draft results
  };

  const handleExportDraft = () => {
    if (!draftResults || !currentCollection) return;

    const csvContent = draftResultsToCSV(draftResults, currentCollection.rankers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `draft_results_${currentCollection.name}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const canRunDraft = () => {
    if (!currentCollection) return false;
    if (currentCollection.rankers.length === 0) return false;
    return currentCollection.rankers.every(ranker => ranker.hasSubmitted);
  };

  console.log('Rendering AdminPanel with:', { collections, currentCollectionId, currentCollection, user });

  return (
    <div className="admin-panel">
      <div className="header">
        <h2>Welcome, {user?.username || 'User'}!</h2>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="collection-form">
        <h3>Create New Collection</h3>
        <form onSubmit={handleCreateCollection}>
          <input
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="Collection name"
            required
          />
          <button type="submit">Create Collection</button>
        </form>
      </div>
      <div className="collections-tabs">
        {collections.map((collection) => (
          <button
            key={`collection-${collection._id}`}
            className={`tab ${currentCollectionId === collection._id ? 'active' : ''}`}
            onClick={() => setCurrentCollectionId(collection._id)}
          >
            {collection.name}
          </button>
        ))}
      </div>
      {currentCollection && (
        <div className="current-collection">
          <h3>{currentCollection.name}</h3>
          <form onSubmit={editingItemId ? handleUpdateItem : handleAddItem} className="item-form">
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={editingItemId ? "Edit item name" : "New item name"}
              required
            />
            <button type="submit">{editingItemId ? "Update Item" : "Add Item"}</button>
            {editingItemId && (
              <button type="button" onClick={() => {
                setEditingItemId(null);
                setItemName('');
              }}>Cancel Edit</button>
            )}
          </form>
          <ul className="items-list">
            {currentCollection.items && currentCollection.items.length > 0 ? (
              currentCollection.items.map((item) => (
                <li key={`item-${item._id}`} className="item">
                  <span>{item.name}</span>
                  <div className="item-actions">
                    <button onClick={() => handleDeleteItem(item._id)} className="delete-btn">Delete</button>
                    <button onClick={() => handleEditItem(item)} className="edit-btn">Edit</button>
                  </div>
                </li>
              ))
            ) : (
              <li>No items in this collection</li>
            )}
          </ul>
          <div className="add-ranker-form">
            <h4>Add Ranker</h4>
            <form onSubmit={handleAddRanker}>
              <input
                type="email"
                value={rankerEmail}
                onChange={(e) => setRankerEmail(e.target.value)}
                placeholder="Ranker's email"
                required
              />
              <button type="submit">Add Ranker</button>
            </form>
          </div>
          {currentCollection.rankers && currentCollection.rankers.length > 0 && (
            <div>
              <h4>Rankers</h4>
              <ul>
                {currentCollection.rankers.map((ranker) => (
                  <li key={ranker._id}>
                    {ranker.email} - {ranker.hasSubmitted ? 'Submitted' : 'Pending'}
                    {!ranker.hasSubmitted && (
                      <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/rank/${ranker.accessCode}`)}>
                        Copy Link
                      </button>
                    )}
                    <button onClick={() => handleRemoveRanker(ranker._id)}>Remove</button>
                    <button onClick={() => handleViewRankerList(ranker)}>View List</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {showModal && (
        <RankerListModal
          ranker={selectedRanker}
          onClose={() => setShowModal(false)}
        />
      )}
      {showDraftModal && draftResults && (
        <DraftResultsModal
          results={draftResults}
          rankers={currentCollection.rankers}
          onClose={() => setShowDraftModal(false)}
          onExport={handleExportDraft}
        />
      )}
      <button 
        onClick={handleDraft} 
        disabled={!canRunDraft()}
        title={!canRunDraft() ? "Cannot run draft: No rankers or unsubmitted rankings" : "Run Draft"}
      >
        Run Draft
      </button>
      {!canRunDraft() && (
        <p style={{color: 'red'}}>
          {currentCollection && currentCollection.rankers.length === 0 
            ? "No rankers available" 
            : "Some rankers haven't submitted their rankings"}
        </p>
      )}
    </div>
  );
}

export default AdminPanel;