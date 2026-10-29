const RESET = "\x1b[0m";

const COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function colorLog(color: string, ...args: unknown[]) {
  console.log(color, ...args, RESET);
}

export function Red(...args: unknown[]) {
  colorLog(COLORS.red, ...args);
}

export function Green(...args: unknown[]) {
  colorLog(COLORS.green, ...args);
}

export function Yellow(...args: unknown[]) {
  colorLog(COLORS.yellow, ...args);
}

export function Blue(...args: unknown[]) {
  colorLog(COLORS.blue, ...args);
}