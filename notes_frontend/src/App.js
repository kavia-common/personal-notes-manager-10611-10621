import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import './theme.css';
import { Modal, Button, Spinner, ErrorMsg } from './components/UI';
import {
  login,
  register,
  logout,
  fetchNotes,
  fetchNote,
  createNote,
  updateNote,
  deleteNote,
  getProfile,
  updateProfile,
} from './api';

// Layout: Header, Sidebar, Main
function App() {
  // App-wide state
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [userProfile, setUserProfile] = useState(null);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const [sidebarSearch, setSidebarSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Modals
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editNoteInitial, setEditNoteInitial] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Theme
  const [theme, setTheme] = useState('light');
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // App Init: fetch profile
  useEffect(() => {
    if (token) {
      getProfile(token)
        .then(setUserProfile)
        .catch(() => { setUserProfile(null); setToken(null); localStorage.removeItem('token'); });
    }
  }, [token]);

  // Fetch notes on login or search
  const refreshNotes = useCallback(() => {
    if (token) {
      setNotesLoading(true);
      setNotesError(null);
      fetchNotes(token, { search: sidebarSearch })
        .then(data => setNotes(data.results))
        .catch(e => setNotesError(e.message))
        .finally(() => setNotesLoading(false));
    }
  }, [token, sidebarSearch]);
  useEffect(() => { if (token) refreshNotes(); }, [token, sidebarSearch, refreshNotes]);

  // HANDLERS

  // Authentication
  function handleLogin({ username, password }) {
    login(username, password)
      .then(res => {
        setToken(res.token);
        localStorage.setItem('token', res.token);
        setShowLogin(false);
      }).catch(() => setNotesError("Login failed - check credentials"));
  }
  function handleRegister({ username, password }) {
    register(username, password)
      .then(res => {
        setToken(res.token);
        localStorage.setItem('token', res.token);
        setShowRegister(false);
      }).catch(() => setNotesError("Registration failed - try a different username"));
  }
  function handleLogout() {
    logout(token)
      .catch(() => { /* ignore backend error on logout */ })
      .finally(() => {
        setToken(null);
        setUserProfile(null);
        localStorage.removeItem('token');
        setSelectedNoteId(null);
      });
  }

  // Notes CRUD
  function handleNoteSelect(id) {
    setSelectedNoteId(id);
  }
  function handleCreateNote() {
    setEditNoteInitial(null);
    setShowNoteEditor(true);
  }
  function handleEditNote(note) {
    setEditNoteInitial(note);
    setShowNoteEditor(true);
  }
  function handleDeleteNoteConfirmed() {
    deleteNote(token, selectedNoteId)
      .then(() => {
        setShowDeleteModal(false);
        setSelectedNoteId(null);
        refreshNotes();
      })
      .catch(() => setNotesError('Failed to delete note'));
  }

  // UI: derived
  const selectedNote = notes.find(x => x.id === selectedNoteId);

  // Layout
  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Header */}
      <header className="header">
        <span className="header-title" style={{ cursor: 'pointer' }} onClick={() => setSelectedNoteId(null)}>
          NotesApp
        </span>
        <nav className="header-nav" style={{ display: 'flex', alignItems: 'center' }}>
          {token ? (
            <>
              <Button onClick={handleLogout}>Logout</Button>
              <Button onClick={() => setShowProfile(true)}>Profile</Button>
              <Button onClick={toggleTheme}>{theme === 'light' ? '🌙 Dark' : '☀️ Light'}</Button>
            </>
          ) : (
            <>
              <Button onClick={() => setShowLogin(true)}>Login</Button>
              <Button onClick={() => setShowRegister(true)}>Register</Button>
              <Button onClick={toggleTheme}>{theme === 'light' ? '🌙 Dark' : '☀️ Light'}</Button>
            </>
          )}
        </nav>
      </header>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        {token && sidebarOpen &&
        <aside className="sidebar">
          <div className="sidebar-title">Your Notes</div>
          <input
            type="search"
            value={sidebarSearch}
            onChange={e => setSidebarSearch(e.target.value)}
            className="styled-input"
            placeholder="Search notes"
            aria-label="Search notes"
          />
          <Button style={{width:'100%',marginBottom:'0.8rem'}} onClick={handleCreateNote}>+ New Note</Button>
          <div className="note-list">
            {notesLoading ? <Spinner /> :
              notes.length === 0 ? <div style={{color:'#aaa',padding:'0.6rem'}}>No notes found.</div> :
                notes.map(note => (
                  <div
                    key={note.id}
                    className={"note-item" + (note.id === selectedNoteId ? " selected" : "")}
                    onClick={() => handleNoteSelect(note.id)}
                  >
                    <div className="note-title">{note.title}</div>
                    <div className="note-snippet">{(note.content || '').substring(0, 48) + (note.content && note.content.length > 48 ? '…' : '')}</div>
                  </div>
                ))
            }
          </div>
        </aside>
        }
        {/* Main content */}
        <main className="app-main">
          {!token &&
            <div style={{marginTop:'2.5rem',textAlign:'center'}}>
              <h2>Welcome to NotesApp</h2>
              <p style={{color:'#555'}}>Sign in or register to write and manage your personal notes.</p>
              <Button style={{minWidth:'130px'}} onClick={() => setShowLogin(true)}>Login</Button>
              <Button style={{minWidth:'140px'}} onClick={() => setShowRegister(true)}>Register</Button>
            </div>
          }
          {notesError && <ErrorMsg message={notesError} />}
          {token && !selectedNoteId &&
            <div style={{marginTop:'3.1rem',textAlign:'center',color:'#767'}}>
              <h2 style={{color:'var(--color-primary)'}}>Select or create a note</h2>
              <div>Your notes appear on the left.<br />Click a note to view, or create a new note.</div>
            </div>
          }
          {token && selectedNoteId && selectedNote &&
            <NoteViewer
              note={selectedNote}
              onEdit={() => handleEditNote(selectedNote)}
              onDelete={() => setShowDeleteModal(true)}
            />
          }
        </main>
      </div>
      {/* UI Modals */}
      <Modal open={showLogin} title="Login" onClose={()=>setShowLogin(false)}>
        <AuthForm mode="login" onSubmit={handleLogin} />
      </Modal>
      <Modal open={showRegister} title="Register" onClose={()=>setShowRegister(false)}>
        <AuthForm mode="register" onSubmit={handleRegister} />
      </Modal>
      <Modal open={showProfile} title="Your Profile" onClose={()=>setShowProfile(false)} wide>
        <ProfileForm token={token} profile={userProfile} onUpdate={user => { setUserProfile(user); setShowProfile(false); }} />
      </Modal>
      <Modal open={showNoteEditor} title={editNoteInitial?'Edit Note':'New Note'} onClose={()=>setShowNoteEditor(false)} wide>
        <NoteEditor
          token={token}
          note={editNoteInitial}
          onSave={(note) => {
            setShowNoteEditor(false);
            setSelectedNoteId(note.id);
            refreshNotes();
          }}
        />
      </Modal>
      <Modal open={showDeleteModal} title="Delete Note" onClose={()=>setShowDeleteModal(false)}>
        <div style={{padding:'1.2rem',textAlign:'center'}}>
          <div style={{marginBottom:'0.74rem'}}>Are you sure you want to delete this note?</div>
          <Button className="accent" onClick={handleDeleteNoteConfirmed}>Yes, Delete</Button>
          <Button onClick={()=>setShowDeleteModal(false)} style={{marginLeft:'1.5rem'}}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}

// PUBLIC_INTERFACE
function NoteViewer({ note, onEdit, onDelete }) {
  // Minimal markdown support
  function mkToLines(s) {
    if (!s) return [];
    return s.split('\n').map((line, idx) => <div key={idx}>{line}</div>);
  }
  return (
    <div className="note-details">
      <div className="note-meta">Created: {new Date(note.created_at).toLocaleString()}</div>
      <div className="note-meta">Updated: {new Date(note.updated_at).toLocaleString()}</div>
      <h2 style={{marginTop:'0.6rem'}}>{note.title}</h2>
      <div style={{margin:'1.1rem 0',fontSize:'1.14rem'}}>{mkToLines(note.content)}</div>
      <div style={{marginTop:'2rem'}}>
        <Button className="accent" onClick={onEdit}>Edit</Button>
        <Button style={{marginLeft:'0.9rem'}} onClick={onDelete}>Delete</Button>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function AuthForm({ mode, onSubmit }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);

  function handleSubmit(evt) {
    evt.preventDefault();
    setPending(true);
    onSubmit({ username, password });
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="input-label">
        Username
        <input className="styled-input" autoFocus type="text" required value={username} disabled={pending}
          autoComplete="username" onChange={e=>setUsername(e.target.value)}/>
      </label>
      <label className="input-label">
        Password
        <input className="styled-input" type="password" required value={password} disabled={pending}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          onChange={e=>setPassword(e.target.value)}/>
      </label>
      <Button type="submit" disabled={pending}>{pending ? <Spinner/> : mode === "login" ? "Login" : "Register"}</Button>
    </form>
  );
}

// PUBLIC_INTERFACE
function NoteEditor({ token, note, onSave }) {
  const [title, setTitle] = useState(note ? note.title : '');
  const [content, setContent] = useState(note ? note.content : '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(evt) {
    evt.preventDefault();
    setPending(true);
    setError('');
    const saveFunc = note
      ? updateNote(token, note.id, { title, content })
      : createNote(token, { title, content });
    Promise.resolve(saveFunc)
      .then(onSave)
      .catch(e => setError(e.message || "Failed to save"))
      .finally(() => setPending(false));
  }

  return (
    <form onSubmit={handleSubmit} style={{width:'100%'}}>
      {error && <ErrorMsg message={error} />}
      <label className="input-label">
        Title
        <input className="styled-input" type="text"
          value={title} onChange={e => setTitle(e.target.value)}
          required maxLength={255} minLength={1} />
      </label>
      <label className="input-label">
        Content
        <textarea className="styled-input" value={content} rows={7} style={{resize:"vertical"}}
          onChange={e => setContent(e.target.value)} />
      </label>
      <Button type="submit" disabled={pending}>{pending ? <Spinner /> : (note ? "Update Note" : "Create Note")}</Button>
    </form>
  );
}

// PUBLIC_INTERFACE
function ProfileForm({ token, profile, onUpdate }) {
  const [form, setForm] = useState(profile || {});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  useEffect(() => { setForm(profile || {}); }, [profile]);
  function onChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }
  function handleSubmit(evt) {
    evt.preventDefault();
    setPending(true);
    setError('');
    updateProfile(token, form)
      .then(onUpdate)
      .catch(e => setError("Failed to update profile"))
      .finally(() => setPending(false));
  }
  return (
    <form className="profile-form" onSubmit={handleSubmit} style={{ maxWidth: 450 }}>
      {error && <ErrorMsg message={error} />}
      <div className="form-group">
        <label className="input-label">Username
          <input className="styled-input" name="username" type="text" value={form.username||''} onChange={onChange} disabled={pending}/>
        </label>
      </div>
      <div className="form-group">
        <label className="input-label">Email
          <input className="styled-input" name="email" type="email" value={form.email||''} onChange={onChange} disabled={pending}/>
        </label>
      </div>
      <Button type="submit" disabled={pending}>Update</Button>
    </form>
  );
}

export default App;
