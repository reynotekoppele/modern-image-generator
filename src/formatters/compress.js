// Get dependencies
const path = require( 'path' );
const sharp = require( 'sharp' );
const { imageResizeDimensions } = require( '../utils/image-resizer-utils' );

/**
 * Compress image
 *
 * @param {string} image    - Path of image to format
 * @param {Object} config   - Config options
 * @param {Object} metadata - Image metadata
 */
const compressOriginal = async ( image, config, metadata ) => {
	const { name, ext } = path.parse( image );

	const result = await Promise.all( config.sizes.map( ( size ) => {
		const dimensions = imageResizeDimensions(
			metadata.width,
			metadata.height,
			size.width,
			size.height,
			size.width && size.height, // crop
		);

		if ( ! dimensions ) {
			return null;
		}

		const { destW, destH } = dimensions;

		return sharp( `${ config.input_dir }/${ image }` )
			.resize( {
				width: destW,
				height: destH,
				fit: size.fit,
			} )
			.jpeg( {
				quality: size.quality,
				force: false,
			} )
			.png( {
				quality: size.quality,
				compressionLevel: 9,
				force: false,
			} )
			.toFile( `${ config.output_dir }/${ name }-${ destW }x${ destH }${ ext }` );
	} ) );

	return result.filter( Boolean ).map( ( { width, height, size } ) => ( {
		file: `${ name }-${ width }x${ height }${ ext }`,
		width,
		height,
		size,
	} ) );
};

module.exports = compressOriginal;
