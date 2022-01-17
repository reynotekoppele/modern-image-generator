const fs = require( 'fs/promises' );
const sharp = require( 'sharp' );
const compressOriginal = require( './compress' );
const generateWebP = require( './webp' );
const generateAvif = require( './avif' );

/**
 * Format and compress image
 *
 * @param {string} image  - Path of image to format
 * @param {Object} config - Config options
 */
const format = async ( image, config ) => {
	const { size } = await fs.stat( `${ config.input_dir }/${ image }` );
	const metadata = await sharp( `${ config.input_dir }/${ image }` ).metadata();

	return {
		original: {
			file: `${ config.input_dir }/${ image }`,
			size,
		},
		compressed: await compressOriginal( image, config, metadata ),
		webp: await generateWebP( image, config, metadata ),
		avif: await generateAvif( image, config, metadata ),
	};
};

module.exports = { format };
