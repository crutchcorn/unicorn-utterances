export interface SnitipMetadata {
	href?: string;
	icon?: string;
	title: string;
	content: string;
	links: SnitipLink[];
	tags: string[];
}

export interface SnitipLink {
	name: string;
	href: string;
}
