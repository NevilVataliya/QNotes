import conf from '../conf/conf.js'

/**
 * Upload image to backend which uses Cloudinary
 * @param {File} imageFile - The image file from clipboard or upload
 * @returns {Promise<{url: string, publicId: string}>} - Cloudinary image URL and public ID
 */
export async function uploadImageToCloudinary(imageFile) {
  try {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await fetch(`${conf.backendUrl}/api/v1/upload-image`, {
      method: 'POST',
      credentials: 'include', // Include httpOnly cookies
      body: formData,
    })

    const data = await response.json()

    if (response.ok) {
      // Expected response format from backend:
      // { success: true, data: { url: "cloudinary_url", publicId: "cloudinary_public_id" } }
      return {
        url: data.data?.url || data.url,
        publicId: data.data?.publicId || data.publicId,
      }
    } else {
      throw new Error(data.message || 'Image upload failed')
    }
  } catch (error) {
    console.error('Image upload error:', error)
    throw error
  }
}

/**
 * Delete image from Cloudinary via backend
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>}
 */
export async function deleteImageFromCloudinary(publicId) {
  try {
    const response = await fetch(`${conf.backendUrl}/api/v1/delete-image`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    })

    const data = await response.json()
    return response.ok
  } catch (error) {
    console.error('Image delete error:', error)
    return false
  }
}

/**
 * Convert clipboard data to file
 * @param {DataTransferItem} item - Clipboard data item
 * @returns {File|null}
 */
export function clipboardItemToFile(item) {
  if (item.kind === 'file' && item.type.startsWith('image/')) {
    return item.getAsFile()
  }
  return null
}

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateImageFile(file) {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid image type. Allowed: JPEG, PNG, GIF, WebP. Got: ${file.type}`,
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Image too large. Max: 5MB. Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    }
  }

  return { valid: true }
}
