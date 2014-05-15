// Some basic logging utilities to extend `morgan`.
function static(tokens, req, res){
  var status = res.statusCode
    , len = parseInt(res.getHeader('Content-Length'), 10)
    , color = 32;

  if (status >= 500) color = 31
  else if (status >= 400) color = 33
  else if (status >= 300) color = 36;

  len = isNaN(len)
    ? ''
    : len = ' - ' + bytes(len);

  return '\x1b[90m[static] - ' +
         req.method +
         ' ' + (req.originalUrl || req.url) + ' ' +
         '\x1b[' + color + 'm' + res.statusCode +
         ' \x1b[90m' +
         (new Date - req._startTime) +
         'ms' + len +
         '\x1b[0m';
}

function api(tokens, req, res){
  var status = res.statusCode
    , len = parseInt(res.getHeader('Content-Length'), 10)
    , color = 32;

  if (status >= 500) color = 31
  else if (status >= 400) color = 33
  else if (status >= 300) color = 36;

  len = isNaN(len)
    ? ''
    : len = ' - ' + bytes(len);

  return '\x1b[90m[api]    - ' +
         req.method +
         ' ' + (req.originalUrl || req.url) + ' ' +
         '\x1b[' + color + 'm' + res.statusCode +
         ' \x1b[90m' +
         (new Date - req._startTime) +
         'ms' + len +
         '\x1b[0m';
}

// Exporting
module.exports = {
  formats: {
    static: static,
    api: api
  }
};
