'use client';

import { useEffect, useState } from 'react';
import { uploadFiles, listFiles, deleteFile, fileViewUrl, prettySize, fileIcon } from '../apiClient';

// Client-side caps mirror the backend: documents 5MB, photos 10MB.
const DOC_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
]);
const DOC_LIMIT = 5 * 1024 * 1024;
const PHOTO_LIMIT = 10 * 1024 * 1024;

function sizeError(file) {
  const limit = DOC_TYPES.has(file.type) ? DOC_LIMIT : PHOTO_LIMIT;
  if (file.size > limit) {
    const cap = limit === DOC_LIMIT ? '5MB' : '10MB';
    return `${file.name} is over the ${cap} limit (${prettySize(file.size)})`;
  }
  return null;
}

export default function Attachments({ cafeId, pending, onPendingChange }) {
  const [existing, setExisting] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const refresh = async () => {
    if (!cafeId) return;
    try {
      setExisting(await listFiles(cafeId));
    } catch {
      /* list stays as-is on failure (e.g. backend without uploads support) */
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafeId]);

  const handleSelect = async (e) => {
    const picked = [...e.target.files];
    e.target.value = '';
    if (!picked.length) return;
    setMsg('');

    const bad = picked.map(sizeError).find(Boolean);
    if (bad) {
      setMsg(bad);
      return;
    }

    if (!cafeId) {
      onPendingChange([...pending, ...picked]);
      return;
    }
    setBusy(true);
    try {
      await uploadFiles(cafeId, picked);
      refresh();
    } catch (err) {
      setMsg(err.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFile(id);
      setExisting((list) => list.filter((f) => f._id !== id));
    } catch (err) {
      setMsg(err.message || 'Delete failed');
    }
  };

  const removePending = (idx) => {
    onPendingChange(pending.filter((_, i) => i !== idx));
  };

  return (
    <div className="attach-box">
      <div className="attach-head">Photos &amp; Documents</div>

      {!!existing.length && (
        <ul className="attach-list">
          {existing.map((f) => (
            <li key={f._id} className="attach-row">
              <span className="attach-ico">{fileIcon(f.mimetype)}</span>
              <a className="attach-name" href={fileViewUrl(f._id)} target="_blank" rel="noreferrer">
                {f.originalName}
              </a>
              <span className="attach-size">{prettySize(f.size)}</span>
              <button type="button" className="attach-del" onClick={() => handleDelete(f._id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {!!pending.length && (
        <ul className="attach-list">
          {pending.map((f, i) => (
            <li key={`${f.name}-${i}`} className="attach-row pending">
              <span className="attach-ico">{fileIcon(f.type)}</span>
              <span className="attach-name">{f.name} <em>(will upload on save)</em></span>
              <span className="attach-size">{prettySize(f.size)}</span>
              <button type="button" className="attach-del" onClick={() => removePending(i)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="attach-add">
        {busy ? 'Uploading…' : '+ Choose files'}
        <input
          type="file"
          multiple
          hidden
          disabled={busy}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
          onChange={handleSelect}
        />
      </label>
      <p className="attach-hint">Photo max 10MB • PDF / Word / Excel max 5MB.</p>
      {msg && <p className="error">{msg}</p>}
    </div>
  );
}
