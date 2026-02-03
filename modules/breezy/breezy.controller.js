// modules/breezy/breezy.controller.js
const breezyService = require('./breezy.service');

class BreezyController {
  // ============= HEALTH CHECK =============
  
  async healthCheck(req, res) {
    try {
      await breezyService.getCompanyUsers();
      res.json({
        success: true,
        message: 'Breezy HR API is connected and working',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Breezy HR API connection failed',
        error: error.message
      });
    }
  }

  // ============= POSITIONS =============
  
  async getPositions(req, res) {
    try {
      const positions = await breezyService.getAllPositions(req.query);
      res.json({
        success: true,
        count: positions.length,
        data: positions
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: 'Failed to fetch positions',
        error: error.message
      });
    }
  }

  async getPosition(req, res) {
    try {
      const position = await breezyService.getPosition(req.params.positionId);
      res.json({
        success: true,
        data: position
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: 'Failed to fetch position',
        error: error.message
      });
    }
  }

  async createPosition(req, res) {
    try {
      const position = await breezyService.createPosition(req.body);
      res.status(201).json({
        success: true,
        message: 'Position created successfully',
        data: position
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: 'Failed to create position',
        error: error.message
      });
    }
  }

  async updatePosition(req, res) {
    try {
      const position = await breezyService.updatePosition(
        req.params.positionId,
        req.body
      );
      res.json({
        success: true,
        message: 'Position updated successfully',
        data: position
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: 'Failed to update position',
        error: error.message
      });
    }
  }

  async deletePosition(req, res) {
    try {
      await breezyService.deletePosition(req.params.positionId);
      res.json({
        success: true,
        message: 'Position deleted successfully'
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: 'Failed to delete position',
        error: error.message
      });
    }
  }

  // ============= CANDIDATES =============
  
  async getCandidates(req, res) {
    try {
      const candidates = await breezyService.getCandidates(
        req.params.positionId,
        req.query
      );
      res.json({
        success: true,
        count: candidates.length,
        data: candidates
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: 'Failed to fetch candidates',
        error: error.message
      });
    }
  }

  async getCandidate(req, res) {
    try {
      const candidate = await breezyService.getCandidate(
        req.params.positionId,
        req.params.candidateId
      );
      res.json({
        success: true,
        data: candidate
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: 'Failed to fetch candidate',
        error: error.message
      });
    }
  }

  async addCandidate(req, res) {
    try {
      const candidate = await breezyService.addCandidate(
        req.params.positionId,
        req.body
      );
      res.status(201).json({
        success: true,
        message: 'Candidate added successfully',
        data: candidate
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: 'Failed to add candidate',
        error: error.message
      });
    }
  }

  async updateCandidate(req, res) {
    try {
      const candidate = await breezyService.updateCandidate(
        req.params.positionId,
        req.params.candidateId,
        req.body
      );
      res.json({
        success: true,
        message: 'Candidate updated successfully',
        data: candidate
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: 'Failed to update candidate',
        error: error.message
      });
    }
  }

  async deleteCandidate(req, res) {
    try {
      await breezyService.deleteCandidate(
        req.params.positionId,
        req.params.candidateId
      );
      res.json({
        success: true,
        message: 'Candidate deleted successfully'
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: 'Failed to delete candidate',
        error: error.message
      });
    }
  }

  // ============= STAGES =============
  
  async getStages(req, res) {
    try {
      const stages = await breezyService.getStages(req.params.positionId);
      res.json({
        success: true,
        data: stages
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: 'Failed to fetch stages',
        error: error.message
      });
    }
  }

  async moveCandidateStage(req, res) {
    try {
      const result = await breezyService.moveCandidateToStage(
        req.params.positionId,
        req.params.candidateId,
        req.body.stage_id
      );
      res.json({
        success: true,
        message: 'Candidate moved to new stage',
        data: result
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: 'Failed to move candidate',
        error: error.message
      });
    }
  }

  // ============= COMMENTS =============
  
  async getComments(req, res) {
    try {
      const comments = await breezyService.getComments(
        req.params.positionId,
        req.params.candidateId
      );
      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: 'Failed to fetch comments',
        error: error.message
      });
    }
  }

  async addComment(req, res) {
    try {
      const comment = await breezyService.addComment(
        req.params.positionId,
        req.params.candidateId,
        req.body.comment
      );
      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment
      });
    } catch (error) {
      res.status(error.status || 400).json({
        success: false,
        message: 'Failed to add comment',
        error: error.message
      });
    }
  }

  // ============= COMPANY =============
  
  async getCompanyUsers(req, res) {
    try {
      const users = await breezyService.getCompanyUsers();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: 'Failed to fetch company users',
        error: error.message
      });
    }
  }

  // ============= SEARCH =============
  
  async searchPositions(req, res) {
    try {
      const positions = await breezyService.searchPositions(
        req.query.q,
        req.query
      );
      res.json({
        success: true,
        count: positions.length,
        data: positions
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: 'Failed to search positions',
        error: error.message
      });
    }
  }

  // ============= STATS =============
  
  async getPositionStats(req, res) {
    try {
      const stats = await breezyService.getPositionStats(req.params.positionId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: 'Failed to fetch position stats',
        error: error.message
      });
    }
  }

  // ============= WEBHOOKS =============
  
  async getWebhooks(req, res) {
    try {
      const webhooks = await breezyService.getWebhooks();
      res.json({
        success: true,
        data: webhooks
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: 'Failed to fetch webhooks',
        error: error.message
      });
    }
  }
}

module.exports = new BreezyController();