import rehypeShiki, { type RehypeShikiOptions } from "@shikijs/rehype";
import type { Root } from "hast";
import type { Plugin } from "unified";
import {
	transformerMetaHighlight,
	transformerNotationHighlight,
	transformerRemoveLineBreak,
} from "@shikijs/transformers";
import { codeToHtml as shikiCodeToHtml } from 'shiki'

const shikiOpts = {
	themes: {
		light: "github-light",
		dark: "github-dark",
	},
	transformers: [
		// supports "[!code highlight]" transforms to add a .highlight class
		transformerNotationHighlight({
			classActiveLine: "highlight",
		}),
		// supports "``` {1,3-4}" transforms to add a .highlight class
		transformerMetaHighlight({
			className: "highlight",
		}),
		transformerRemoveLineBreak(),
	],
};

export const rehypeShikiUU: [
	Plugin<[RehypeShikiOptions], Root, Root>,
	RehypeShikiOptions,
] = [
		rehypeShiki as never,
		shikiOpts,
	];

export const codeToHtml = async (code: string, lang?: string): Promise<string> => {
	return shikiCodeToHtml(code, {
		lang: lang ?? "plaintext",
		...shikiOpts
	})
}
