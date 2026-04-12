import fs from 'fs';
import path from 'path';

const nodeModulesPath = path.join(process.cwd(), 'node_modules');
const targetPath = path.join(nodeModulesPath, '@tensorflow', 'tfjs-node');

if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
}

// We point to the 'tfjs' dist but specifically a file that doesn't use 'import'
const pkgJson = {
    name: "@tensorflow/tfjs-node",
    main: "../../@tensorflow/tfjs/dist/tf.node.js", 
    version: "4.22.0"
};

fs.writeFileSync(
    path.join(targetPath, 'package.json'), 
    JSON.stringify(pkgJson, null, 2)
);

console.log("✅ Alias updated to CommonJS compatibility!");