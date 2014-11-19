/* File upload test using node and mongo */

var mongoose = require('mongoose'),
	http = require('http'),
	fs = require('fs'),
	mime = require('mime'),
	path = require('path'),
	url = require('url'),
	Schema = mongoose.Schema,
	server = null;

/* Database connection */
mongoose.connect('mongodb://marciocaraballo:yosoydelverde1@ds051970.mongolab.com:51970/fileupload');

/* Mongoose schema */
var simpleDataSchema = new Schema({
  mail:  String,
  username: String,
  filename:   String,
});

/* Mongoose model */
var SimpleData = mongoose.model('SimpleData', simpleDataSchema);

/*
*
*	Find send, finish request correctly
*
*	@function
*	@param {Object} res Response object
*	@param {String} path File path
*	@param {Object} data File data to be sent
*
*/
function sendFile (res, filePath, data) {
	res.writeHead(200, {'Content-Type' : mime.lookup(path.basename(filePath))});
	res.end(data);
}

/* 
*
*	404 response
*
*	@function
*/
function fileNotFound (res, filePath, err) {
	res.writeHead(400, { 'Content-Type' : 'text/plain'});
	res.write('Error 404 : file not found ' + filePath);
	res.end();
}

/* 
*	Serving the static file from disk
*
*	@function
*	@param {Object} res Response object
*	@param {String} path File path
*
*/
function serveFile (res, path) {
	fs.exists(path , function (exists) {
		if (exists) {	/* File found */
			fs.readFile(path, function (err, data){
				if (err) {
					fileNotFound(res, path, err);
				}
				else {
					sendFile(res, path, data);
				}
			});
		}
		else{
			fileNotFound(res, path);
		}
	});
}

server = http.createServer(function (req, res) {

	var path = null,
		item = { },
		itemToDelete = { };

	switch (req.method) {
		case 'POST' : 

			req.setEncoding('utf-8');

			req.on('data' , function (chunk){	/* Data is being transfered */
				item = chunk;
			});

			req.on('end', function (){	/* Data was received */

				var jsonItem = JSON.parse(item),
					modelItem = new SimpleData(jsonItem);

				modelItem.save(function (err){
					if (err) {
						console.log('Error saving');
					}
				});

				res.writeHead(200, {'Content-Type' : 'text/plain'});
				res.end();
			});

			console.log('POST served');

			break;

		case 'GET': 

			if (req.url == '/') {	/* Home page request */
				path = 'public/index.html';

				serveFile(res, path);
			}
			else {

				path = 'public' + req.url;

				if (req.url == '/data/') { /* Data request */
					SimpleData.find({} , function (err, data){
						res.writeHead(200, 
							{
								'Content-Type'  : 'application/json', 
								'Content-lenght': Buffer.byteLength(JSON.stringify(data))
							});
						res.write(JSON.stringify(data));
						res.end();
					});
				}
				else {
					serveFile(res, path);
				}

			}

			console.log('GET ' + path);
			
			break;

		case 'DELETE' : 

				req.setEncoding('utf-8');

				req.on('data' , function (chunk){	/* Data is being transfered */
					itemToDelete = chunk;
				});

				req.on('end', function (){	/* Data was received */

					var jsonItem = JSON.parse(itemToDelete);


					SimpleData.find({ filename : jsonItem.id}).remove(function (err){

						console.log('removing');

					});

					res.writeHead(200, {'Content-Type' : 'text/plain'});
					res.end();
				});


		default : 
			break;
	}

}).listen(3000, function (){
	console.log('Server listening on port 3000.');
});