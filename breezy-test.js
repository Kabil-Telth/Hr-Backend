// test-breezy.js
require('dotenv').config();
const breezyService = require('./modules/breezy/breezy.service');

async function testBreezy() {
  console.log('🧪 Testing Breezy HR Integration...\n');
  
  try {
    // 1. Test connection
    console.log('1. Testing API connection...');
    const users = await breezyService.getCompanyUsers();
    console.log(`✅ Connected! Found ${users.length} users\n`);
    
    // 2. Get positions
    console.log('2. Getting positions...');
    const positions = await breezyService.getAllPositions();
    console.log(`✅ Found ${positions.length} positions\n`);
    
    if (positions.length > 0) {
      const position = positions[0];
      console.log(`3. Testing with position: ${position.name}`);
      
      // 3. Get position details
      const positionDetails = await breezyService.getPosition(position._id);
      console.log(`   📍 Location: ${positionDetails.location}\n`);
      
      // 4. Get candidates
      const candidates = await breezyService.getCandidates(position._id);
      console.log(`   👥 Candidates: ${candidates.length}\n`);
      
      // 5. Get stages
      const stages = await breezyService.getStages(position._id);
      console.log(`   📊 Stages: ${stages?.length || 0}\n`);
    }
    
    console.log('🎉 All tests passed! Breezy HR is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check BREEZY_API_KEY in .env');
    console.log('2. Check BREEZY_COMPANY_ID in .env');
    console.log('3. Verify your Breezy HR account has API access');
  }
}

testBreezy();