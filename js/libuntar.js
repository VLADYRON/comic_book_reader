// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";

// Based on the information from:
// https://en.wikipedia.org/wiki/Tar_(computing)

function tarGetEntries(filename, array_buffer) {
	var view = new Uint8Array(array_buffer);
	var offset = 0;
	var entries = [];

	while (offset + 512 < view.byteLength) {
		// Get entry name
		var entry_name = workingMap(view.slice(offset + 0, offset + 0 + 100), String.fromCharCode);
		entry_name = entry_name.join('').replace(/\0/g, '');

		// No entry name, so probably the last block
		if (entry_name.length === 0) {
			break;
		}

		// Get entry length
		var entry_length = parseInt(workingMap(view.slice(offset + 124, offset + 124 + 12), String.fromCharCode).join(''), 8);

		// Save this as en entry
		var entry = {
			name: entry_name,
			length: entry_length,
			offset: offset
		};
		entries.push(entry);

		// Round the offset up to be divisible by 512
		offset += (entry_length + 512);
		if (offset % 512 > 0) {
			var even = (offset / 512) | 0; // number of times it goes evenly into 512
			offset = (even + 1) * 512;
		}
	}

	return entries;
}

function tarGetEntryData(entry, array_buffer) {
	var view = new Uint8Array(array_buffer);
	var offset = entry.offset;
	var length = entry.length;

	// Get entry data
	//console.info(offset + 512);
	//console.info(offset + 512 + length);
	var entry_data = view.slice(offset + 512, offset + 512 + length);
	return entry_data;
}
