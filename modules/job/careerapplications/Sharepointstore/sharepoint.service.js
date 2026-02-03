// const axios = require('axios');
// const AuthService = require('./appauth.service');

// class SharePointService {
//   constructor() {
//     this.baseUrl = 'https://graph.microsoft.com/v1.0';
//     this.siteUrl = process.env.SHAREPOINT_SITE_URL || 'telthcare.sharepoint.com:/sites/TelthCareerPortal';
//     this.authService = new AuthService();
//     this.siteId = null;
//     this.listId = null;
//   }

//   // Get access token using AuthService
//   async getAccessToken() {
//     return await this.authService.getAccessToken();
//   }

//   // Get SharePoint site ID
//   async getSiteId() {
//     try {
//       const token = await this.getAccessToken();
//       const response = await axios.get(
//         `${this.baseUrl}/sites/${this.siteUrl}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       this.siteId = response.data.id;
//       return this.siteId;
//     } catch (error) {
//       console.error('Error getting site ID:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   // Map Mongoose schema types to SharePoint column types
//   mapFieldTypeToSharePoint(mongooseType) {
//     const typeMap = {
//       'String': 'text',
//       'Number': 'number',
//       'Date': 'dateTime',
//       'Boolean': 'boolean',
//       'Array': 'multiChoice', // or 'multiLine' depending on use case
//       'ObjectId': 'text',
//       'Mixed': 'multiLine'
//     };
//     return typeMap[mongooseType] || 'text';
//   }

//   // Extract fields from Mongoose model
//   extractFieldsFromModel(model) {
//     const schema = model.schema.obj;
//     const fields = [];

//     for (const [fieldName, fieldConfig] of Object.entries(schema)) {
//       // Skip internal MongoDB fields
//       if (fieldName === '_id' || fieldName === '__v') continue;

//       let fieldType = fieldConfig.type?.name || fieldConfig.constructor?.name || 'String';
      
//       // Handle nested objects
//       if (typeof fieldConfig === 'object' && !fieldConfig.type) {
//         fieldType = 'Mixed';
//       }

//       fields.push({
//         name: fieldName,
//         displayName: this.formatDisplayName(fieldName),
//         type: this.mapFieldTypeToSharePoint(fieldType),
//         required: fieldConfig.required || false,
//         mongooseType: fieldType
//       });
//     }

//     return fields;
//   }

//   // Format field name to display name (camelCase to Title Case)
//   formatDisplayName(fieldName) {
//     return fieldName
//       .replace(/([A-Z])/g, ' $1')
//       .replace(/^./, str => str.toUpperCase())
//       .trim();
//   }

//   // Create SharePoint list
//   async createList(listName, description = 'Auto-generated from application model') {
//     try {
//       const token = await this.getAccessToken();
//       if (!this.siteId) await this.getSiteId();

//       const response = await axios.post(
//         `${this.baseUrl}/sites/${this.siteId}/lists`,
//         {
//           displayName: listName,
//           description: description,
//           list: {
//             template: 'genericList'
//           }
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       this.listId = response.data.id;
//       console.log('List created successfully:', response.data);
//       return response.data;
//     } catch (error) {
//       console.error('Error creating list:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   // Create SharePoint column
//   async createColumn(columnConfig) {
//     try {
//       const token = await this.getAccessToken();
//       if (!this.siteId) await this.getSiteId();
//       if (!this.listId) throw new Error('List ID not set. Create list first.');

//       const columnDefinition = this.buildColumnDefinition(columnConfig);

//       const response = await axios.post(
//         `${this.baseUrl}/sites/${this.siteId}/lists/${this.listId}/columns`,
//         columnDefinition,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       console.log(`Column created: ${columnConfig.displayName}`);
//       return response.data;
//     } catch (error) {
//       console.error(`Error creating column ${columnConfig.displayName}:`, 
//         error.response?.data || error.message);
//       throw error;
//     }
//   }

//   // Build column definition based on type
//   buildColumnDefinition(columnConfig) {
//     const base = {
//       name: columnConfig.name,
//       displayName: columnConfig.displayName,
//       enforceUniqueValues: false,
//       hidden: false,
//       indexed: false,
//       required: columnConfig.required
//     };

//     switch (columnConfig.type) {
//       case 'text':
//         return {
//           ...base,
//           text: {
//             allowMultipleLines: false,
//             maxLength: 255
//           }
//         };
      
//       case 'multiLine':
//         return {
//           ...base,
//           text: {
//             allowMultipleLines: true,
//             maxLength: 65535
//           }
//         };

//       case 'number':
//         return {
//           ...base,
//           number: {
//             decimalPlaces: 'automatic',
//             displayAs: 'number'
//           }
//         };

//       case 'dateTime':
//         return {
//           ...base,
//           dateTime: {
//             displayAs: 'default',
//             format: 'dateTime'
//           }
//         };

//       case 'boolean':
//         return {
//           ...base,
//           boolean: {}
//         };

//       case 'choice':
//         return {
//           ...base,
//           choice: {
//             allowTextEntry: false,
//             choices: columnConfig.choices || ['Option 1', 'Option 2'],
//             displayAs: 'dropDownMenu'
//           }
//         };

//       case 'multiChoice':
//         return {
//           ...base,
//           choice: {
//             allowTextEntry: false,
//             choices: columnConfig.choices || ['Option 1', 'Option 2'],
//             displayAs: 'checkBoxes'
//           }
//         };

//       default:
//         return {
//           ...base,
//           text: {
//             allowMultipleLines: false,
//             maxLength: 255
//           }
//         };
//     }
//   }

//   // Create all columns from model
//   async createColumnsFromModel(model, listName) {
//     try {
//       // First, create the list
//       await this.createList(listName);

//       // Extract fields from model
//       const fields = this.extractFieldsFromModel(model);

//       // Create columns for each field
//       const results = [];
//       for (const field of fields) {
//         try {
//           const column = await this.createColumn(field);
//           results.push({ success: true, field: field.name, column });
//         } catch (error) {
//           results.push({ 
//             success: false, 
//             field: field.name, 
//             error: error.message 
//           });
//         }
//       }

//       return {
//         listId: this.listId,
//         columns: results
//       };
//     } catch (error) {
//       console.error('Error creating columns from model:', error);
//       throw error;
//     }
//   }

//   // Add item to SharePoint list
//   async addListItem(itemData) {
//     try {
//       const token = await this.getAccessToken();
//       if (!this.siteId) await this.getSiteId();
//       if (!this.listId) throw new Error('List ID not set');

//       const response = await axios.post(
//         `${this.baseUrl}/sites/${this.siteId}/lists/${this.listId}/items`,
//         {
//           fields: itemData
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Error adding list item:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   // Get all list items
//   async getListItems() {
//     try {
//       const token = await this.getAccessToken();
//       if (!this.siteId) await this.getSiteId();
//       if (!this.listId) throw new Error('List ID not set');

//       const response = await axios.get(
//         `${this.baseUrl}/sites/${this.siteId}/lists/${this.listId}/items?expand=fields`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       return response.data.value;
//     } catch (error) {
//       console.error('Error getting list items:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   // Get existing list by name
//   async getListByName(listName) {
//     try {
//       const token = await this.getAccessToken();
//       if (!this.siteId) await this.getSiteId();

//       const response = await axios.get(
//         `${this.baseUrl}/sites/${this.siteId}/lists?$filter=displayName eq '${listName}'`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       if (response.data.value && response.data.value.length > 0) {
//         this.listId = response.data.value[0].id;
//         return response.data.value[0];
//       }
//       return null;
//     } catch (error) {
//       console.error('Error getting list by name:', error.response?.data || error.message);
//       throw error;
//     }
//   }
// }

// module.exports = SharePointService;

// const axios = require('axios');
// const AuthService = require('./appauth.service');

// class SharePointService {
//   constructor() {
//     this.baseUrl = 'https://graph.microsoft.com/v1.0';
//     this.authService = new AuthService();
    
//     // Hardcoded site and list IDs from your URLs
//     this.siteId = 'telthcare.sharepoint.com,4d1e70a0-b237-4010-bfc8-26749a27347f,3a63d243-647c-4205-819e-7c78e8bf94a3';
//     this.listId = '896d42bf-655e-443b-b282-bdb5b93391d2'; // Career Applications list
//     this.resumeLibraryId = '7d09fe0e-152b-404b-a0fb-606562bf8d79'; // Resume library/list
//   }

//   async getAccessToken() {
//     return await this.authService.getAccessToken();
//   }

//   /**
//    * Get existing columns in the list
//    */
//   async getExistingColumns() {
//     try {
//       const token = await this.getAccessToken();
//       const response = await axios.get(
//         `${this.baseUrl}/sites/${this.siteId}/lists/${this.listId}/columns`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       return response.data.value.map(col => col.name);
//     } catch (error) {
//       console.error('Error getting existing columns:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   /**
//    * Create column if it doesn't exist
//    */
//   async ensureColumn(fieldName, fieldType, displayName) {
//     try {
//       const token = await this.getAccessToken();
//       const existingColumns = await this.getExistingColumns();

//       // Check if column already exists
//       if (existingColumns.includes(fieldName)) {
//         console.log(`Column ${fieldName} already exists, skipping...`);
//         return { exists: true, fieldName };
//       }

//       // Create the column
//       const columnDefinition = this.buildColumnDefinition(fieldName, fieldType, displayName);

//       const response = await axios.post(
//         `${this.baseUrl}/sites/${this.siteId}/lists/${this.listId}/columns`,
//         columnDefinition,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       console.log(`✓ Column created: ${displayName}`);
//       return { exists: false, created: true, data: response.data };
//     } catch (error) {
//       console.error(`Error creating column ${fieldName}:`, error.response?.data || error.message);
//       return { exists: false, created: false, error: error.message };
//     }
//   }

//   buildColumnDefinition(fieldName, fieldType, displayName) {
//     const base = {
//       name: fieldName,
//       displayName: displayName || fieldName,
//       enforceUniqueValues: false,
//       hidden: false,
//       indexed: false,
//       required: false
//     };

//     switch (fieldType) {
//       case 'text':
//       case 'String':
//         return {
//           ...base,
//           text: {
//             allowMultipleLines: false,
//             maxLength: 255
//           }
//         };
      
//       case 'multiLine':
//         return {
//           ...base,
//           text: {
//             allowMultipleLines: true,
//             maxLength: 65535
//           }
//         };

//       case 'number':
//       case 'Number':
//         return {
//           ...base,
//           number: {
//             decimalPlaces: 'automatic',
//             displayAs: 'number'
//           }
//         };

//       case 'dateTime':
//       case 'Date':
//         return {
//           ...base,
//           dateTime: {
//             displayAs: 'default',
//             format: 'dateTime'
//           }
//         };

//       case 'boolean':
//       case 'Boolean':
//         return {
//           ...base,
//           boolean: {}
//         };

//       default:
//         return {
//           ...base,
//           text: {
//             allowMultipleLines: false,
//             maxLength: 255
//           }
//         };
//     }
//   }

//   async autoCreateColumns(dataObject) {
//     const results = [];
    
//     for (const [key, value] of Object.entries(dataObject)) {
//       let fieldType = 'text';
      
//       if (typeof value === 'number') {
//         fieldType = 'number';
//       } else if (typeof value === 'boolean') {
//         fieldType = 'boolean';
//       } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)) && value.includes('T'))) {
//         fieldType = 'dateTime';
//       } else if (typeof value === 'string' && value.length > 255) {
//         fieldType = 'multiLine';
//       }

//       const result = await this.ensureColumn(key, fieldType, key);
//       results.push({ field: key, ...result });
//     }

//     return results;
//   }

//   async addListItem(itemData) {
//     try {
//       const token = await this.getAccessToken();

//       console.log('Checking/creating columns...');
//       await this.autoCreateColumns(itemData);

//       const response = await axios.post(
//         `${this.baseUrl}/sites/${this.siteId}/lists/${this.listId}/items`,
//         {
//           fields: itemData
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Error adding list item:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   async updateListItem(itemId, itemData) {
//     try {
//       const token = await this.getAccessToken();
//       await this.autoCreateColumns(itemData);

//       const response = await axios.patch(
//         `${this.baseUrl}/sites/${this.siteId}/lists/${this.listId}/items/${itemId}`,
//         {
//           fields: itemData
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Error updating list item:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   async getListItems(filter = null, select = null, orderBy = null, top = null) {
//     try {
//       const token = await this.getAccessToken();
      
//       let queryParams = [];
//       if (filter) queryParams.push(`$filter=${filter}`);
//       if (select) queryParams.push(`$select=${select}`);
//       if (orderBy) queryParams.push(`$orderby=${orderBy}`);
//       if (top) queryParams.push(`$top=${top}`);
      
//       const queryString = queryParams.length > 0 ? '&' + queryParams.join('&') : '';

//       const response = await axios.get(
//         `${this.baseUrl}/sites/${this.siteId}/lists/${this.listId}/items?expand=fields${queryString}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       return response.data.value;
//     } catch (error) {
//       console.error('Error getting list items:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   async getListItemById(itemId) {
//     try {
//       const token = await this.getAccessToken();

//       const response = await axios.get(
//         `${this.baseUrl}/sites/${this.siteId}/lists/${this.listId}/items/${itemId}?expand=fields`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.error('Error getting list item:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   async deleteListItem(itemId) {
//     try {
//       const token = await this.getAccessToken();

//       await axios.delete(
//         `${this.baseUrl}/sites/${this.siteId}/lists/${this.listId}/items/${itemId}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`
//           }
//         }
//       );

//       return { success: true, message: 'Item deleted successfully' };
//     } catch (error) {
//       console.error('Error deleting list item:', error.response?.data || error.message);
//       throw error;
//     }
//   }

//   async searchListItems(searchQuery) {
//     try {
//       const filter = `(contains(fields/CandidateName,'${searchQuery}') or contains(fields/Email,'${searchQuery}'))`;
//       return await this.getListItems(filter);
//     } catch (error) {
//       console.error('Error searching list items:', error.response?.data || error.message);
//       throw error;
//     }
//   }
// }

// module.exports = SharePointService;