import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const BUCKET = 'photobooth-prints'

// Validate that a string is a UUID — prevents path traversal in storage keys
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isValidUUID(str) {
  return typeof str === 'string' && UUID_RE.test(str)
}

export function useSupabaseStorage() {
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [error,     setError]     = useState(null)

  // Convert base64 data URL → Blob (safe: only processes data: URIs)
  const dataUrlToBlob = (dataUrl) => {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      throw new Error('Invalid data URL')
    }
    const [header, data] = dataUrl.split(',')
    const mimeMatch = header.match(/:(.*?);/)
    if (!mimeMatch) throw new Error('Cannot parse MIME type from data URL')
    const mime = mimeMatch[1]
    // Only allow image types
    if (!mime.startsWith('image/')) throw new Error('Only image data URLs are allowed')
    const binary = atob(data)
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i)
    }
    return new Blob([array], { type: mime })
  }

  const uploadPrint = useCallback(async (dataUrl, userId, metadata = {}) => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      const blob = dataUrlToBlob(dataUrl)

      // Validate userId to prevent path traversal — fall back to 'anon' if not a UUID
      const safeUserId = isValidUUID(userId) ? userId : 'anon'
      const timestamp  = Date.now()
      const fileName   = `${safeUserId}/${timestamp}.jpg`

      setProgress(30)

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadError) throw uploadError

      setProgress(70)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName)

      // Save record to database
      const { error: dbError } = await supabase
        .from('prints')
        .insert({
          user_id:      userId || null,
          storage_path: fileName,
          public_url:   publicUrl,
          template:     metadata.template || 'dual-strip-3',
          layout:       metadata.layout   || 'dual-strip-3',
          color:        metadata.color    || 'white',
          filter:       metadata.filter   || 'none',
          created_at:   new Date().toISOString(),
        })

      // Surface DB errors — upload succeeded but gallery save failed
      if (dbError) {
        console.error('[lumi] DB insert error:', dbError.message)
        setError(`Photo saved but gallery sync failed: ${dbError.message}`)
      }

      setProgress(100)
      setUploading(false)

      return { publicUrl, path: fileName }
    } catch (err) {
      console.error('[lumi] Upload error:', err)
      setError(err.message)
      setUploading(false)
      return null
    }
  }, [])

  const fetchUserPrints = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('prints')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (err) {
      console.error('[lumi] Fetch prints error:', err)
      return { data: [], error: err.message }
    }
  }, [])

  const deletePrint = useCallback(async (printId, storagePath) => {
    try {
      // Delete storage first — if it fails, keep the DB record (no orphan DB entry)
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([storagePath])

      if (storageError) {
        console.error('[lumi] Storage delete error:', storageError.message)
        throw new Error(`Storage delete failed: ${storageError.message}`)
      }

      // Only delete DB record after storage is confirmed gone
      const { error: dbError } = await supabase
        .from('prints')
        .delete()
        .eq('id', printId)

      if (dbError) {
        console.error('[lumi] DB delete error:', dbError.message)
        throw new Error(`DB delete failed: ${dbError.message}`)
      }

      return { success: true, error: null }
    } catch (err) {
      console.error('[lumi] Delete error:', err)
      return { success: false, error: err.message }
    }
  }, [])

  return { uploading, progress, error, uploadPrint, fetchUserPrints, deletePrint }
}
