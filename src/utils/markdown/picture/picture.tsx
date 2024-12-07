/** @jsxRuntime automatic */
import type { GetPictureResult } from "utils/get-picture";
import type { Element } from "hast";

interface PictureProps {
	result: GetPictureResult;
	alt?: string;
	zoomSrc?: string;
	noZoom?: boolean;
	imgAttrs: Record<string, unknown>;
}

/** @jsxImportSource hastscript */
export function Picture(props: PictureProps): Element {
	return (
		<picture>
			{props.result.sources.map((s) => (
				<source {...s} />
			))}
			<img
				{...props.result.image}
				alt={props.alt}
				loading="lazy"
				decoding="async"
				data-zoom-src={props.zoomSrc}
				data-nozoom={props.noZoom}
				{...props.imgAttrs}
			/>
		</picture>
	) as never;
}
