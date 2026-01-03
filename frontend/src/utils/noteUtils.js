// Small helpers to normalize note shapes coming from different backend response formats

export function getNoteId(note) {
  return (
    note?.$id ??
    note?._id ??
    note?.id ??
    note?.noteId ??
    note?.slug ??
    null
  )
}

export function getNoteCreatedAt(note) {
  return note?.$createdAt ?? note?.createdAt ?? note?.created_at ?? null
}

export function getNoteIsPublic(note) {
  if (typeof note?.isPublic === 'boolean') return note.isPublic
  if (typeof note?.public === 'boolean') return note.public
  return false
}

export function getNoteTitle(note) {
  return note?.title ?? note?.name ?? 'Untitled'
}

export function getNoteDescription(note) {
  return note?.description ?? note?.summary ?? ''
}

export function getNoteContent(note) {
  return note?.note ?? note?.content ?? note?.text ?? ''
}

export function normalizeNote(note) {
  if (!note || typeof note !== 'object') return note

  return {
    ...note,
    $id: note.$id ?? getNoteId(note),
    $createdAt: note.$createdAt ?? getNoteCreatedAt(note),
    isPublic: getNoteIsPublic(note),
    title: getNoteTitle(note),
    description: getNoteDescription(note),
    note: typeof note.note === 'string' ? note.note : getNoteContent(note),
  }
}

export function extractNotesFromResult(result) {
  if (!result) return []
  if (Array.isArray(result)) return result
  if (Array.isArray(result.documents)) return result.documents
  if (Array.isArray(result.notes)) return result.notes
  return []
}
