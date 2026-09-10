import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';

const execPromise = util.promisify(exec);

/**
 * Converts uploaded PowerPoint file (.pptx / .ppt) to a visual PDF version for exact slide rendering in workspace.
 */
export const convertPptToPdf = async (filePath, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  if (ext === '.pdf') {
    return null;
  }

  const uploadsDir = path.dirname(filePath);
  const baseName = path.basename(filePath, ext);
  const pdfFileName = `${baseName}.pdf`;
  const pdfDiskPath = path.join(uploadsDir, pdfFileName);

  try {
    const absInput = path.resolve(filePath).replace(/\\/g, '\\\\');
    const absOutput = path.resolve(pdfDiskPath).replace(/\\/g, '\\\\');

    // PowerShell script using PowerPoint COM Automation
    const psCommand = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; try { $ppt = New-Object -ComObject PowerPoint.Application; $pres = $ppt.Presentations.Open('${absInput}', [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse); $pres.SaveAs('${absOutput}', 32); $pres.Close(); $ppt.Quit(); [System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null; Write-Host 'SUCCESS_CONVERTED' } catch { Write-Error $_.Exception.Message; exit 1 }"`;

    await execPromise(psCommand, { timeout: 30000 });
    
    if (fs.existsSync(pdfDiskPath) && fs.statSync(pdfDiskPath).size > 0) {
      console.log(`[PPTX Engine] Converted ${originalName} -> ${pdfFileName}`);
      return `/uploads/${pdfFileName}`;
    }
  } catch (err) {
    console.warn(`[PPTX Engine Notice] PowerPoint COM conversion notice: ${err.message}`);
  }

  return null;
};
