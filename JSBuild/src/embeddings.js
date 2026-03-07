// embeddings.js
const faiss = require("faiss-node");
const embeddingDim = 384; // fixed vector length
let embeddingIndex = null;
let docs = [];

function initFAISS() {
  embeddingIndex = new faiss.IndexFlatL2(embeddingDim);
  docs = [];
  console.log("⚡ FAISS index initialized with dimension", embeddingDim);
}

/**
 * Add vectors and metadata to FAISS
 * @param {Float32Array[]} vectors 
 * @param {any[]} metadatas 
 */
function addToFAISS(vectors, metadatas) {
  if (!embeddingIndex) throw new Error("FAISS index not initialized");
  if (vectors.length !== metadatas.length)
    throw new Error("Vectors and metadata count mismatch");

  const flatEmbeddings = new Float32Array(vectors.length * embeddingDim);
  vectors.forEach((vec, i) => flatEmbeddings.set(vec, i * embeddingDim));

  embeddingIndex.add(flatEmbeddings, vectors.length);
  docs.push(...metadatas);

  console.log(`✅ Added ${vectors.length} vectors to FAISS index`);
}

/**
 * Search top-k nearest neighbors
 * @param {Float32Array} query 
 * @param {number} k 
 */
function searchFAISS(query, k = 5) {
  if (!embeddingIndex) throw new Error("FAISS index not initialized");

  const distances = new Float32Array(k);
  const labels = new BigInt64Array(k);

  embeddingIndex.search(query, k, distances, labels);

  return Array.from(labels)
    .map(i => docs[Number(i)])
    .filter(Boolean);
}

/**
 * Deterministic local embedding
 * @param {string} doc
 * @param {number} size
 */
function embedText(doc, size = embeddingDim) {
  const vec = new Float32Array(size);
  for (let i = 0; i < doc.length; i++) {
    vec[i % size] += doc.charCodeAt(i);
  }

  // Optional: normalize for cosine similarity
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < size; i++) vec[i] /= norm;
  }

  return vec;
}

module.exports = {
  initFAISS,
  addToFAISS,
  searchFAISS,
  embedText,
  embeddingDim,
  faiss 
};