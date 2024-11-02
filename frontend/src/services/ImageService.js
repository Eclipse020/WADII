// ImageService.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase'; // Assuming you have a Firebase storage instance

export const uploadImage = async (file) => {
  const imageRef = ref(storage, `images/${file.name}`); // Adjust the path as needed
  await uploadBytes(imageRef, file); // Upload the file
  const url = await getDownloadURL(imageRef); // Get the download URL
  return url; // Return the URL
};
