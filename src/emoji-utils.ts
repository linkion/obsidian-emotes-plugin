export function normalizeSearchText(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/[_\s-]+/g, " ")
		.trim();
}

export function shortcodeText(shortcode: string): string {
	const trimmed = shortcode.trim().replace(/^:+|:+$/g, "");
	return `:${trimmed}:`;
}

export function levenshteinDistance(left: string, right: string): number {
	if (left === right) {
		return 0;
	}

	if (left.length === 0) {
		return right.length;
	}

	if (right.length === 0) {
		return left.length;
	}

	const previousRow = new Array(right.length + 1);
	const currentRow = new Array(right.length + 1);

	for (let index = 0; index <= right.length; index += 1) {
		previousRow[index] = index;
	}

	for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
		currentRow[0] = leftIndex + 1;
		for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
			const substitutionCost =
				left[leftIndex] === right[rightIndex] ? 0 : 1;
			const deletionCost = previousRow[rightIndex + 1] + 1;
			const insertionCost = currentRow[rightIndex] + 1;
			const replacementCost = previousRow[rightIndex] + substitutionCost;
			currentRow[rightIndex + 1] = Math.min(
				deletionCost,
				insertionCost,
				replacementCost,
			);
		}

		for (let index = 0; index <= right.length; index += 1) {
			previousRow[index] = currentRow[index];
		}
	}

	return previousRow[right.length];
}

export function similarityScore(query: string, candidate: string): number {
	const normalizedQuery = normalizeSearchText(query);
	const normalizedCandidate = normalizeSearchText(candidate);

	if (!normalizedQuery || !normalizedCandidate) {
		return Number.POSITIVE_INFINITY;
	}

	if (normalizedQuery === normalizedCandidate) {
		return 0;
	}

	if (normalizedCandidate.startsWith(normalizedQuery)) {
		return normalizedCandidate.length - normalizedQuery.length;
	}

	if (normalizedCandidate.includes(normalizedQuery)) {
		return 25 + normalizedCandidate.indexOf(normalizedQuery);
	}

	return 100 + levenshteinDistance(normalizedQuery, normalizedCandidate);
}
