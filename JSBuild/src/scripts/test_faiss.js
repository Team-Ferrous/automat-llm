const path = require('path');

try {
  const faiss = require(path.resolve(__dirname, '../node_modules/faiss-node/build/Release/faiss-node'));
  console.log('✅ Module loaded!');
  console.log('Exported keys:', Object.keys(faiss));
} catch (err) {
  console.error('❌ Failed to load Faiss:', err);
}