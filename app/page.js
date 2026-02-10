'use client'

import { useState, useEffect } from 'react'

export default function NotesApp() {
  const [notes, setNotes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [currentNote, setCurrentNote] = useState({ id: null, title: '', content: '', tags: [] })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('notes')
    if (saved) {
      setNotes(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  const allTags = [...new Set(notes.flatMap(note => note.tags))].sort()

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTag = !selectedTag || note.tags.includes(selectedTag)

    return matchesSearch && matchesTag
  })

  const saveNote = () => {
    if (!currentNote.title.trim()) return

    if (currentNote.id) {
      setNotes(notes.map(n => n.id === currentNote.id ? currentNote : n))
    } else {
      setNotes([...notes, { ...currentNote, id: Date.now() }])
    }

    setShowEditor(false)
    setCurrentNote({ id: null, title: '', content: '', tags: [] })
    setTagInput('')
  }

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id))
  }

  const editNote = (note) => {
    setCurrentNote(note)
    setTagInput(note.tags.join(', '))
    setShowEditor(true)
  }

  const newNote = () => {
    setCurrentNote({ id: null, title: '', content: '', tags: [] })
    setTagInput('')
    setShowEditor(true)
  }

  const addTag = () => {
    const tags = tagInput.split(',').map(t => t.trim()).filter(t => t)
    setCurrentNote({ ...currentNote, tags: [...new Set(tags)] })
  }

  const removeTag = (tag) => {
    setCurrentNote({ ...currentNote, tags: currentNote.tags.filter(t => t !== tag) })
    setTagInput(currentNote.tags.filter(t => t !== tag).join(', '))
  }

  return (
    <div style={styles.container}>
      {!showEditor ? (
        <>
          <div style={styles.header}>
            <h1 style={styles.title}>Notes</h1>
            <button onClick={newNote} style={styles.addButton}>+</button>
          </div>

          <div style={styles.searchBar}>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {allTags.length > 0 && (
            <div style={styles.tagsContainer}>
              <button
                onClick={() => setSelectedTag('')}
                style={{...styles.tagChip, ...(selectedTag === '' ? styles.tagChipActive : {})}}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                  style={{...styles.tagChip, ...(selectedTag === tag ? styles.tagChipActive : {})}}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div style={styles.notesList}>
            {filteredNotes.length === 0 ? (
              <div style={styles.emptyState}>
                {notes.length === 0 ? 'No notes yet. Tap + to create one!' : 'No notes found'}
              </div>
            ) : (
              filteredNotes.map(note => (
                <div key={note.id} style={styles.noteCard}>
                  <div onClick={() => editNote(note)} style={styles.noteContent}>
                    <h3 style={styles.noteTitle}>{note.title}</h3>
                    {note.content && (
                      <p style={styles.notePreview}>{note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}</p>
                    )}
                    {note.tags.length > 0 && (
                      <div style={styles.noteTags}>
                        {note.tags.map(tag => (
                          <span key={tag} style={styles.noteTag}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => deleteNote(note.id)} style={styles.deleteButton}>×</button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div style={styles.editor}>
          <div style={styles.editorHeader}>
            <button onClick={() => {
              setShowEditor(false)
              setCurrentNote({ id: null, title: '', content: '', tags: [] })
              setTagInput('')
            }} style={styles.backButton}>←</button>
            <button onClick={saveNote} style={styles.saveButton}>Save</button>
          </div>

          <input
            type="text"
            placeholder="Title"
            value={currentNote.title}
            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
            style={styles.titleInput}
            autoFocus
          />

          <textarea
            placeholder="Start typing..."
            value={currentNote.content}
            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
            style={styles.contentInput}
          />

          <div style={styles.tagEditor}>
            <input
              type="text"
              placeholder="Add tags (comma-separated)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onBlur={addTag}
              style={styles.tagInput}
            />
            {currentNote.tags.length > 0 && (
              <div style={styles.tagsList}>
                {currentNote.tags.map(tag => (
                  <span key={tag} style={styles.editTag}>
                    {tag}
                    <button onClick={() => removeTag(tag)} style={styles.removeTagButton}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '100%',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
  },
  addButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: '28px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    padding: '15px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxSizing: 'border-box',
  },
  tagsContainer: {
    display: 'flex',
    gap: '8px',
    padding: '15px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
  },
  tagChip: {
    padding: '6px 12px',
    borderRadius: '16px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  tagChipActive: {
    backgroundColor: '#007AFF',
    color: '#fff',
    borderColor: '#007AFF',
  },
  notesList: {
    flex: 1,
    padding: '15px',
    overflowY: 'auto',
  },
  emptyState: {
    textAlign: 'center',
    color: '#999',
    marginTop: '50px',
    fontSize: '16px',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  noteContent: {
    flex: 1,
    cursor: 'pointer',
  },
  noteTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
  },
  notePreview: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.4',
  },
  noteTags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  noteTag: {
    padding: '3px 8px',
    borderRadius: '12px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    fontSize: '12px',
  },
  deleteButton: {
    width: '30px',
    height: '30px',
    border: 'none',
    backgroundColor: '#ff3b30',
    color: '#fff',
    borderRadius: '50%',
    fontSize: '20px',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  editor: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#fff',
  },
  editorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    borderBottom: '1px solid #e0e0e0',
  },
  backButton: {
    fontSize: '24px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: '5px 10px',
  },
  saveButton: {
    padding: '8px 20px',
    backgroundColor: '#007AFF',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  titleInput: {
    padding: '15px 20px',
    fontSize: '24px',
    fontWeight: 'bold',
    border: 'none',
    borderBottom: '1px solid #e0e0e0',
    outline: 'none',
  },
  contentInput: {
    flex: 1,
    padding: '20px',
    fontSize: '16px',
    border: 'none',
    outline: 'none',
    resize: 'none',
    lineHeight: '1.6',
  },
  tagEditor: {
    padding: '15px 20px',
    borderTop: '1px solid #e0e0e0',
  },
  tagInput: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    boxSizing: 'border-box',
  },
  tagsList: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '10px',
  },
  editTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '16px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    fontSize: '14px',
  },
  removeTagButton: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#1976d2',
    fontSize: '18px',
    cursor: 'pointer',
    padding: 0,
    marginLeft: '2px',
  },
}
