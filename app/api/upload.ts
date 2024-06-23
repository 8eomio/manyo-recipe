import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to parse form data
const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields, files: formidable.Files }> => 
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      }
      resolve({ fields, files });
    });
  });

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { files } = await parseForm(req);
    const file = files.file as formidable.File;

    const oldPath = file.filepath;
    const newPath = path.join(process.cwd(), "public", "uploads", file.originalFilename);

    fs.renameSync(oldPath, newPath);

    const pythonProcess = spawn("python3", ["ocr.py", newPath]);

    let ocrOutput = '';
    pythonProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      ocrOutput += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      res.status(200).json({ message: "File uploaded and processed successfully", ocrOutput });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error processing the file" });
  }
};

export default handler;
