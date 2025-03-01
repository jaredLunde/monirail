import { env } from "./env";

// log.ts
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

// Color codes
const colors = {
	reset: "\x1b[0m",
	dim: "\x1b[2m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	magenta: "\x1b[35m",
	green: "\x1b[32m",
};

// Level color mapping
const levelColors = {
	debug: colors.blue,
	info: colors.cyan,
	warn: colors.yellow,
	error: colors.red,
	fatal: colors.magenta,
};

// Level display names
const levelNames = {
	debug: "DEBU",
	info: "INFO",
	warn: "WARN",
	error: "ERRO",
	fatal: "FATA",
};

function formatTime(): string {
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, "0");
	const minutes = now.getMinutes().toString().padStart(2, "0");
	return `${hours}:${minutes}AM`;
}

// Improved object formatter
function formatObject(obj: any, depth = 0, maxDepth = 2): string {
	if (depth > maxDepth) return "...";

	if (obj === null || obj === undefined) {
		return `${obj}`;
	}

	// Handle arrays
	if (Array.isArray(obj)) {
		if (obj.length === 0) return "[]";

		if (depth === maxDepth) {
			return `[${obj.length} items]`;
		}

		// For simple arrays with primitive values
		if (obj.every((item) => typeof item !== "object" || item === null)) {
			return `[${obj.join(", ")}]`;
		}

		// For arrays with more complex items, format each
		const result = obj
			.map((item, i) => {
				// For the first few items in large arrays
				if (i > 3 && obj.length > 5) {
					return i === 4 ? `...${obj.length - 4} more items` : null;
				}

				if (typeof item === "object" && item !== null) {
					return formatObject(item, depth + 1, maxDepth);
				}
				return String(item);
			})
			.filter(Boolean)
			.join(", ");

		return `[${result}]`;
	}

	// Handle objects
	if (typeof obj === "object") {
		// Special case for common objects
		if (obj instanceof Date) {
			return obj.toISOString();
		}

		if (obj instanceof Error) {
			return obj.message;
		}

		const entries = Object.entries(obj);
		if (entries.length === 0) return "{}";

		if (depth === maxDepth) {
			return `{${entries.length} properties}`;
		}

		// Format key/value pairs
		const result = entries
			.map(([key, value], i) => {
				// For the first few properties in large objects
				if (i > 3 && entries.length > 5) {
					return i === 4 ? `...${entries.length - 4} more properties` : null;
				}

				const formatted =
					typeof value === "object" && value !== null
						? formatObject(value, depth + 1, maxDepth)
						: String(value);

				return `${key}: ${formatted}`;
			})
			.filter(Boolean)
			.join(", ");

		return `{${result}}`;
	}

	// Other types
	return String(obj);
}

function formatKeyValue(key: string, value: any): string {
	if (value === null || value === undefined) {
		return "";
	}

	let formattedValue = value;
	if (typeof value === "object" && value !== null) {
		formattedValue = formatObject(value);
	}

	return `${colors.dim}${key}=${colors.reset}${formattedValue}`;
}

export interface LogOptions {
	level?: LogLevel;
}

export function createLogger(options: LogOptions = {}) {
	const minLevel = options.level || "debug";
	const levelPriority = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };

	function shouldLog(level: LogLevel): boolean {
		return levelPriority[level] >= levelPriority[minLevel];
	}

	function formatMessage(
		level: LogLevel,
		message: string,
		data?: Record<string, any>,
	): string {
		const logFormat = env.LOG_FORMAT;
		const time = formatTime();
		const levelColor = levelColors[level];
		const levelName = levelNames[level];

		if (logFormat === "json") {
			const logData = {
				time,
				level: levelName,
				message,
				...data,
			};
			return JSON.stringify(logData);
		}

		let result = `${time} ${levelColor}${levelName}${colors.reset} ${message}`;

		if (data && Object.keys(data).length > 0) {
			// Handle single key-value pairs on the same line
			if (Object.keys(data).length === 1) {
				const key = Object.keys(data)[0];
				result += ` ${formatKeyValue(key, data[key])}`;
			} else {
				// Format more complex data on the next line with indentation
				result += "\n";
				for (const [key, value] of Object.entries(data)) {
					if (Array.isArray(value)) {
						result += `    ${colors.dim}${key}=${colors.reset}\n`;

						// Format array items with improved display
						value.slice(0, 5).forEach((item, index) => {
							const displayValue =
								typeof item === "object" && item !== null
									? formatObject(item, 1)
									: item;
							result += `    ${colors.dim}│${colors.reset} ${displayValue}\n`;
						});

						if (value.length > 5) {
							result += `    ${colors.dim}|${colors.reset} ... ${value.length - 5} more items\n`;
						}
					} else if (typeof value === "object" && value !== null) {
						const entries = Object.entries(value);
						result += `    ${colors.dim}${key}=${colors.reset}\n`;

						// Format object properties with improved display
						entries.slice(0, 5).forEach(([k, v]) => {
							const displayValue =
								typeof v === "object" && v !== null ? formatObject(v, 1) : v;
							result += `    ${colors.dim}|${colors.reset} ${k}: ${displayValue}\n`;
						});

						if (entries.length > 5) {
							result += `    ${colors.dim}|${colors.reset} ... ${entries.length - 5} more properties\n`;
						}
					} else {
						result += `    ${formatKeyValue(key, value)}\n`;
					}
				}
			}
		}

		return result.trimEnd();
	}

	return {
		debug(message: string, data?: Record<string, any>) {
			if (shouldLog("debug")) {
				console.log(formatMessage("debug", message, data));
			}
		},

		info(message: string, data?: Record<string, any>) {
			if (shouldLog("info")) {
				console.log(formatMessage("info", message, data));
			}
		},

		warn(message: string, data?: Record<string, any>) {
			if (shouldLog("warn")) {
				console.log(formatMessage("warn", message, data));
			}
		},

		error(message: string, data?: Record<string, any>) {
			if (shouldLog("error")) {
				console.log(formatMessage("error", message, data));
			}
		},

		fatal(message: string, data?: Record<string, any>) {
			if (shouldLog("fatal")) {
				console.log(formatMessage("fatal", message, data));
			}
		},
	};
}

// Default logger
export const log = createLogger();
