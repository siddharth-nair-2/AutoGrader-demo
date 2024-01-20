const { Readable } = require('stream');

function bufferToStream(buffer) {
    const stream = new Readable({
      read() {} // Implement the read method
    });
    stream.push(buffer);
    stream.push(null); // Signals the end of the stream (EOF)
    return stream;
}

module.exports = bufferToStream;
