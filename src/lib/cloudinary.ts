// Fonction pour uploader une image côté client
export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    console.log('=== DEBUG CLOUDINARY UPLOAD ===');
    console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    console.log('Upload Preset:', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    console.log('File:', file.name, file.size, file.type);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    try {
        const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
        console.log('Upload URL:', url);

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Cloudinary error response:', errorText);
            throw new Error(`Erreur lors de l'upload de l'image: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Upload success:', data.secure_url);
        return data.secure_url;
    } catch (error) {
        console.error('Erreur upload Cloudinary:', error);
        throw error;
    }
};

// Fonction pour supprimer une image
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        const response = await fetch('/api/cloudinary/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publicId }),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de l\'image');
        }
    } catch (error) {
        console.error('Erreur suppression Cloudinary:', error);
        throw error;
    }
};

// Utilitaire pour extraire le public_id d'une URL Cloudinary
export const getPublicIdFromUrl = (url: string): string => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
};
