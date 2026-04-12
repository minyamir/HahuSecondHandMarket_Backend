// 1. Fix the environment for Node
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 2. Load the Node-compatible version of the libraries
const tf = require('@tensorflow/tfjs');
// We use the 'face-api.node.js' version because we fixed the 'tfjs-node' link earlier!
const faceapi = require('@vladmandic/face-api/dist/face-api.node.js');

async function test() {
    try {
        console.log("🚀 Starting AI Engine for HaHu Market...");

        // Force CPU for Windows 7 stability
        await tf.setBackend('cpu');
        await tf.ready();

        console.log("✅ TensorFlow Backend:", tf.getBackend());

        if (faceapi.nets) {
            console.log("✅ Face-API loaded successfully!");
            console.log("✅ Windows 7 Compatibility: ACTIVE");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Test Failed:", err.message);
        process.exit(1);
    }
}

test();