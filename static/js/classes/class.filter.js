;(function(undefined) {

  /**
   * TubeMyNet Filter Class
   * =======================
   *
   * A simple data structure to deal with view filters.
   */

  this.Filter = function() {

    // Basic properties
    this.category = null;
    this.values = [];

    // Methods
    this.set = function(category) {
      this.category = category;
      return this;
    };

    this.add = function(value) {
      this.values.push(value);
      return this;
    };

    this.remove = function (value) {
      this.values = this.values.filter(function(v) {
        return v !== value;
      });
      return this;
    };

    this.empty = function() {
      this.values = [];
      return this;
    };

    this.clear = function() {
      this.category = null;
      this.values = [];
      return this;
    };
  };
}).call(this);
