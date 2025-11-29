import { drive } from '../config/googleDrive.js';

/**
 * Verify Google Drive file exists
 * @param {string} fileId - Google Drive file ID
 * @returns {Promise<object>} - File metadata
 */
export const verifyFileExists = async (fileId) => {
  try {
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size'
    });

    if (!file.data) {
      throw new Error('File not found');
    }

    return file.data;
  } catch (error) {
    console.error('Error verifying file:', error);
    throw new Error('Failed to verify Google Drive file');
  }
};

/**
 * Get file metadata from Google Drive
 * @param {string} fileId - Google Drive file ID
 * @returns {Promise<object>} - File metadata
 */
export const getFileMetadata = async (fileId) => {
  try {
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size, thumbnailLink, webContentLink'
    });

    return response.data;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error('Failed to get file metadata');
  }
};

/**
 * Stream file from Google Drive with range support
 * @param {string} fileId - Google Drive file ID
 * @param {object} headers - Request headers for range
 * @returns {Promise<object>} - Stream and headers
 */
export const streamFile = async (fileId, headers = {}) => {
  try {
    const requestOptions = {
      fileId: fileId,
      alt: 'media',
    };

    // Add range header if provided
    const config = {
      responseType: 'stream',
    };

    if (headers.range) {
      config.headers = {
        Range: headers.range
      };
    }

    const response = await drive.files.get(requestOptions, config);

    return {
      stream: response.data,
      headers: response.headers,
      status: response.status
    };
  } catch (error) {
    console.error('Error streaming file:', error);
    throw new Error('Failed to stream file');
  }
};

export default {
  verifyFileExists,
  getFileMetadata,
  streamFile
};

