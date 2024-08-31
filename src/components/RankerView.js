import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import './RankerView.css'; // Make sure to create this CSS file

function RankerView() {
  const { accessCode } = useParams();
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    fetchCollection();
  }, [accessCode]);

  useEffect(() => {
    console.log('Items state updated:', items);
  }, [items]);

  const fetchCollection = async () => {
    try {
      const response = await api.get(`/rankers/${accessCode}`);
      setCollection(response.data);
      setItems(response.data.items.map((item, index) => ({
        ...item,
        id: `item-${index}`,
        rank: index + 1
      })));
      setSubmitted(response.data.hasSubmitted);
      console.log('Fetched items:', response.data.items);
    } catch (error) {
      console.error('Error fetching collection:', error);
      setError('Failed to fetch collection');
    }
  };

  const onDragStart = (index) => {
    setDraggedIndex(index);
  };

  const onDragEnter = (index) => {
    if (draggedIndex === null) return;
    if (draggedIndex === index) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setItems(newItems);
    setDraggedIndex(index);
  };

  const onDragEnd = async () => {
    const updatedItems = items.map((item, index) => ({ ...item, rank: index + 1 }));
    setItems(updatedItems);
    setDraggedIndex(null);
    console.log('Updated items after drag:', updatedItems);
    
    try {
      await updateRankings(updatedItems);
      console.log('Rankings updated on the server');
    } catch (error) {
      console.error('Error updating rankings:', error);
      setError('Failed to update rankings. Changes are only saved locally.');
    }
  };

  const updateRankings = async (updatedItems) => {
    const rankings = updatedItems.map(item => ({ id: item._id, rank: item.rank }));
    console.log('Sending update request with data:', rankings);
    try {
      const response = await api.put(`/rankers/${accessCode}/update`, { rankings });
      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Server error:', error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/rankers/${accessCode}/submit`, { rankings: items.map(item => item._id) });
      setSubmitted(true);
      alert('Rankings submitted successfully');
    } catch (error) {
      console.error('Error submitting rankings:', error);
      setError('Failed to submit rankings');
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!collection) return <div>Loading...</div>;

  return (
    <div className="ranker-view">
      <h2>{collection.collectionName}</h2>
      {submitted ? (
        <p>Thank you for submitting your rankings!</p>
      ) : (
        <>
          <p>Drag and drop the items to rank them:</p>
          <ul className="ranker-list">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="ranker-item"
                draggable
                onDragStart={() => onDragStart(index)}
                onDragEnter={() => onDragEnter(index)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={onDragEnd}
                style={{
                  backgroundColor: draggedIndex === index ? '#2E4A5E' : '#456C86',
                }}
              >
                {item.rank}. {item.name}
              </li>
            ))}
          </ul>
          <button onClick={handleSubmit} className="submit-button">
            Submit Rankings
          </button>
        </>
      )}
    </div>
  );
}

export default RankerView;