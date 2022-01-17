// See: https://core.trac.wordpress.org/browser/tags/5.8.1/src/wp-includes/media.php#L433
const constrainDimensions = ( sourceW, sourceH, maxW, maxH ) => {
	if ( ! maxW && ! maxH ) {
		return { w: sourceW, h: sourceH };
	}

	let widthRatio = 1;
	let heightRatio = 1;
	let didWidth = false;
	let didHeight = false;

	if ( maxW > 0 && sourceW > 0 && sourceW > maxW ) {
		widthRatio = maxW / sourceW;
		didWidth = true;
	}

	if ( maxH > 0 && sourceH > 0 && sourceH > maxH ) {
		heightRatio = maxH / sourceH;
		didHeight = true;
	}

	// Calculate the larger/smaller ratios
	const smallerRatio = Math.min( widthRatio, heightRatio );
	const largerRatio = Math.max( widthRatio, heightRatio );

	let ratio = largerRatio;
	if ( Math.round( sourceW * largerRatio ) > maxW || Math.round( sourceH * largerRatio ) > maxH ) {
		// The larger ratio is too big. It would result in an overflow
		ratio = smallerRatio;
	}

	// Very small dimensions may result in 0, 1 should be the minimum
	let w = Math.max( 1, Math.round( sourceW * ratio ) );
	let h = Math.max( 1, Math.round( sourceH * ratio ) );

	/*
	 * Sometimes, due to rounding, we'll end up with a result like this:
	 * 465x700 in a 177x177 box is 117x176... a pixel short.
	 * We also have issues with recursive calls resulting in an ever-changing result.
	 * Constraining to the result of a constraint should yield the original result.
	 * Thus we look for dimensions that are one pixel shy of the max value and bump them up.
	 */

	// Note: didWidth means it is possible smallerRatio == widthRatio
	if ( didWidth && w === maxW - 1 ) {
		w = maxW;
	}

	// Note: didHeight means it is possible smallerRatio == heightRatio
	if ( didHeight && h === maxH - 1 ) {
		h = maxH;
	}

	return { w, h };
};

// See: https://core.trac.wordpress.org/browser/tags/5.8.1/src/wp-includes/media.php#L530
const imageResizeDimensions = ( sourceW = 0, sourceH = 0, destW = 0, destH = 0, crop = false ) => {
	// Source must be specified
	if ( sourceW <= 0 || sourceH <= 0 ) {
		return false;
	}

	// At least one of destW or destH must be specified
	if ( destW <= 0 && destH <= 0 ) {
		return false;
	}

	// Stop if the destination size is larger than the original image dimensions
	if ( destH <= 0 ) {
		if ( sourceW < destW ) { // Width is larger
			return false;
		}
	} else if ( destW <= 0 ) {
		if ( sourceH < destH ) { // Height is larger
			return false;
		}
	} else if ( sourceW < destW && sourceH < destH ) { // Both dimensions are larger
		return false;
	}

	let newW;
	let newH;
	let cropW;
	let cropH;
	let sourceX;
	let sourceY;

	// Crop the largest possible poriton of the original image that we can size to destW * destH
	// If oneof the dimensions is smaller only the greater one will be cropped
	if ( crop ) {
		const aspectRatio = sourceW / sourceH;
		newW = Math.min( sourceW, destW );
		newH = Math.min( sourceH, destH );

		if ( newW === 0 ) { // Make sure width is set
			newW = Math.round( newH * aspectRatio );
		}

		if ( newH === 0 ) { // Make sure height is set
			newH = Math.round( newW * aspectRatio );
		}

		const sizeRatio = Math.max( newW / sourceW, newH / sourceH );

		cropW = Math.round( newW / sizeRatio );
		cropH = Math.round( newH / sizeRatio );

		sourceX = Math.floor( ( sourceW - cropW ) / 2 ); // center
		sourceY = Math.floor( ( sourceH - cropH ) / 2 ); // center
	} else {
		// Resize image using destW * destH as a maximum bounding box
		cropW = sourceW;
		cropH = sourceH;

		sourceX = 0;
		sourceY = 0;

		const { w, h } = constrainDimensions( sourceW, sourceH, destW, destH );
		newW = w;
		newH = h;
	}

	return {
		destX: 0,
		destY: 0,
		sourceX,
		sourceY,
		destW: newW,
		destH: newH,
		sourceW: cropW,
		sourceH: cropH,
	};
};

module.exports = { constrainDimensions, imageResizeDimensions };
