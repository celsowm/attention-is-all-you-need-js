import { execSync } from 'child_process';

const ports = [8787, 5173];

for (const port of ports) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`).toString();
    const lines = output.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && pid !== 'PID') {
        console.log(`[cleanup] Killing process ${pid} using port ${port}`);
        try {
          execSync(`taskkill /F /PID ${pid}`);
        } catch (killError) {
          // If the process is already gone, ignore
        }
      }
    }
  } catch (e) {
    // Port not in use, ignore
  }
}
