const { HindsightClient } = require('@vectorize-io/hindsight-client');

const client = new HindsightClient({ baseUrl: 'http://localhost:8888' });

// Retain a memory
async function RetainMemory(id, abstract){
    await client.retain(id, abstract);
}

// Recall memories
async function RecallMemory(id, abstract){
    const response = await client.recall(id, abstract);
    for (const r of response.results) {
        console.log(r.text);
    }
    return response;
}

// Reflect - generate response with disposition
async function reflect(id, abstract) {
    const answer = await client.reflect('my-bank', 'Tell me about Alice');
    console.log(answer.text);
    return answer;
}

module.exports = {
    reflect,
    RecallMemory,
    RetainMemory
}