// DocumentCategorySelector.js - Category selector component
import React, { useState } from 'react';

const DocumentCategorySelector = ({ 
  categories, 
  currentCategory, 
  onCategoryChange,
  onAddCategory
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAddClick = () => {
    setIsAddingCategory(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleCancel = () => {
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  return (
    <div className="document-category-selector mb-4">
      <div className="d-flex justify-content-between align-items-center">
        <h5>Document Categories</h5>
        {!isAddingCategory && (
          <button 
            className="btn btn-sm btn-outline-primary" 
            onClick={handleAddClick}
          >
            <i className="fas fa-plus"></i> Add Category
          </button>
        )}
      </div>
      
      {isAddingCategory ? (
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <div className="input-group-append">
              <button type="submit" className="btn btn-success">
                Add
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="category-pills mt-2">
          {categories.map(category => (
            <button
              key={category.id || category.name}
              className={`btn btn-sm mr-2 mb-2 ${
                currentCategory === category.name || currentCategory === category.id
                  ? 'btn-primary'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => onCategoryChange(category.name || category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentCategorySelector;