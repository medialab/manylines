/**
 * Manylines Embed Controller
 * ===========================
 *
 */
var repositories = {
  embed: require('../repositories/embed.js')
};

// Actions definition
module.exports = {

  /**
   * narrative:
   * ----------
   * Retrieve necessary data to display a narrative widget.
   *
   */
  narrative: {
    validate: {
      id: 'string'
    },
    method: function(req, res) {
      repositories.embed.narrativeData(req.param('id'), function(err, data) {
        if (err && ~err.message.search(/inexistant/))
          return res.error(err, 404);
        else if (err)
          return res.error(err, 400);

        return res.json(data);
      });
    }
  }
};
