import admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
try {
  // Best practice: Store your service account key JSON in an environment variable.
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // e.g., 'your-project-id.appspot.com'
  });
} catch (error) {
  console.error(
    'Firebase initialization failed. Make sure FIREBASE_SERVICE_ACCOUNT_KEY and FIREBASE_STORAGE_BUCKET are set correctly in your .env file.'
  );
}

const bucket = getStorage().bucket();

/**
 * Uploads a file to Firebase Storage.
 * @param {object} file - The file object from multer.
 * @returns {Promise<string>} - A promise that resolves with the public URL of the uploaded file.
 */
export const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject('No file provided.');
    }

    const blob = bucket.file(Date.now() + '-' + file.originalname.replace(/ /g, '_'));
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    blobStream.on('error', (err) => reject(err));

    blobStream.on('finish', async () => {
      // Make the file publicly accessible
      await blob.makePublic();
      // Generate the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};
