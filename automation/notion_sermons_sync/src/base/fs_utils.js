import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';

function filePath(fileName) {
  if (fileName.startsWith('.')) {
    return fileName;
  }
  return path.join(process.cwd(), fileName);
}

async function readFileAsJson(fileName) {
  const finalPath = filePath(fileName);
  const content = await fs.readFile(finalPath);
  return JSON.parse(content);
}

async function writeJsonToFile(json, fileName) {
  const finalPath = filePath(fileName);
  await fs.writeFile(finalPath, JSON.stringify(json));
}

export {
  filePath,
  readFileAsJson,
  writeJsonToFile,
};
