import { spawn } from 'node:child_process';

const removeLocalStorageFlag = (nodeOptions = '') => {
  if (!nodeOptions.includes('--localstorage-file')) {
    return nodeOptions;
  }

  const parts = nodeOptions.split(/\s+/).filter(Boolean);
  const sanitized = [];

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];

    if (part === '--localstorage-file') {
      // Skip the flag and its value (if present).
      if (parts[index + 1] && !parts[index + 1].startsWith('-')) {
        index += 1;
      }
      continue;
    }

    if (part.startsWith('--localstorage-file=')) {
      continue;
    }

    sanitized.push(part);
  }

  return sanitized.join(' ');
};

const sanitizedNodeOptions = removeLocalStorageFlag(process.env.NODE_OPTIONS);
const env = {
  ...process.env,
};

if (sanitizedNodeOptions) {
  env.NODE_OPTIONS = sanitizedNodeOptions;
} else {
  delete env.NODE_OPTIONS;
}

const child = spawn('vitest', process.argv.slice(2), {
  stdio: 'inherit',
  env,
  shell: false,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
