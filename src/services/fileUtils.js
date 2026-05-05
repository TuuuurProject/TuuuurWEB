// Convert a file to an base64 string
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => {
      const reason = reader.error?.message || 'Erreur lors de la lecture du fichier'
      reject(new Error(reason))
    }
  })
}

// Compress file
export const resizeImage = async function (settings) {
  const { file, maxWidth = 1080, maxHeight = 1920, quality = 0.92 } = settings

  // Validation
  if (!(file instanceof File)) {
    throw new TypeError('file must be a File object')
  }
  if (!(/image\/.*/).exec(file.type)) {
    throw new Error("Le fichier n'est pas une image")
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const image = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    reader.onload = (readerEvent) => {
      image.onload = () => {
        try {
          let width = image.width
          let height = image.height

          // Calculate new dimensions maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width
            const heightRatio = maxHeight / height
            const ratio = Math.min(widthRatio, heightRatio)

            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(image, 0, 0, width, height)

          const dataURL = canvas.toDataURL('image/jpeg', quality)
          resolve(dataURL)
        } catch (error) {
          reject(new Error(`Erreur lors du redimensionnement: ${error.message}`))
        }
      }

      image.onerror = () => {
        reject(new Error("Erreur lors du chargement de l'image"))
      }

      image.src = readerEvent.target.result
    }

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'))
    }

    reader.readAsDataURL(file)
  })
}
