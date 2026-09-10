import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

/**
 * Discovers the LibreOffice binary path across Windows, Linux, and macOS.
 */
function findLibreOfficePath() {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';

  if (isWindows) {
    const commonWinPaths = [
      'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
      'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'LibreOffice', 'program', 'soffice.exe')
    ];
    for (const p of commonWinPaths) {
      if (fs.existsSync(p)) return `"${p}"`;
    }
  } else if (isMac) {
    const macPath = '/Applications/LibreOffice.app/Contents/MacOS/soffice';
    if (fs.existsSync(macPath)) return `"${macPath}"`;
  }

  // Check if soffice or libreoffice is in system PATH
  try {
    const checkCmd = isWindows ? 'where soffice' : 'which libreoffice || which soffice';
    const output = execSync(checkCmd, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    if (output) {
      return `"${output.split('\n')[0].trim()}"`;
    }
  } catch (e) {
    // Not in PATH
  }

  return null;
}

/**
 * Converts a PPTX/PPT file to PDF using Microsoft PowerPoint COM Automation on Windows.
 */
async function convertViaPowerPointCom(inputPath, outputPath) {
  const resolvedInput = path.resolve(inputPath).replace(/'/g, "''");
  const resolvedOutput = path.resolve(outputPath).replace(/'/g, "''");

  const psScript = `
$ErrorActionPreference = 'Stop'
$pp = $null
$pres = $null
try {
    $pp = New-Object -ComObject PowerPoint.Application
    # Presentations.Open(fileName, ReadOnly=-1, Untitled=0, WithWindow=-1)
    $pres = $pp.Presentations.Open('${resolvedInput}', -1, 0, -1)
    # ppSaveAsPDF = 32
    $pres.SaveAs('${resolvedOutput}', 32)
    $pres.Close()
    $pp.Quit()
} catch {
    if ($pres) { try { $pres.Close() } catch {} }
    if ($pp) { try { $pp.Quit() } catch {} }
    throw $_
} finally {
    if ($pres) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pres) | Out-Null }
    if ($pp) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pp) | Out-Null }
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
`;

  const encodedScript = Buffer.from(psScript, 'utf16le').toString('base64');
  const command = `powershell.exe -NoProfile -NonInteractive -EncodedCommand ${encodedScript}`;

  await execAsync(command, { timeout: 45000 });
}

/**
 * Converts a PPTX/PPT file to PDF using LibreOffice headless.
 */
async function convertViaLibreOffice(libreOfficeBin, inputPath, outDir) {
  const resolvedInput = path.resolve(inputPath);
  const resolvedOutDir = path.resolve(outDir);
  const cmd = `${libreOfficeBin} --headless --invisible --convert-to pdf --outdir "${resolvedOutDir}" "${resolvedInput}"`;

  await execAsync(cmd, { timeout: 45000 });
}

/**
 * Main conversion pipeline: Converts PPTX/PPT to PDF.
 * Returns the relative URL to the generated PDF (e.g., /uploads/filename.pdf) or null if conversion failed.
 */
export async function convertPptToPdf(inputFilePath, uploadsDir = 'uploads') {
  const absInput = path.resolve(inputFilePath);
  const absUploads = path.resolve(process.cwd(), uploadsDir);

  if (!fs.existsSync(absInput)) {
    throw new Error(`Input presentation file does not exist: ${absInput}`);
  }

  const baseName = path.basename(absInput, path.extname(absInput));
  const outputFileName = `${baseName}_rendered.pdf`;
  const absOutput = path.join(absUploads, outputFileName);

  // Return existing cached PDF if already generated and newer than source
  if (fs.existsSync(absOutput)) {
    try {
      const srcStat = fs.statSync(absInput);
      const outStat = fs.statSync(absOutput);
      if (outStat.size > 1000 && outStat.mtime >= srcStat.mtime) {
        return `/uploads/${outputFileName}`;
      }
    } catch (e) {}
  }

  const isWindows = process.platform === 'win32';
  let converted = false;
  let lastError = null;

  // Strategy 1: Try PowerPoint COM on Windows if running in a Windows environment
  if (isWindows) {
    try {
      console.log(`[PPT Conversion] Attempting high-fidelity conversion via Microsoft PowerPoint COM...`);
      await convertViaPowerPointCom(absInput, absOutput);
      if (fs.existsSync(absOutput) && fs.statSync(absOutput).size > 1000) {
        console.log(`[PPT Conversion] Successfully converted via PowerPoint COM: ${outputFileName}`);
        converted = true;
      }
    } catch (err) {
      console.warn(`[PPT Conversion] PowerPoint COM attempt notice:`, err.message);
      lastError = err;
    }
  }

  // Strategy 2: Try LibreOffice headless
  if (!converted) {
    const libreOfficeBin = findLibreOfficePath();
    if (libreOfficeBin) {
      try {
        console.log(`[PPT Conversion] Attempting conversion via LibreOffice (${libreOfficeBin})...`);
        await convertViaLibreOffice(libreOfficeBin, absInput, absUploads);
        // LibreOffice creates <baseName>.pdf in outDir
        const standardLibreOutput = path.join(absUploads, `${baseName}.pdf`);
        if (fs.existsSync(standardLibreOutput)) {
          if (standardLibreOutput !== absOutput) {
            fs.copyFileSync(standardLibreOutput, absOutput);
          }
          console.log(`[PPT Conversion] Successfully converted via LibreOffice: ${outputFileName}`);
          converted = true;
        }
      } catch (err) {
        console.warn(`[PPT Conversion] LibreOffice conversion notice:`, err.message);
        lastError = err;
      }
    }
  }

  if (converted && fs.existsSync(absOutput)) {
    return `/uploads/${outputFileName}`;
  }

  console.warn(`[PPT Conversion] Headless PPTX->PDF conversion unavailable or failed: ${lastError?.message || 'No converter found'}`);
  return null;
}
