
async function initialize() {
    await loadModels(); // load embedder & generator

    let embeddingIndex;
    const currentHash = computeDocumentsHash();
    const hasCache = fs.existsSync(indexPath) &&
                     fs.existsSync(metaPath) &&
                     fs.existsSync(hashPath);

    if (hasCache) {
        const savedHash = fs.readFileSync(hashPath, "utf-8");
        docs = JSON.parse(fs.readFileSync(metaPath, "utf-8"));

        if (savedHash === currentHash) {
            // Load cached embeddings
            const cachedEmbeddings = JSON.parse(fs.readFileSync(indexPath, "utf-8")); //IndexFlatL2.read(indexPath);
            embeddingIndex = new IndexFlatL2({ dims: embeddingDim });
            await embeddingIndex.add(cachedEmbeddings) //.add(cachedEmbeddings);
            console.log(`⚡ Loaded cached FAISS index, ntotal: ${embeddingIndex.ntotal()}`);
        } else {
            // Rebuild index from existing docs
            embeddingIndex = new Index({ type: 'HNSW', dims: embeddingDim });
            const embeddings = [];
            for (const doc of docs) {
                const emb = await embedder(doc.content, { pooling: "mean", normalize: true });
                embeddings.push(Array.from(emb.data));
            }
            await embeddingIndex.add(embeddings);
            console.log(`⚡ Rebuilt FAISS index, ntotal: ${embeddingIndex.ntotal()}`);
        }
    } else {
        // No cache: build from scratch
        try{
            const inputFolder = path.join(__dirname, "Input_JSON");
            docs = getAllDocsFromInputJSON(inputFolder);
            console.log(`⚡ Loaded ${docs.length} documents from Input_JSON`);
            embeddingIndex = new Index({ type: 'HNSW', dims: embeddingDim });
            const embeddings = [];
            for (const doc of docs) {
                // Skip anything that isn’t an object or missing content
                if (doc && typeof doc.content === "string" && doc.content.trim() !== "") {
                    const emb = await embedder(doc.content, { pooling: "mean", normalize: true });
                    embeddings.push(Array.from(emb.data));
                } else {
                    console.warn("⚠️ Skipping doc with invalid content:", doc);
                }
            }
            await embeddingIndex.add(embeddings);
            console.log(`⚡ Built new FAISS index, ntotal: ${embeddingIndex.ntotal()}`);
        }catch (err) {
            console.error("FAISS search failed:", err);
            return [];
        }
    }

    // Save for next time
    const embeddingsArray = await embeddingIndex.getAllVectors(); // pseudo-method
    fs.writeFileSync(metaPath, JSON.stringify(docs), "utf-8");
    fs.writeFileSync(indexPath, JSON.stringify(embeddingsArray), "utf-8");
    fs.writeFileSync(hashPath, currentHash, "utf-8");

    return embeddingIndex;
}

module.exports = {
    initialize
}