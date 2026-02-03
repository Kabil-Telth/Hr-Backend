// modules/breezy/breezy.routes.js
const express = require('express');
const router = express.Router();
const breezyController = require('./breezy.controller');
const authMiddleware = require('../auth/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ============= HEALTH CHECK =============
router.get('/health', breezyController.healthCheck);

// ============= POSITIONS =============
router.get('/positions', breezyController.getPositions);
router.get('/positions/search', breezyController.searchPositions);
router.get('/positions/:positionId', breezyController.getPosition);
router.post('/positions', breezyController.createPosition);
router.put('/positions/:positionId', breezyController.updatePosition);
router.delete('/positions/:positionId', breezyController.deletePosition);

// ============= CANDIDATES =============
router.get('/positions/:positionId/candidates', breezyController.getCandidates);
router.get('/positions/:positionId/candidates/:candidateId', breezyController.getCandidate);
router.post('/positions/:positionId/candidates', breezyController.addCandidate);
router.put('/positions/:positionId/candidates/:candidateId', breezyController.updateCandidate);
router.delete('/positions/:positionId/candidates/:candidateId', breezyController.deleteCandidate);

// ============= STAGES =============
router.get('/positions/:positionId/stages', breezyController.getStages);
router.put('/positions/:positionId/candidates/:candidateId/stage', breezyController.moveCandidateStage);

// ============= COMMENTS =============
router.get('/positions/:positionId/candidates/:candidateId/comments', breezyController.getComments);
router.post('/positions/:positionId/candidates/:candidateId/comments', breezyController.addComment);

// ============= COMPANY =============
router.get('/company/users', breezyController.getCompanyUsers);

// ============= STATS =============
router.get('/positions/:positionId/stats', breezyController.getPositionStats);

// ============= WEBHOOKS =============
router.get('/webhooks', breezyController.getWebhooks);

module.exports = router;