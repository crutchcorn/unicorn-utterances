/** @jsxRuntime automatic */
import { Node, Element } from "hast";
import { fromHtml } from "hast-util-from-html";
import { promises as fs } from "fs";

const fullscreen = await fs.readFile("src/icons/fullscreen.svg", "utf8");
const FullscreenIcon = fromHtml(fullscreen, { fragment: true })
	.children[0] as Element;
FullscreenIcon.properties["aria-hidden"] = "true";

const launch = await fs.readFile("src/icons/launch.svg", "utf8");
const LaunchIcon = fromHtml(launch, { fragment: true }).children[0] as Element;
LaunchIcon.properties["aria-hidden"] = "true";

interface LinkPreviewProps {
	type: "zoom" | "link";
	label: string;
	children: Node[];
	anchorAttrs: Record<string, unknown>;
}

/** @jsxImportSource hastscript */
export function LinkPreview(props: LinkPreviewProps): Element {
	return (
		<a class={`link-preview`} {...props.anchorAttrs}>
			<span class={`anchored-tooltip anchored-tooltip--${props.type}`}>
				{props.type === "zoom" ? FullscreenIcon : LaunchIcon}
				<span>{props.label}</span>
			</span>
			{props.children}
		</a>
	) as never;
}
