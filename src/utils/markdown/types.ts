import { VFile } from "vfile";
import { PostHeadingInfo } from "types/PostInfo";
import { SnitipMetadata } from "types/SnitipInfo";

export type MarkdownKind = "post" | "collection" | "unicorn" | "page";

export type MarkdownFileInfo = {
	kind: MarkdownKind;
	file: string;
};

export interface MarkdownVFile extends VFile {
	data: {
		kind: MarkdownKind;
		file: string;
		headingsWithIds: PostHeadingInfo[];
		snitips: Map<string, SnitipMetadata>;
	};
}

export function isMarkdownVFile(obj: unknown): obj is MarkdownVFile {
	return (
		(typeof obj === "object" &&
			obj &&
			"data" in obj &&
			typeof obj.data === "object" &&
			obj.data &&
			"kind" in obj.data) ??
		false
	);
}
