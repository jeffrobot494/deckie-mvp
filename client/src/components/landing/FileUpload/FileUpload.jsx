import { useState, useRef } from 'react'
import './FileUpload.css'

function FileUpload({ onFilesSelected, files }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)
  
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }
  
  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    validateAndSetFiles(droppedFiles)
  }
  
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    validateAndSetFiles(selectedFiles)
  }
  
  const validateAndSetFiles = (fileList) => {
    const validFiles = fileList.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })
    
    if (validFiles.length > 250) {
      alert('Maximum 250 files allowed')
      return
    }
    
    if (validFiles.length !== fileList.length) {
      alert('Some files were skipped. Only PNG and JPG files under 10MB are allowed.')
    }
    
    onFilesSelected(validFiles)
  }
  
  const handleClick = () => {
    fileInputRef.current?.click()
  }
  
  return (
    <div className="form-group">
      <label>Upload Card Images</label>
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="upload-icon">
          {files.length > 0 ? '✅' : '📁'}
        </div>
        <div className="upload-text">
          {files.length > 0 ? (
            <>
              <strong>{files.length} files selected</strong>
              <div>Ready to upload</div>
            </>
          ) : (
            <>
              <strong>Click to upload or drag and drop</strong>
              <div>PNG, JPG files accepted (max 250 files, 10MB each)</div>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}

export default FileUpload