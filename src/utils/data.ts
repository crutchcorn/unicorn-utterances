import {
	RawCollectionInfo,
	PersonInfo,
	RawPostInfo,
	PostInfo,
	CollectionInfo,
	TagInfo,
	RawPersonInfo,
} from "types/index";
import * as fs from "fs/promises";
import path, { join } from "path";
import { isNotJunk as baseIsNotJunk } from "junk";
import { getImageSize } from "../utils/get-image-size";
import { resolvePath } from "./url-paths";
import matter from "gray-matter";
import dayjs from "dayjs";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkToRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { rehypePlayfulElementMap } from "./markdown/rehype-playful-element-map";
import { getExcerpt } from "./markdown/get-excerpt";
import { getLanguageFromFilename } from "./translations";
import aboutRaw from "../../content/data/about.json";
import rolesRaw from "../../content/data/roles.json";
import licensesRaw from "../../content/data/licenses.json";
import tagsRaw from "../../content/data/tags.json";

function isNotJunk(name: string): boolean {
	// Ignore VSCode and JetBrains project files
	return baseIsNotJunk(name) && name !== ".idea" && name !== ".vscode";
}

export const contentDirectory = join(process.cwd(), "content");

const tags = new Map<string, TagInfo>();

// This needs to use a minimal version of our unified chain,
// as we can't import `createRehypePlugins` through an Astro
// file due to the hastscript JSX
const tagExplainerParser = unified()
	.use(remarkParse, { fragment: true } as never)
	.use(remarkToRehype, { allowDangerousHtml: true })
	.use(rehypePlayfulElementMap)
	.use(rehypeStringify, { allowDangerousHtml: true, voids: [] });

for (const [key, tag] of Object.entries(tagsRaw)) {
	let explainer = undefined;
	let explainerType: TagInfo["explainerType"] | undefined = undefined;

	if ("image" in tag && tag.image.endsWith(".svg")) {
		const license = await fs
			.readFile("public" + tag.image.replace(".svg", "-LICENSE.md"), "utf-8")
			.catch((_) => undefined);

		const attribution = await fs
			.readFile(
				"public" + tag.image.replace(".svg", "-ATTRIBUTION.md"),
				"utf-8",
			)
			.catch((_) => undefined);

		if (license) {
			explainer = license;
			explainerType = "license";
		} else if (attribution) {
			explainer = attribution;
			explainerType = "attribution";
		}
	}

	const explainerHtml = explainer
		? (await tagExplainerParser.process(explainer)).toString()
		: undefined;

	tags.set(key, {
		explainerHtml,
		explainerType,
		...tag,
	});
}

async function readPerson(personPath: string): Promise<PersonInfo[]> {
	const personId = path.basename(personPath);

	const files = (await fs.readdir(personPath))
		.filter(isNotJunk)
		.filter((name) => name.startsWith("index.") && name.endsWith(".md"));

	const locales = files.map(getLanguageFromFilename);

	const personObjects = [];

	for (const file of files) {
		const locale = getLanguageFromFilename(file);
		const filePath = join(personPath, file);
		const fileContents = await fs.readFile(filePath, "utf-8");
		const frontmatter = matter(fileContents).data as RawPersonInfo;

		const profileImgSize = await getImageSize(
			frontmatter.profileImg,
			personPath,
		);
		if (!profileImgSize || !profileImgSize.width || !profileImgSize.height) {
			throw new Error(`${personPath}: Unable to parse profile image size`);
		}

		const person: PersonInfo = {
			pronouns: "",
			color: "",
			roles: [],
			achievements: [],
			...frontmatter,
			kind: "person",
			id: personId,
			file: filePath,
			locale,
			locales,
			totalPostCount: 0,
			totalWordCount: 0,
			profileImgMeta: {
				height: profileImgSize.height,
				width: profileImgSize.width,
				...resolvePath(frontmatter.profileImg, personPath)!,
			},
		};

		// normalize social links - if a URL or "@name" is entered, only preserve the last part
		const normalizeUsername = (username: string | undefined) =>
			username?.trim()?.replace(/^.*[/@](?!$)/, "");

		person.socials.twitter = normalizeUsername(person.socials.twitter);
		person.socials.github = normalizeUsername(person.socials.github);
		person.socials.gitlab = normalizeUsername(person.socials.gitlab);
		person.socials.linkedIn = normalizeUsername(person.socials.linkedIn);
		person.socials.twitch = normalizeUsername(person.socials.twitch);
		person.socials.dribbble = normalizeUsername(person.socials.dribbble);
		person.socials.threads = normalizeUsername(person.socials.threads);
		person.socials.cohost = normalizeUsername(person.socials.cohost);

		// "mastodon" should be a full URL; this will error if not valid
		try {
			if (person.socials.mastodon)
				person.socials.mastodon = new URL(person.socials.mastodon).toString();
		} catch (e) {
			console.error(
				`'${person.id}' socials.mastodon is not a valid URL: '${person.socials.mastodon}'`,
			);
			throw e;
		}

		// "bluesky" should be a full URL; this will error if not valid
		try {
			if (person.socials.bluesky)
				person.socials.bluesky = new URL(person.socials.bluesky).toString();
		} catch (e) {
			console.error(
				`'${person.id}' socials.mastodon is not a valid URL: '${person.socials.bluesky}'`,
			);
			throw e;
		}

		if (person.socials.youtube) {
			// this can either be a "@username" or "channel/{id}" URL, which cannot be mixed.
			const username = normalizeUsername(person.socials.youtube);
			person.socials.youtube = person.socials.youtube.includes("@")
				? `https://www.youtube.com/@${username}`
				: `https://www.youtube.com/channel/${username}`;
		}

		personObjects.push(person);
	}

	return personObjects;
}

async function readCollection(
	collectionPath: string,
	fallbackInfo: {
		authors: string[];
	},
): Promise<CollectionInfo[]> {
	const slug = path.basename(collectionPath);

	const files = (await fs.readdir(collectionPath))
		.filter(isNotJunk)
		.filter((name) => name.startsWith("index.") && name.endsWith(".md"));

	const locales = files.map(getLanguageFromFilename);

	const collectionObjects: CollectionInfo[] = [];
	for (const file of files) {
		const locale = getLanguageFromFilename(file);
		const filePath = join(collectionPath, file);
		const fileContents = await fs.readFile(filePath, "utf-8");
		const frontmatter = matter(fileContents).data as RawCollectionInfo;

		const coverImgSize = await getImageSize(
			frontmatter.coverImg,
			collectionPath,
		);
		if (!coverImgSize || !coverImgSize.width || !coverImgSize.height) {
			throw new Error(`${collectionPath}: Unable to parse cover image size`);
		}

		const coverImgMeta = {
			height: coverImgSize.height,
			width: coverImgSize.width,
			...resolvePath(frontmatter.coverImg, collectionPath)!,
		};

		const frontmatterTags = (frontmatter.tags || []).filter((tag) => {
			if (tags.has(tag)) {
				return true;
			} else {
				console.warn(
					`${collectionPath}: Tag '${tag}' is not specified in content/data/tags.json! Filtering...`,
				);
				return false;
			}
		});

		// count the number of posts in the collection
		const postCount = (
			await fs.readdir(join(collectionPath, "posts")).catch((_) => [])
		).filter(isNotJunk).length;

		collectionObjects.push({
			...fallbackInfo,
			...frontmatter,
			kind: "collection",
			slug,
			file: filePath,
			locale,
			locales,
			postCount,
			tags: frontmatterTags,
			coverImgMeta,
		});
	}

	return collectionObjects;
}

async function readPost(
	postPath: string,
	fallbackInfo: {
		authors: string[];
		collection?: string;
	},
): Promise<PostInfo[]> {
	const slug = path.basename(postPath);
	const files = (await fs.readdir(postPath))
		.filter(isNotJunk)
		.filter((name) => name.startsWith("index.") && name.endsWith(".md"));

	const locales = files.map(getLanguageFromFilename);

	const postObjects: PostInfo[] = [];
	for (const file of files) {
		const locale = getLanguageFromFilename(file);
		const filePath = join(postPath, file);
		const fileContents = await fs.readFile(filePath, "utf-8");
		const fileMatter = matter(fileContents);
		const frontmatter = fileMatter.data as RawPostInfo;

		// Look... Okay? Just.. Look.
		// Yes, we could use rehypeRetext and then XYZW but jeez there's so many edgecases.

		/**
		 * An ode to words
		 *
		 * Oh words, what can be said of thee?
		 *
		 * Not much me.
		 *
		 * See, it's conceived that ye might have intriguing definitions from one-to-another
		 *
		 * This is to say: "What is a word?"
		 *
		 * An existential question at best, a sisyphean effort at worst.
		 *
		 * See, while `forms` and `angular` might be considered one word each: what of `@angular/forms`? Is that 2?
		 *
		 * Or, what of `@someone mentioned Angular's forms`? Is that 4?
		 *
		 * This is a long-winded way of saying "We know our word counter is inaccurate, but so is yours."
		 *
		 * Please do let us know if you have strong thoughts/answers on the topic,
		 * we're happy to hear them.
		 */
		const wordCount = fileMatter.content.split(/\s+/).length;

		// get an excerpt of the post markdown no longer than 150 chars
		const excerpt = getExcerpt(fileMatter.content, 150);

		const frontmatterTags = (frontmatter.tags || []).filter((tag) => {
			if (tags.has(tag)) {
				return true;
			} else {
				console.warn(
					`${postPath}: Tag '${tag}' is not specified in content/data/tags.json! Filtering...`,
				);
				return false;
			}
		});

		postObjects.push({
			...fallbackInfo,
			...frontmatter,
			kind: "post",
			slug,
			file: filePath,
			path: path.relative(contentDirectory, postPath),
			locale,
			locales,
			tags: frontmatterTags,
			wordCount: wordCount,
			description: frontmatter.description || excerpt,
			excerpt,
			publishedMeta:
				frontmatter.published &&
				dayjs(frontmatter.published).format("MMMM D, YYYY"),
			editedMeta:
				frontmatter.edited && dayjs(frontmatter.edited).format("MMMM D, YYYY"),
			socialImg: `/generated/${slug}.twitter-preview.jpg`,
		});
	}

	return postObjects;
}

const people = new Map<string, PersonInfo[]>();
for (const personId of await fs.readdir(contentDirectory)) {
	if (!isNotJunk(personId)) continue;
	const personPath = join(contentDirectory, personId);
	const person = await readPerson(personPath);
	if (person.length) {
		people.set(personId, person);
	}
}

const collections = new Map<string, CollectionInfo[]>();
for (const personId of [...people.keys()]) {
	const collectionsDirectory = join(contentDirectory, personId, "collections");

	const slugs = (
		await fs.readdir(collectionsDirectory).catch((_) => [])
	).filter(isNotJunk);

	for (const slug of slugs) {
		const collectionPath = join(collectionsDirectory, slug);
		const collection = await readCollection(collectionPath, {
			authors: [personId],
		});
		if (collection.length) {
			collections.set(slug, collection);
		}
	}
}

const posts = new Map<string, PostInfo[]>();
for (const collection of [...collections.values()]) {
	const postsDirectory = join(
		contentDirectory,
		collection[0].authors[0],
		"collections",
		collection[0].slug,
		"posts",
	);

	const slugs = (await fs.readdir(postsDirectory).catch((_) => [])).filter(
		isNotJunk,
	);

	for (const slug of slugs) {
		const postPath = join(postsDirectory, slug);
		const post = await readPost(postPath, {
			authors: collection[0].authors,
			collection: collection[0].slug,
		});
		if (post.length) {
			posts.set(slug, post);
		}
	}
}
for (const personId of [...people.keys()]) {
	const postsDirectory = join(contentDirectory, personId, "posts");

	const slugs = (await fs.readdir(postsDirectory).catch((_) => [])).filter(
		isNotJunk,
	);

	for (const slug of slugs) {
		const postPath = join(postsDirectory, slug);
		const post = await readPost(postPath, {
			authors: [personId],
		});
		if (post.length) {
			posts.set(slug, post);
		}
	}
}

{
	// sort posts by date in descending order
	const sortedPosts = [...posts.values()].sort((post1, post2) => {
		const date1 = new Date(post1[0].published);
		const date2 = new Date(post2[0].published);
		return date1 > date2 ? -1 : 1;
	});

	// calculate whether each post should have a banner image
	for (let i = 0; i < sortedPosts.length; i++) {
		const post = sortedPosts[i];
		// index of the post on its page (assuming the page is paginated by 8)
		const pageIndex = i % 8;
		// if the post is at index 0 or 4, it should have a banner
		if (pageIndex === 0 || pageIndex === 4) {
			for (const localePost of post) {
				// TODO: support per-locale banner images?
				localePost.bannerImg = `/generated/${localePost.slug}.banner.jpg`;
			}
		}
	}
}

{
	// sum the totalWordCount and totalPostCount for each person object
	for (const postLocales of [...posts.values()]) {
		const [post] = postLocales;
		if (!post) continue;
		if (post.noindex) continue;

		for (const authorId of post.authors) {
			const personLocales = people.get(authorId) || [];
			for (const person of personLocales) {
				person.totalPostCount += 1;
				person.totalWordCount += post.wordCount;
			}
		}
	}
}

export {
	aboutRaw as about,
	rolesRaw as roles,
	licensesRaw as licenses,
	people,
	collections,
	posts,
	tags,
};
