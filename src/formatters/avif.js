// Get dependencies
const path = require( 'path' );
const sharp = require( 'sharp' );
const { imageResizeDimensions } = require( '../utils/image-resizer-utils' );

/**
 * Generate Avif image
 *
 * @param {string} image    - Path of image to format
 * @param {Object} config   - Config options
 * @param {Object} metadata - Image metadata
 */
const generateAvif = async ( image, config, metadata ) => {
	const { name } = path.parse( image );

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
			.avif( {
				quality: size.quality,
				speed: 0,
				chromaSubsampling: '4:2:0',
			} )
			.toFile( `${ config.output_dir }/${ name }-${ destW }x${ destH }.avif` );
	} ) );

	return result.filter( Boolean ).map( ( { width, height, size } ) => ( {
		file: `${ name }-${ width }x${ height }.avif`,
		width,
		height,
		size,
	} ) );
};

module.exports = generateAvif;
