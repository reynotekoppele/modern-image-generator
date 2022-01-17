// Get dependencies
const path = require( 'path' );
const fs = require( 'fs/promises' );
const Ajv = require( 'ajv' );
const schema = require( './schema.json' );
const config = require( './config.json' );
const { format } = require( './formatters' );
const { getImagesFromDir } = require( './utils/directory' );

( async () => {
	// Validate schema
	const ajv = new Ajv( { strictTuples: false } );
	const validate = ajv.compile( schema );

	const isValid = validate( config );

	if ( ! isValid ) {
		console.log( validate.errors ); // eslint-disable-line no-console
		process.exit();
	}

	// Clear output directory
	try {
		const files = await fs.readdir(
			path.resolve( process.cwd(), config.output_dir ),
		);

		for ( const file of files ) {
			await fs.unlink(
				path.join( process.cwd(), config.output_dir, file ),
			);
		}
	} catch ( error ) {
		console.log( error ); // eslint-disable-line no-console
		process.exit();
	}

	// Retrieve all images
	const images = await getImagesFromDir(
		path.resolve( process.cwd(), config.input_dir ),
	);

	// Format each image
	const result = await Promise.all( images.map( ( image ) => {
		return format( image, config );
	} ) );

	// Create generated.json
	await fs.writeFile(
		path.resolve( process.cwd(), config.output_dir, 'generated.json' ),
		JSON.stringify( result, null, 2 ),
		{ flag: 'a' },
	);
} )();
