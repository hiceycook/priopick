import React from 'react';

function DraftResultsModal({ results, rankers, onClose, onExport }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Draft Results</h2>
        {results.map((items, index) => (
          <div key={index}>
            <h3>{rankers[index].email}</h3>
            <ol>
              {items.map((item, itemIndex) => (
                <li key={itemIndex}>{item || 'No item'}</li>
              ))}
            </ol>
          </div>
        ))}
        <button onClick={onClose}>Close</button>
        <button onClick={onExport}>Export to CSV</button>
      </div>
    </div>
  );
}

export default DraftResultsModal;
