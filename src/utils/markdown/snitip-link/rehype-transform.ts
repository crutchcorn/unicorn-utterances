import { Root } from "hast";
import { SKIP, visit } from "unist-util-visit";
import { Plugin } from "unified";
import { Element } from "hast";
import { SnitipLink } from "./SnitipLink";
import { SnitipMetadata } from "types/SnitipInfo";
import { MarkdownVFile } from "../types";
import { logError } from "../logger";

export const rehypeSnitipLinks: Plugin<[], Root> = () => {
	return (tree, vfile) => {
		visit(
			tree,
			{ type: "element", tagName: "a" },
			(node: Element, index, parent) => {
				if (!parent || index === undefined) {
					return;
				}

				const href = String(node.properties.href);
				if (!href.startsWith("pfp-snitip:")) {
					return;
				}

				const snitipType = href[11];
				const snitipId = href.substring(12);

				let snitip: SnitipMetadata | undefined;
				if (snitipType === "#") {
					snitip = (vfile as MarkdownVFile).data.snitips.get(snitipId);
				}

				if (!snitip) {
					logError(
						vfile,
						node,
						`Could not resolve snitip link to any known snitips: ${href}`,
					);
					return;
				}

				parent.children[index] = SnitipLink({
					id: snitipId,
					snitip,
					children: node.children,
				});

				return SKIP;
			},
		);
	};
};
