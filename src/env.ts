type Env = {
	NODE_ENV: "development" | "production";
	SQLITE_DB_PATH: string;
	RAILWAY_API_URL: string;
	RAILWAY_PROJECT_TOKEN: string;
	RAILWAY_ENVIRONMENT_ID: string;
	RAILWAY_ENVIRONMENT_NAME: string;
	RAILWAY_PROJECT_ID: string;
	RAILWAY_PROJECT_NAME: string;
};

export const env: Env = {
	NODE_ENV: ["development", "production"].includes(
		import.meta.env.NODE_ENV + "",
	)
		? (import.meta.env.NODE_ENV as "development" | "production")
		: "development",
	SQLITE_DB_PATH: import.meta.env.SQLITE_DB_PATH ?? "/data/monirail.sqlite",
	RAILWAY_API_URL:
		import.meta.env.RAILWAY_API_URL ||
		"https://backboard.railway.app/graphql/v2",
	RAILWAY_PROJECT_TOKEN: import.meta.env.RAILWAY_PROJECT_TOKEN ?? "",
	RAILWAY_ENVIRONMENT_ID: import.meta.env.RAILWAY_ENVIRONMENT_ID ?? "",
	RAILWAY_ENVIRONMENT_NAME: import.meta.env.RAILWAY_ENVIRONMENT_NAME ?? "",
	RAILWAY_PROJECT_ID: import.meta.env.RAILWAY_PROJECT_ID ?? "",
	RAILWAY_PROJECT_NAME: import.meta.env.RAILWAY_PROJECT_NAME ?? "",
};

Object.entries(env).forEach(([key, value]) => {
	if (value === "") {
		throw new Error("Missing environment variable: " + key);
	}
});
