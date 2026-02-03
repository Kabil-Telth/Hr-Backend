// modules/breezy/breezy.service.js
const axios = require('axios');
const config = require('../../config/breezy.config');

class BreezyService {
  constructor() {
    if (!config.apiKey || !config.companyId) {
      throw new Error('Breezy API key or Company ID is missing');
    }

    this.client = axios.create({
      baseURL: config.breezbaseURL,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: config.defaults.timeout
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🌐 Breezy ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const err = new Error(error.response.data?.error || 'Breezy API Error');
          err.status = error.response.status;
          err.data = error.response.data;
          return Promise.reject(err);
        }
        return Promise.reject(error);
      }
    );
  }

  // ============= POSITIONS =============
  
  async getAllPositions(query = {}) {
    try {
      const response = await this.client.get('/positions', {
        params: { company_id: config.companyId, ...query }
      });
      return response.data;
    } catch (error) {
      console.error('Get positions error:', error.message);
      throw error;
    }
  }

  async getPosition(positionId) {
    try {
      const response = await this.client.get(`/position/${positionId}`, {
        params: { company_id: config.companyId }
      });
      return response.data;
    } catch (error) {
      console.error(`Get position ${positionId} error:`, error.message);
      throw error;
    }
  }

  async createPosition(positionData) {
    try {
      const response = await this.client.post('/positions', {
        company_id: config.companyId,
        ...positionData
      });
      return response.data;
    } catch (error) {
      console.error('Create position error:', error.message);
      throw error;
    }
  }

  async updatePosition(positionId, updateData) {
    try {
      const response = await this.client.put(`/position/${positionId}`, {
        company_id: config.companyId,
        ...updateData
      });
      return response.data;
    } catch (error) {
      console.error(`Update position ${positionId} error:`, error.message);
      throw error;
    }
  }

  async deletePosition(positionId) {
    try {
      const response = await this.client.delete(`/position/${positionId}`, {
        params: { company_id: config.companyId }
      });
      return response.data;
    } catch (error) {
      console.error(`Delete position ${positionId} error:`, error.message);
      throw error;
    }
  }

  // ============= CANDIDATES =============
  
  async getCandidates(positionId, query = {}) {
    try {
      const response = await this.client.get(`/position/${positionId}/candidates`, {
        params: { company_id: config.companyId, ...query }
      });
      return response.data;
    } catch (error) {
      console.error(`Get candidates for ${positionId} error:`, error.message);
      throw error;
    }
  }

  async getCandidate(positionId, candidateId) {
    try {
      const response = await this.client.get(`/position/${positionId}/candidate/${candidateId}`, {
        params: { company_id: config.companyId }
      });
      return response.data;
    } catch (error) {
      console.error(`Get candidate ${candidateId} error:`, error.message);
      throw error;
    }
  }

  async addCandidate(positionId, candidateData) {
    try {
      const formData = new FormData();
      
      // Add basic fields
      Object.keys(candidateData).forEach(key => {
        if (key !== 'resume' && key !== 'cover_letter' && key !== 'photo') {
          formData.append(key, candidateData[key]);
        }
      });

      // Add files
      if (candidateData.resume) {
        formData.append('resume', candidateData.resume);
      }
      if (candidateData.cover_letter) {
        formData.append('cover_letter', candidateData.cover_letter);
      }
      if (candidateData.photo) {
        formData.append('photo', candidateData.photo);
      }

      const response = await axios.post(
        `${config.baseURL}/position/${positionId}/candidates`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'multipart/form-data'
          },
          params: { company_id: config.companyId }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Add candidate error:`, error.message);
      throw error;
    }
  }

  async updateCandidate(positionId, candidateId, updateData) {
    try {
      const response = await this.client.put(
        `/position/${positionId}/candidate/${candidateId}`,
        {
          company_id: config.companyId,
          ...updateData
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Update candidate ${candidateId} error:`, error.message);
      throw error;
    }
  }

  async deleteCandidate(positionId, candidateId) {
    try {
      const response = await this.client.delete(
        `/position/${positionId}/candidate/${candidateId}`,
        { params: { company_id: config.companyId } }
      );
      return response.data;
    } catch (error) {
      console.error(`Delete candidate ${candidateId} error:`, error.message);
      throw error;
    }
  }

  // ============= STAGES =============
  
  async getStages(positionId) {
    try {
      const response = await this.client.get(`/position/${positionId}/stages`, {
        params: { company_id: config.companyId }
      });
      return response.data;
    } catch (error) {
      console.error(`Get stages for ${positionId} error:`, error.message);
      throw error;
    }
  }

  async moveCandidateToStage(positionId, candidateId, stageId) {
    try {
      const response = await this.client.put(
        `/position/${positionId}/candidate/${candidateId}/stage`,
        {
          company_id: config.companyId,
          stage_id: stageId
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Move candidate ${candidateId} error:`, error.message);
      throw error;
    }
  }

  // ============= COMMENTS =============
  
  async getComments(positionId, candidateId) {
    try {
      const response = await this.client.get(
        `/position/${positionId}/candidate/${candidateId}/comments`,
        { params: { company_id: config.companyId } }
      );
      return response.data;
    } catch (error) {
      console.error(`Get comments for ${candidateId} error:`, error.message);
      throw error;
    }
  }

  async addComment(positionId, candidateId, comment) {
    try {
      const response = await this.client.post(
        `/position/${positionId}/candidate/${candidateId}/comments`,
        {
          company_id: config.companyId,
          comment: comment
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Add comment to ${candidateId} error:`, error.message);
      throw error;
    }
  }

  // ============= COMPANY =============
  
  async getCompanyUsers() {
    try {
      const response = await this.client.get('/company/users', {
        params: { company_id: config.companyId }
      });
      return response.data;
    } catch (error) {
      console.error('Get company users error:', error.message);
      throw error;
    }
  }

  async getCompanyTags() {
    try {
      const response = await this.client.get('/company/tags', {
        params: { company_id: config.companyId }
      });
      return response.data;
    } catch (error) {
      console.error('Get company tags error:', error.message);
      throw error;
    }
  }

  // ============= SEARCH =============
  
  async searchPositions(searchTerm, query = {}) {
    try {
      const response = await this.client.get('/positions', {
        params: {
          company_id: config.companyId,
          search: searchTerm,
          ...query
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Search positions "${searchTerm}" error:`, error.message);
      throw error;
    }
  }

  // ============= WEBHOOKS =============
  
  async getWebhooks() {
    try {
      const response = await this.client.get('/webhooks', {
        params: { company_id: config.companyId }
      });
      return response.data;
    } catch (error) {
      console.error('Get webhooks error:', error.message);
      throw error;
    }
  }

  async createWebhook(webhookData) {
    try {
      const response = await this.client.post('/webhooks', {
        company_id: config.companyId,
        ...webhookData
      });
      return response.data;
    } catch (error) {
      console.error('Create webhook error:', error.message);
      throw error;
    }
  }

  async deleteWebhook(webhookId) {
    try {
      const response = await this.client.delete(`/webhook/${webhookId}`, {
        params: { company_id: config.companyId }
      });
      return response.data;
    } catch (error) {
      console.error(`Delete webhook ${webhookId} error:`, error.message);
      throw error;
    }
  }

  // ============= UTILITIES =============
  
  async getPositionStats(positionId) {
    try {
      const response = await this.client.get(`/position/${positionId}/stats`, {
        params: { company_id: config.companyId }
      });
      return response.data;
    } catch (error) {
      console.error(`Get stats for ${positionId} error:`, error.message);
      throw error;
    }
  }
}

module.exports = new BreezyService();