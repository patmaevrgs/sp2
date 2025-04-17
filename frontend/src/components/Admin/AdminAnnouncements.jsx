import React, { useState, useEffect } from 'react';

function AdminAnnouncements() {
  const [content, setContent] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3002/announcements');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAnnouncements(data.reverse()); // show latest first
      } else {
        console.warn("Unexpected response format:", data);
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async () => {
    const postedBy = localStorage.getItem("user");
    if (!content.trim()) return;
    if (!postedBy) {
      alert("You must be logged in to post.");
      return;
    }

    const url = editingId
      ? `http://localhost:3002/announcements/${editingId}`
      : 'http://localhost:3002/announcements';

    const method = editingId ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          content,
          postedBy,
          images: [],
          files: [],
          links: [],
        }),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        console.error('Error saving announcement:', errorMsg);
        return;
      }

      setContent('');
      setEditingId(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3002/announcements/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchAnnouncements();
      } else {
        console.error('Error deleting announcement:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const startEdit = (announcement) => {
    setContent(announcement.content);
    setEditingId(announcement._id);
  };

  return (
    <div className="adminhome-container">
      <div className="adminhome-main">
        <h2>{editingId ? 'Edit Announcement' : 'Post Announcement'}</h2>
        <textarea
          rows="4"
          style={{ width: '100%', marginBottom: '10px' }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something..."
        />
        <button onClick={handlePost} disabled={!content.trim()}>
          {editingId ? 'Save Changes' : 'Post'}
        </button>
        {editingId && (
          <button
            onClick={() => {
              setContent('');
              setEditingId(null);
            }}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        )}

        <h3 style={{ marginTop: '30px' }}>All Announcements</h3>
        {loading ? (
          <p>Loading announcements...</p>
        ) : (
          <ul>
            {announcements.length > 0 ? (
              announcements.map((a) => (
                <li key={a._id}>
                  <p><strong>Brgy Maahas Update</strong></p>
                  <p>{a.content}</p>
                  <p style={{ fontSize: '12px', color: '#555' }}>
                    {new Date(a.postedAt).toLocaleString()}
                    {a.editedAt && (
                      <span> (edited: {new Date(a.editedAt).toLocaleString()})</span>
                    )}
                  </p>
                  <button onClick={() => handleDelete(a._id)}>Delete</button>
                  <button onClick={() => startEdit(a)} style={{ marginLeft: '10px' }}>
                    Edit
                  </button>
                  <hr />
                </li>
              ))
            ) : (
              <p>No announcements available.</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default AdminAnnouncements;
