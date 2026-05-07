import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://127.0.0.1:5000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('all');

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const url = activeTab === 'all' ? API_URL : `${API_URL}/trash`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Could not connect to the database. Check your internet or backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (response.ok) {
        setTitle('');
        setContent('');
        setIsAdding(false);
        if (activeTab === 'all') fetchNotes();
        else setActiveTab('all');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to save note');
    }
  };

  const deleteNote = async (id) => {
    if (!id) return;
    try {
      const url = activeTab === 'all' 
        ? `${API_URL}/${id}` 
        : `${API_URL}/${id}/permanent`;
      
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const restoreNote = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/restore`, {
        method: 'PUT',
      });
      if (response.ok) {
        fetchNotes();
      }
    } catch (error) {
      console.error('Error restoring note:', error);
    }
  };

  const handleNavClick = (tab) => {
    if (tab === 'favorites') {
      alert('Favorites coming soon!');
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <div className="brand">
          <h1>SimpleNotes</h1>
          <p>{notes.length} notes {activeTab === 'all' ? '' : 'in trash'}</p>
        </div>
        <nav>
          <button 
            className={`nav-item ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleNavClick('all')}
          >
            All Notes
          </button>
          <button 
            className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => handleNavClick('favorites')}
          >
            Favorites
          </button>
          <button 
            className={`nav-item ${activeTab === 'trash' ? 'active' : ''}`}
            onClick={() => handleNavClick('trash')}
          >
            Trash
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-primary" onClick={() => setIsAdding(true)}>
            + New Note
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="header">
          <h2>{activeTab === 'all' ? 'All Notes' : 'Trash'}</h2>
          <div className="search-bar">
            <input type="text" placeholder="Search notes..." />
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
            <button onClick={fetchNotes}>Retry</button>
          </div>
        )}

        {isAdding && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Create New Note</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Note Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
                <textarea
                  placeholder="Start writing..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="10"
                ></textarea>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your notes...</p>
          </div>
        ) : (
          <div className="note-grid">
            {notes.length === 0 ? (
              <div className="empty-state">
                <p>{activeTab === 'all' ? 'No notes found. Create your first note!' : 'Trash is empty.'}</p>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note._id} className="note-card">
                  <div className="note-header">
                    <h3>{note.title}</h3>
                    <div className="note-actions">
                      {activeTab === 'trash' && (
                        <button className="restore-btn" onClick={() => restoreNote(note._id)}>
                          Restore
                        </button>
                      )}
                      <button className="delete-btn" onClick={() => deleteNote(note._id)}>
                        &times;
                      </button>
                    </div>
                  </div>
                  <p className="note-snippet">{note.content}</p>
                  <span className="note-date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
