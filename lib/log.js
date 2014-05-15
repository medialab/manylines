// Some basic logging utilities to extend `morgan`.
function makeFormat(header) {
  return function(tokens, req, res) {
    var status = res.statusCode,
        len = parseInt(res.getHeader('Content-Length'), 10),
        color = 32;

    if (status >= 500) color = 31
    else if (status >= 400) color = 33
    else if (status >= 300) color = 36;

    return header + ' ' +
           req.method +
           ' ' + (req.originalUrl || req.url) + ' ' +
           '\x1b[' + color + 'm' + res.statusCode +
           '\x1b[0m';
  };
}

// Exporting
module.exports = {
  formats: {
    static: makeFormat('\x1b[94m[static] \x1b[90m-'),
    api: makeFormat('\x1b[92m[api]    \x1b[90m-')
  }
};
