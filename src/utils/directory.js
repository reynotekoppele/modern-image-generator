// Get dependencies
const path = require( 'path' );
const fs = require( 'fs/promises' );

/**
 * Get all images in directory
 *
 * @param {string} directory - Directory to scan
 * @return {Promise<string[]>} Array of images
 */

const getImagesFromDir = async ( directory, whitelist = [ '.jpg', '.png' ] ) => {
	try {
		const files = await fs.readdir( directory );
		const images = files.filter( ( file ) => (
			whitelist.includes( path.extname( file ) )
		) );

		return images;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( error );
	}
};

module.exports = {
	getImagesFromDir,
};
