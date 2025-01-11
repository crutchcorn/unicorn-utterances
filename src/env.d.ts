interface ImportMetaEnv {
	readonly DISCORD_TOKEN: string;
	readonly DISCORD_GUILD_ID: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
