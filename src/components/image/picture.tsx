import {
	getPictureAttrs,
	getPictureUrls,
	GetPictureOptions,
	GetPictureUrls,
} from "utils/get-picture";
import type { JSX } from "preact";
interface PictureProps extends GetPictureOptions {
	urls?: GetPictureUrls;
                       	alt: string;
                       	class?: string;
	pictureAttrs?: JSX.HTMLAttributes<HTMLPictureElement> &
		Record<string, unknown>;
	imgAttrs?: JSX.HTMLAttributes<HTMLImageElement> & Record<string, unknown>;
}

export const Picture = ({
	alt,
	class: className,
	pictureAttrs,
	imgAttrs,
	urls,
	...props
}: PictureProps) => {
	const pictureUrls = urls ?? getPictureUrls(props);
	const pictureResult = getPictureAttrs(props, pictureUrls);
	return (
		<picture class={className} {...pictureAttrs}>
			{pictureResult.sources.map((attrs) => (
				<source {...attrs} />
			))}
			<img alt={alt} {...pictureResult.image} {...imgAttrs} />
		</picture>
	);
};
