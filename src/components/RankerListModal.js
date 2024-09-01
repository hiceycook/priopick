import React from 'react';

function RankerListModal({ ranker, onClose }) {
  console.log('Ranker data in modal:', ranker);

  if (!ranker) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{ranker.email}'s List</h2>
        {ranker.rankings && ranker.rankings.length > 0 ? (
          <ol>
            {ranker.rankings.map((itemId, index) => {
              // Find the corresponding item in the collection's items array
              const item = ranker.collection.items.find(i => i._id === itemId);
              return (
                <li key={itemId || index}>
                  {item ? item.name : 'Unknown Item'}
                </li>
              );
            })}
          </ol>
        ) : (
          <p>This ranker hasn't submitted their list yet.</p>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default RankerListModal;
