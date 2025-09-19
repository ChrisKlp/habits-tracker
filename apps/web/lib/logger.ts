// lib/server-logger.ts

const colors = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function pad(n: number) {
  return n < 10 ? '0' + n : '' + n;
}

function time() {
  const d = new Date();
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hour = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return colors.gray + `${date} ${hour}.${ms}` + colors.reset;
}

export const logger = {
  log: (msg: string) => {
    console.log(`${time()} [LOG] ${msg}`);
  },
  info: (msg: string) => {
    console.log(`${time()} ${colors.green}[INFO]${colors.reset} ${msg}`);
  },
  warn: (msg: string) => {
    console.warn(`${time()} ${colors.yellow}[WARN]${colors.reset} ${msg}`);
  },
  error: (msg: string) => {
    console.error(`${time()} ${colors.red}[ERROR]${colors.reset} ${msg}`);
  },
  serverAction: (name: string) => {
    console.log(`${time()} ${colors.magenta}[SERVER ACTION]${colors.reset} ${name}`);
  },
  serverFetch: (url: string, method = 'GET', status?: number, durationMs?: number) => {
    const statusColor =
      status == null
        ? colors.gray
        : status >= 500
          ? colors.red
          : status >= 400
            ? colors.yellow
            : colors.green;

    const dur = durationMs != null ? colors.gray + ` (${durationMs}ms)` + colors.reset : '';

    console.log(
      `${time()} ${colors.yellow}[SERVER FETCH]${colors.reset} ${method} ${url} ${
        status != null ? statusColor + status + colors.reset : ''
      }${dur}`
    );
  },
  clientFetch: (url: string, method = 'GET', status?: number, durationMs?: number) => {
    const statusColor =
      status == null
        ? colors.gray
        : status >= 500
          ? colors.red
          : status >= 400
            ? colors.yellow
            : colors.green;

    const dur = durationMs != null ? colors.gray + ` (${durationMs}ms)` + colors.reset : '';

    console.log(
      `${time()} ${colors.cyan}[CLIENT FETCH]${colors.reset} ${method} ${url} ${
        status != null ? statusColor + status + colors.reset : ''
      }${dur}`
    );
  },
};
