const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
}

// Comprehensive debugging
console.log('=== CLOUDINARY DEBUG INFO ===');
console.log('Environment mode:', import.meta.env.MODE);
console.log('Environment dev:', import.meta.env.DEV);
console.log('Environment prod:', import.meta.env.PROD);

// Check raw environment variables
console.log('Raw env variables:');
console.log('- VITE_CLOUDINARY_CLOUD_NAME:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
console.log('- VITE_CLOUDINARY_UPLOAD_PRESET:', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

// Check for any variations/typos
console.log('Checking for typos/variations:');
console.log('- CLOUDINARY_CLOUD_NAME (no VITE):', import.meta.env.CLOUDINARY_CLOUD_NAME);
console.log('- CLOUDINARY_UPLOAD_PRESET (no VITE):', import.meta.env.CLOUDINARY_UPLOAD_PRESET);
console.log('- VITE_CLOUDINARY_CLOUDNAME (no underscore):', import.meta.env.VITE_CLOUDINARY_CLOUDNAME);
console.log('- VITE_CLOUDINARY_UPLOADPRESET (no underscore):', import.meta.env.VITE_CLOUDINARY_UPLOADPRESET);

// Check all environment variables starting with VITE
console.log('All VITE environment variables:');
const allEnvKeys = Object.keys(import.meta.env);
const viteKeys = allEnvKeys.filter(key => key.startsWith('VITE_'));
viteKeys.forEach(key => {
  console.log(`- ${key}:`, import.meta.env[key]);
});

// Check if we have any cloudinary-related vars at all
console.log('All cloudinary-related environment variables:');
const cloudinaryKeys = allEnvKeys.filter(key => 
  key.toLowerCase().includes('cloudinary') || 
  key.toLowerCase().includes('cloud')
);
cloudinaryKeys.forEach(key => {
  console.log(`- ${key}:`, import.meta.env[key]);
});

// Final config
console.log('Final Cloudinary Config:', {
  cloudName: CLOUDINARY_CONFIG.cloudName,
  uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
  hasCloudName: !!CLOUDINARY_CONFIG.cloudName,
  hasUploadPreset: !!CLOUDINARY_CONFIG.uploadPreset,
  typeOfCloudName: typeof CLOUDINARY_CONFIG.cloudName,
  typeOfUploadPreset: typeof CLOUDINARY_CONFIG.uploadPreset
});
console.log('=== END CLOUDINARY DEBUG ===');

export const uploadToCloudinary = async (files, onProgress) => {
  // Validate configuration first
  if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
    throw new Error(`Cloudinary configuration missing: cloudName=${CLOUDINARY_CONFIG.cloudName}, uploadPreset=${CLOUDINARY_CONFIG.uploadPreset}`)
  }

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