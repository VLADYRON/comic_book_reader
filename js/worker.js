// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";

importScripts('polyfill/polyfill.js');
importScripts("libunrar.js");
importScripts("jszip.js");
importScripts("libuntar.js");
importScripts('uncompress.js');
importScripts('settings.js');
importScripts('db.js');


function isValidImageType(file_name) {
	file_name = file_name.toLowerCase();
	return file_name.endsWith('.jpeg') ||
			file_name.endsWith('.jpg') ||
			file_name.endsWith('.png') ||
			file_name.endsWith('.bmp') ||
			file_name.endsWith('.gif');
}

function getFileMimeType(file_name) {
	file_name = file_name.toLowerCase();
	if (file_name.endsWith('.jpeg') || file_name.endsWith('.jpg')) {
		return 'image/jpeg';
	} else if (file_name.endsWith('.png')) {
		return 'image/png';
	} else if (file_name.endsWith('.bmp')) {
		return 'image/bmp';
	} else if (file_name.endsWith('.gif')) {
		return 'image/gif';
	} else {
		// Uses jpeg as default mime type
		return 'image/jpeg';
	}
}

function onUncompress(archive) {
	// Get only the entries that are images
	var entries = [];
	archive.entries.forEach(function(entry) {
		if (isValidImageType(entry.name)) {
			entries.push(entry);
		}
	});

	// Tell the client that we are starting to uncompress
	var onStart = function(entries) {
		var message = {
			action: 'uncompressed_start',
			count: entries.length
		};
		self.postMessage(message);
	};

	// Tell the client that we are done uncompressing
	var onEnd = function() {
		var message = {
			action: 'uncompressed_done'
		};
		self.postMessage(message);
	};

	// Uncompress each entry and send it to the client
	var onEach = function(i) {
		if (i === 0) {
			onStart(entries);
		} else if (i >= entries.length) {
			onEnd();
			return;
		}

		var entry = entries[i];
		entry.readData(function(data) {
			var blob = new Blob([data], {type: getFileMimeType(entry.name)});
			var url = URL.createObjectURL(blob);
			console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);

			setCachedFile('big', entry.name, blob, function(is_success) {
				if (! is_success) {
					dbClose();
					var message = {
						action: 'storage_full',
						filename: entry.name
					};
					self.postMessage(message);
				} else {
					var message = {
						action: 'uncompressed_each',
						filename: entry.name,
						url: url,
						index: i,
						is_cached: false
					};
					self.postMessage(message);
					onEach(i + 1);
				}
			});
		});
	};
	onEach(0);
}

self.addEventListener('message', function(e) {
	console.info(e);

	switch (e.data.action) {
		case 'uncompress':
			dbClose();
			var array_buffer = e.data.array_buffer;
			var filename = e.data.filename;

			// Open the file as an archive
			var archive = archiveOpen(filename, array_buffer);
			if (archive) {
				initCachedFileStorage(filename, function() {
					console.info('Uncompressing ' + archive.archive_type + ' ...');
					onUncompress(archive);
				});
			// Otherwise show an error
			} else {
				var error = 'Invalid comic file: "' + filename + '"';
				console.info(error);
				var message = {
					action: 'invalid_file',
					error: error
				};
				self.postMessage(message);
			}
			break;
		case 'load_from_cache':
			dbClose();
			var filename = e.data.filename;
			var onStart = function(count) {
				var message = {
					action: 'uncompressed_start',
					count: count
				};
				self.postMessage(message);
			};

			var onEnd = function() {
				var message = {
					action: 'uncompressed_done'
				};
				self.postMessage(message);
			};

			var i = 0;
			var onEach = function(name, blob) {
				var url = URL.createObjectURL(blob);
				console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);
				console.info(name);
				console.info(url);

				var message = {
					action: 'uncompressed_each',
					filename: name,
					url: url,
					index: i,
					is_cached: true
				};
				self.postMessage(message);
				i++;
			};

			getAllCachedPages(filename, onStart, onEach, onEnd);
			break;
		case 'start':
			e.data.array_buffer = null;
			console.info('Worker started ...');
			break;
	}
}, false);
