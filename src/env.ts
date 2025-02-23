import process from "node:process";

type Env = {
	NODE_ENV: "development" | "production";
	SQLITE_DB_FILE: string;
	RAILWAY_API_URL: string;
	RAILWAY_PROJECT_TOKEN: string;
	RAILWAY_PROJECT_ID: string;
	RAILWAY_PROJECT_NAME: string;
	RAILWAY_ENVIRONMENT_ID: string;
	RAILWAY_ENVIRONMENT_NAME: string;
	RAILWAY_SERVICE_ID: string;
	RAILWAY_SERVICE_NAME: string;
};

export const env: Env = {
	NODE_ENV: ["development", "production"].includes(process.env.NODE_ENV + "")
		? (process.env.NODE_ENV as "development" | "production")
		: "development",
	SQLITE_DB_FILE: process.env.SQLITE_DB_FILE || "/data/monirail.sqlite",
	RAILWAY_API_URL:
		process.env.RAILWAY_API_URL || "https://backboard.railway.app/graphql/v2",
	RAILWAY_PROJECT_TOKEN: process.env.RAILWAY_PROJECT_TOKEN ?? "",
	RAILWAY_PROJECT_ID: process.env.RAILWAY_PROJECT_ID ?? "",
	RAILWAY_PROJECT_NAME: process.env.RAILWAY_PROJECT_NAME ?? "",
	RAILWAY_ENVIRONMENT_ID: process.env.RAILWAY_ENVIRONMENT_ID ?? "",
	RAILWAY_ENVIRONMENT_NAME: process.env.RAILWAY_ENVIRONMENT_NAME ?? "",
	RAILWAY_SERVICE_ID: process.env.RAILWAY_SERVICE_ID ?? "",
	RAILWAY_SERVICE_NAME: process.env.RAILWAY_SERVICE_NAME ?? "",
};

Object.entries(env).forEach(([key, value]) => {
	if (value === "") {
		throw new Error("Missing environment variable: " + key);
	}
});
