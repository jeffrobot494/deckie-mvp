const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
}

export const uploadToCloudinary = async (files, onProgress) => {
  const uploadedUrls = []
  const totalFiles = files.length
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    // Validate file
    if (!validateFile(file)) {
      throw new Error(`Invalid file: ${file.name}`)
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)
    formData.append('folder', 'deckie-cards')
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )
      
      if (!response.ok) {
        throw new Error(`Upload failed for ${file.name}`)
      }
      
      const data = await response.json()
      uploadedUrls.push(data.secure_url)
      
      // Call progress callback
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalFiles) * 100))
      }
    } catch (error) {
      throw new Error(`Failed to upload ${file.name}: ${error.message}`)
    }
  }
  
  return uploadedUrls
}

const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  
  if (file.size > maxSize) {
    return false
  }
  
  if (!allowedTypes.includes(file.type)) {
    return false
  }
  
  return true
}

export const validateImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      const { width, height } = img
      URL.revokeObjectURL(url)
      
      const minWidth = 200
      const minHeight = 280
      const maxWidth = 2000
      const maxHeight = 2800
      
      const isValidSize = width >= minWidth && height >= minHeight && 
                         width <= maxWidth && height <= maxHeight
      
      resolve({
        valid: isValidSize,
        width,
        height,
        aspectRatio: width / height
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ valid: false })
    }
    
    img.src = url
  })
}