import React, { useId, useMemo, useState } from 'react';
import './TagInput.css';

function normalizeTag(value) {
  return value.trim().replace(/\s+/g, ' ');
}

export default function TagInput({
  label,
  values,
  onChange,
  suggestions = [],
  placeholder = 'Type and press Enter',
  helperText,
  maxItems = 30
}) {
  const listId = useId();
  const [draft, setDraft] = useState('');

  const normalizedValues = useMemo(
    () => values.map((v) => normalizeTag(v)).filter(Boolean),
    [values]
  );

  const suggestionSet = useMemo(() => new Set(suggestions.map((s) => s.toLowerCase())), [suggestions]);

  const addTag = (raw) => {
    const next = normalizeTag(raw);
    if (!next) return;
    if (normalizedValues.map((v) => v.toLowerCase()).includes(next.toLowerCase())) return;
    if (normalizedValues.length >= maxItems) return;

    onChange([...normalizedValues, next]);
    setDraft('');
  };

  const parseAndAddPasted = (text) => {
    const parts = text.split(/[,;\n]/).map((p) => normalizeTag(p)).filter(Boolean);
    const existing = new Set(normalizedValues.map((v) => v.toLowerCase()));
    const toAdd = [];
    for (const p of parts) {
      if (toAdd.length + normalizedValues.length >= maxItems) break;
      if (!existing.has(p.toLowerCase())) {
        toAdd.push(p);
        existing.add(p.toLowerCase());
      }
    }
    if (toAdd.length > 0) {
      onChange([...normalizedValues, ...toAdd]);
    }
    return toAdd;
  };

  const onPaste = (e) => {
    const pasted = e.clipboardData?.getData('text') || '';
    if (!pasted.trim()) return;
    const parts = pasted.split(/[,;\n]/).map((p) => normalizeTag(p)).filter(Boolean);
    if (parts.length > 1) {
      e.preventDefault();
      const added = parseAndAddPasted(pasted);
      setDraft('');
    }
  };

  const removeTag = (idx) => {
    const next = normalizedValues.filter((_, i) => i !== idx);
    onChange(next);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && !draft && normalizedValues.length > 0) {
      removeTag(normalizedValues.length - 1);
    }
  };

  const filteredSuggestions = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 12);
    return suggestions
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 12);
  }, [draft, suggestions]);

  const showSuggestedHint =
    draft.trim().length > 0 &&
    suggestionSet.has(draft.trim().toLowerCase()) &&
    !normalizedValues.map((v) => v.toLowerCase()).includes(draft.trim().toLowerCase());

  return (
    <div className="tag-input">
      <div className="tag-input__header">
        <label className="tag-input__label">{label}</label>
        {helperText ? <div className="tag-input__helper">{helperText}</div> : null}
      </div>

      <div className="tag-input__control">
        {normalizedValues.map((tag, idx) => (
          <span key={`${tag}-${idx}`} className="tag">
            <span className="tag__text">{tag}</span>
            <button
              type="button"
              className="tag__remove"
              aria-label={`Remove ${tag}`}
              onClick={() => removeTag(idx)}
            >
              ×
            </button>
          </span>
        ))}

        <input
          className="tag-input__field"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder={normalizedValues.length === 0 ? placeholder : ''}
          list={listId}
        />
        <datalist id={listId}>
          {filteredSuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      <div className="tag-input__footer">
        <button
          type="button"
          className="tag-input__add"
          onClick={() => addTag(draft)}
          disabled={!draft.trim() || normalizedValues.length >= maxItems}
        >
          Add
        </button>
        {showSuggestedHint ? <span className="tag-input__hint">Press Enter to add</span> : null}
        <span className="tag-input__count">
          {normalizedValues.length}/{maxItems}
        </span>
      </div>
    </div>
  );
}

