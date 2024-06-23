import { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const pythonProcess = spawn('python3', ['ocr.py']);

  let ocrOutput = '';
  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    ocrOutput += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    res.status(200).json({ message: 'OCR executed successfully', ocrOutput });
  });
};

export default handler;
