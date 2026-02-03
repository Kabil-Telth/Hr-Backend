// const axios = require('axios');
// const FormData = require('form-data');
// const fs = require('fs');
// const path = require('path');

// class SharePointFileService {
//   constructor(sharepointService) {
//     this.sharepointService = sharepointService;
//     this.baseUrl = 'https://graph.microsoft.com/v1.0';
//   }

//   /**
//    * Upload file to SharePoint Document Library
//    * @param {Buffer|Stream} fileContent - File content as Buffer or Stream
//    * @param {String} fileName - Name of the file (e.g., "john_doe_resume.pdf")
//    * @param {String} libraryName - Document library name (e.g., "Resumes")
//    * @returns {Object} - File details including web URL
//    */
//   async uploadFileToLibrary(fileContent, fileName, libraryName = 'Resumes') {
//     try {
//       const token = await this.sharepointService.getAccessToken();
//       const siteId = this.sharepointService.siteId || await this.sharepointService.getSiteId();

//       // Get the drive ID for the document library
//       const driveId = await this.getDriveIdByName(libraryName);

//       // Upload file using simple upload (for files < 4MB)
//       // For larger files, use resumable upload (shown below)
//       const uploadUrl = `${this.baseUrl}/sites/${siteId}/drives/${driveId}/root:/${fileName}:/content`;

//       const response = await axios.put(
//         uploadUrl,
//         fileContent,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/octet-stream'
//           }
//         }
//       );

//       return {
//         success: true,
//         fileId: response.data.id,
//         fileName: response.data.name,
//         webUrl: response.data.webUrl,
//         downloadUrl: response.data['@microsoft.graph.downloadUrl'],
//         size: response.data.size,
//         createdDateTime: response.data.createdDateTime
//       };
//     } catch (error) {
//       console.error('Error uploading file:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   /**
//    * Upload large file (> 4MB) using resumable upload
//    */
//   async uploadLargeFile(fileContent, fileName, libraryName = 'Resumes') {
//     try {
//       const token = await this.sharepointService.getAccessToken();
//       const siteId = this.sharepointService.siteId || await this.sharepointService.getSiteId();
//       const driveId = await this.getDriveIdByName(libraryName);

//       // Step 1: Create upload session
//       const sessionUrl = `${this.baseUrl}/sites/${siteId}/drives/${driveId}/root:/${fileName}:/createUploadSession`;
      
//       const sessionResponse = await axios.post(
//         sessionUrl,
//         {
//           item: {
//             '@microsoft.graph.conflictBehavior': 'rename'
//           }
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       const uploadUrl = sessionResponse.data.uploadUrl;

//       // Step 2: Upload file in chunks
//       const chunkSize = 327680 * 10; // 3.2 MB chunks
//       const fileSize = Buffer.byteLength(fileContent);
//       let start = 0;

//       while (start < fileSize) {
//         const end = Math.min(start + chunkSize, fileSize);
//         const chunk = fileContent.slice(start, end);

//         const uploadResponse = await axios.put(
//           uploadUrl,
//           chunk,
//           {
//             headers: {
//               'Content-Length': chunk.length,
//               'Content-Range': `bytes ${start}-${end - 1}/${fileSize}`
//             }
//           }
//         );

//         if (uploadResponse.status === 201 || uploadResponse.status === 200) {
//           // Upload complete
//           return {
//             success: true,
//             fileId: uploadResponse.data.id,
//             fileName: uploadResponse.data.name,
//             webUrl: uploadResponse.data.webUrl,
//             downloadUrl: uploadResponse.data['@microsoft.graph.downloadUrl'],
//             size: uploadResponse.data.size
//           };
//         }

//         start = end;
//       }
//     } catch (error) {
//       console.error('Error uploading large file:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   /**
//    * Get Drive ID by library name
//    */
//   async getDriveIdByName(libraryName) {
//     try {
//       const token = await this.sharepointService.getAccessToken();
//       const siteId = this.sharepointService.siteId || await this.sharepointService.getSiteId();

//       // Get all drives (document libraries) in the site
//       const response = await axios.get(
//         `${this.baseUrl}/sites/${siteId}/drives`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       // Find the drive by name
//       const drive = response.data.value.find(d => d.name === libraryName);
      
//       if (!drive) {
//         throw new Error(`Document library '${libraryName}' not found`);
//       }

//       return drive.id;
//     } catch (error) {
//       console.error('Error getting drive ID:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   /**
//    * Upload from Express multer file
//    */
//   async uploadFromMulter(multerFile, libraryName = 'Resumes') {
//     try {
//       // Read file content
//       const fileContent = fs.readFileSync(multerFile.path);
      
//       // Generate unique filename
//       const timestamp = Date.now();
//       const sanitizedName = multerFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
//       const fileName = `${timestamp}_${sanitizedName}`;

//       // Upload based on file size
//       let result;
//       if (fileContent.length > 4 * 1024 * 1024) {
//         // Use large file upload for files > 4MB
//         result = await this.uploadLargeFile(fileContent, fileName, libraryName);
//       } else {
//         result = await this.uploadFileToLibrary(fileContent, fileName, libraryName);
//       }

//       // Clean up temporary file
//       fs.unlinkSync(multerFile.path);

//       return result;
//     } catch (error) {
//       console.error('Error uploading from multer:', error);
//       throw error;
//     }
//   }

//   /**
//    * Upload from base64 string
//    */
//   async uploadFromBase64(base64String, fileName, libraryName = 'Resumes') {
//     try {
//       // Remove data URL prefix if present
//       const base64Data = base64String.replace(/^data:[^;]+;base64,/, '');
//       const fileContent = Buffer.from(base64Data, 'base64');

//       if (fileContent.length > 4 * 1024 * 1024) {
//         return await this.uploadLargeFile(fileContent, fileName, libraryName);
//       } else {
//         return await this.uploadFileToLibrary(fileContent, fileName, libraryName);
//       }
//     } catch (error) {
//       console.error('Error uploading from base64:', error);
//       throw error;
//     }
//   }

//   /**
//    * Delete file from library
//    */
//   async deleteFile(fileId, libraryName = 'Resumes') {
//     try {
//       const token = await this.sharepointService.getAccessToken();
//       const siteId = this.sharepointService.siteId || await this.sharepointService.getSiteId();
//       const driveId = await this.getDriveIdByName(libraryName);

//       await axios.delete(
//         `${this.baseUrl}/sites/${siteId}/drives/${driveId}/items/${fileId}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       return { success: true, message: 'File deleted successfully' };
//     } catch (error) {
//       console.error('Error deleting file:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   /**
//    * Get file download URL
//    */
//   async getFileDownloadUrl(fileId, libraryName = 'Resumes') {
//     try {
//       const token = await this.sharepointService.getAccessToken();
//       const siteId = this.sharepointService.siteId || await this.sharepointService.getSiteId();
//       const driveId = await this.getDriveIdByName(libraryName);

//       const response = await axios.get(
//         `${this.baseUrl}/sites/${siteId}/drives/${driveId}/items/${fileId}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       return {
//         webUrl: response.data.webUrl,
//         downloadUrl: response.data['@microsoft.graph.downloadUrl']
//       };
//     } catch (error) {
//       console.error('Error getting file URL:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   /**
//    * List all files in library
//    */
//   async listFilesInLibrary(libraryName = 'Resumes') {
//     try {
//       const token = await this.sharepointService.getAccessToken();
//       const siteId = this.sharepointService.siteId || await this.sharepointService.getSiteId();
//       const driveId = await this.getDriveIdByName(libraryName);

//       const response = await axios.get(
//         `${this.baseUrl}/sites/${siteId}/drives/${driveId}/root/children`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       return response.data.value.map(file => ({
//         id: file.id,
//         name: file.name,
//         size: file.size,
//         webUrl: file.webUrl,
//         downloadUrl: file['@microsoft.graph.downloadUrl'],
//         createdDateTime: file.createdDateTime,
//         modifiedDateTime: file.lastModifiedDateTime
//       }));
//     } catch (error) {
//       console.error('Error listing files:', error.response?.data || error.message);
//       throw error;
//     }
//   }
// }

// module.exports = SharePointFileService;

const axios = require('axios');
const fs = require('fs');

class SharePointFileService {
  constructor(sharepointService) {
    this.sharepointService = sharepointService;
    this.baseUrl = 'https://graph.microsoft.com/v1.0';
    this.siteId = sharepointService.siteId;
    this.resumeLibraryId = sharepointService.resumeLibraryId;
  }

  async uploadFileToLibrary(fileContent, fileName) {
    try {
      const token = await this.sharepointService.getAccessToken();

      const driveResponse = await axios.get(
        `${this.baseUrl}/sites/${this.siteId}/lists/${this.resumeLibraryId}/drive`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const driveId = driveResponse.data.id;

      const fileUploadUrl = `${this.baseUrl}/sites/${this.siteId}/drives/${driveId}/root:/${fileName}:/content`;

      const response = await axios.put(
        fileUploadUrl,
        fileContent,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/octet-stream'
          }
        }
      );

      return {
        success: true,
        fileId: response.data.id,
        fileName: response.data.name,
        webUrl: response.data.webUrl,
        downloadUrl: response.data['@microsoft.graph.downloadUrl'],
        size: response.data.size
      };
    } catch (error) {
      console.error('Error uploading file:', error.response?.data || error.message);
      throw error;
    }
  }

  async uploadLargeFile(fileContent, fileName) {
    try {
      const token = await this.sharepointService.getAccessToken();

      const driveResponse = await axios.get(
        `${this.baseUrl}/sites/${this.siteId}/lists/${this.resumeLibraryId}/drive`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const driveId = driveResponse.data.id;

      const sessionUrl = `${this.baseUrl}/sites/${this.siteId}/drives/${driveId}/root:/${fileName}:/createUploadSession`;
      
      const sessionResponse = await axios.post(
        sessionUrl,
        { item: { '@microsoft.graph.conflictBehavior': 'rename' } },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const uploadUrl = sessionResponse.data.uploadUrl;
      const chunkSize = 327680 * 10;
      const fileSize = Buffer.byteLength(fileContent);
      let start = 0;

      while (start < fileSize) {
        const end = Math.min(start + chunkSize, fileSize);
        const chunk = fileContent.slice(start, end);

        const uploadResponse = await axios.put(
          uploadUrl,
          chunk,
          {
            headers: {
              'Content-Length': chunk.length,
              'Content-Range': `bytes ${start}-${end - 1}/${fileSize}`
            }
          }
        );

        if (uploadResponse.status === 201 || uploadResponse.status === 200) {
          return {
            success: true,
            fileId: uploadResponse.data.id,
            fileName: uploadResponse.data.name,
            webUrl: uploadResponse.data.webUrl,
            downloadUrl: uploadResponse.data['@microsoft.graph.downloadUrl'],
            size: uploadResponse.data.size
          };
        }

        start = end;
      }
    } catch (error) {
      console.error('Error uploading large file:', error.response?.data || error.message);
      throw error;
    }
  }

  async uploadFromMulter(multerFile) {
    try {
      const fileContent = fs.readFileSync(multerFile.path);
      const timestamp = Date.now();
      const sanitizedName = multerFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;

      let result;
      if (fileContent.length > 4 * 1024 * 1024) {
        result = await this.uploadLargeFile(fileContent, fileName);
      } else {
        result = await this.uploadFileToLibrary(fileContent, fileName);
      }

      fs.unlinkSync(multerFile.path);
      return result;
    } catch (error) {
      console.error('Error uploading from multer:', error);
      throw error;
    }
  }

  async uploadFromBase64(base64String, fileName) {
    try {
      const base64Data = base64String.replace(/^data:[^;]+;base64,/, '');
      const fileContent = Buffer.from(base64Data, 'base64');

      if (fileContent.length > 4 * 1024 * 1024) {
        return await this.uploadLargeFile(fileContent, fileName);
      } else {
        return await this.uploadFileToLibrary(fileContent, fileName);
      }
    } catch (error) {
      console.error('Error uploading from base64:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      const token = await this.sharepointService.getAccessToken();

      const driveResponse = await axios.get(
        `${this.baseUrl}/sites/${this.siteId}/lists/${this.resumeLibraryId}/drive`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const driveId = driveResponse.data.id;

      await axios.delete(
        `${this.baseUrl}/sites/${this.siteId}/drives/${driveId}/items/${fileId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      return { success: true, message: 'File deleted successfully' };
    } catch (error) {
      console.error('Error deleting file:', error.response?.data || error.message);
      throw error;
    }
  }

  async getFileDownloadUrl(fileId) {
    try {
      const token = await this.sharepointService.getAccessToken();

      const driveResponse = await axios.get(
        `${this.baseUrl}/sites/${this.siteId}/lists/${this.resumeLibraryId}/drive`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const driveId = driveResponse.data.id;

      const response = await axios.get(
        `${this.baseUrl}/sites/${this.siteId}/drives/${driveId}/items/${fileId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      return {
        webUrl: response.data.webUrl,
        downloadUrl: response.data['@microsoft.graph.downloadUrl']
      };
    } catch (error) {
      console.error('Error getting file URL:', error.response?.data || error.message);
      throw error;
    }
  }

  async listFilesInLibrary() {
    try {
      const token = await this.sharepointService.getAccessToken();

      const driveResponse = await axios.get(
        `${this.baseUrl}/sites/${this.siteId}/lists/${this.resumeLibraryId}/drive`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const driveId = driveResponse.data.id;

      const response = await axios.get(
        `${this.baseUrl}/sites/${this.siteId}/drives/${driveId}/root/children`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      return response.data.value.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        webUrl: file.webUrl,
        downloadUrl: file['@microsoft.graph.downloadUrl'],
        createdDateTime: file.createdDateTime,
        modifiedDateTime: file.lastModifiedDateTime
      }));
    } catch (error) {
      console.error('Error listing files:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = SharePointFileService;