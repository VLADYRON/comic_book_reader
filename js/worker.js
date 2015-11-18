// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader


importScripts('libunrar.js');
importScripts('jszip.js');



// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

function isValidImageType(file_name) {
	file_name = file_name.toLowerCase();
	return file_name.endsWith('.jpeg') ||
			file_name.endsWith('.jpg') ||
			file_name.endsWith('.png') ||
			file_name.endsWith('.bmp');
}

function uncompress(filename, array_buffer) {
	var file = {};
	file.name = filename;
	file.size = array_buffer.byteLength;
	file.type = '';
	file.content = new Uint8Array(array_buffer);
	var files = [file];
	var password = null;
	readRARContent(files, password, function(fileNames) {
		var count = 0;
		for (var i=0; i<fileNames.length; ++i) {
			if (isValidImageType(fileNames[i].name)) {
				count++;
			}
		}

		var message = {
			action: 'uncompressed_start',
			count: count
		};
		self.postMessage(message);
	},
	function(fileName, fileSize, data) {
		if (! isValidImageType(fileName)) {
			return;
		}

		var buffer = new Blob([data.buffer], {type: 'image/jpeg'});
//		console.info(buffer);
//		console.info(fileName + ', ' + fileSize);
//			console.info(buffer);
		var url = URL.createObjectURL(buffer);
		console.info(url);

		var message = {
			action: 'uncompressed_each',
			filename: fileName,
			url: url
			//index: index
		};
		self.postMessage(message);
	},
	function() {
		var message = {
			action: 'uncompressed_done'
		};
		self.postMessage(message);
		// FIXME: In Chrome, if the worker is terminated, all object URLs die
//		self.close();
	});
}

function uncompressZip(filename, array_buffer) {
	var zip = new JSZip(array_buffer);

	// Get the only the files that are images
	var files = [];
	Object.keys(zip.files).forEach(function(i) {
		var zipEntry = zip.files[i];
		if (isValidImageType(zipEntry.name)) {
			files.push(zipEntry);
		}
	});

	// Sort the files by their names
	files.sort(function(a, b) {
		if(a.name < b.name) return -1;
		if(a.name > b.name) return 1;
		return 0;
	});

	// Tell the client that we are starting to decompress
	var message = {
		action: 'uncompressed_start',
		count: files.length
	};
	self.postMessage(message);

	for (var i=0; i<files.length; ++i) {
		var zipEntry = files[i];
//		console.info(zipEntry);
		var buffer = zipEntry.asArrayBuffer();
		var blob = new Blob([buffer], {type: 'image/jpeg'});
		var url = URL.createObjectURL(blob);
		console.info(zipEntry.name);
		console.info(url);

		var message = {
			action: 'uncompressed_each',
			filename: zipEntry.name,
			url: url
			//index: index
		};
		self.postMessage(message);
	}

	// Tell the client that we are done
	var message = {
		action: 'uncompressed_done'
	};
	self.postMessage(message);
}

self.addEventListener('message', function(e) {
	console.info(e);

	switch (e.data.action) {
		case 'uncompress':
			var array_buffer = e.data.array_buffer;
			var filename = e.data.filename;
			console.info('Uncompressing ...');
//			uncompress(filename, array_buffer);
			uncompressZip(filename, array_buffer);
			break;
		case 'start':
			e.data.array_buffer = null;
			console.info('Worker started ...');
			break;
/*
		case 'resize_image':
			var index = e.data.index;
			var filename = e.data.filename;
			var array_buffer = e.data.array_buffer;

			// FIXME: Resize the buffer here, and return it
			//var uInt8Array = new Uint8Array(array_buffer);

			var message = {
				action: 'resize_image',
				filename: filename,
				index: index,
				array_buffer: array_buffer
			};
			self.postMessage(message, [array_buffer]);
			break;
*/
	}
}, false);
