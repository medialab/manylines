;(function(undefined) {

  /**
   * Manylines Category Colors
   * ==========================
   *
   * Methods to apply colors to graph categories
   */

  app.graph.applyCategoriesColors = function(nodeModel, graph) {
    nodeModel.forEach(function(cat) {
      var colorsThreshold = 10,
        colors,
        scale,
        k,
        a,
        o;

      switch (cat.type) {
        case 'liststring':
          o = graph.nodes.reduce(function(values, n) {
            n.attributes[cat.id].forEach(function(val) {
              values[val] = (values[val] || 0) + 1;
            }, {});
            return values;
          }, {});
          break;
        case 'string':
          o = graph.nodes.reduce(function(values, n) {
            var val = n.attributes[cat.id]
            if (val)
              values[val] = (values[val] || 0) + 1;
            return values;
          }, {});
          break;
        default:
          cat.noDisplay = true;
      }

      if (!o)
        return;

      cat.values = [];
      for (k in o || {}) {
        cat.minValue = Math.min(cat.maxValue || Infinity, o[k]);
        cat.maxValue = Math.max(cat.maxValue || -Infinity, o[k]);
        cat.values.push({
          id: k,
          value: o[k]
        });
      }

      // Sort values
      cat.values = cat.values.sort(function(a, b) {
        return b.value - a.value;
      });

      // Colors
      colors = buildColors(Math.min(cat.values.length, colorsThreshold));
      cat.values.forEach(function(v, i, a) {
        v.color = colors[i];
        v.percentValue = v.value * 100 / cat.maxValue;
      });

      function buildColors(count){
        // Colors from iWantHue
        // H: 0 to 360
        // C: 1.11 to 2.31
        // L: 0.66 to 1.39
        switch(count){
          case 1:
            return ['#6889AB'];
            break;
          case 2:
            return ["#3CC426",
              "#D058AF"];
            break;
          case 3:
            return ["#3CC426",
              "#BE60D4",
              "#EC4042"];
            break;
          case 4:
            return ["#CB9A29",
              "#A682D0",
              "#E35466",
              "#70C950"];
            break;
          case 5:
            return ["#E05F3D",
              "#67C845",
              "#8286DA",
              "#DD5FAE",
              "#C4B322"];
            break;
          case 6:
            return ["#DF6240",
              "#79D83F",
              "#828BD7",
              "#DB62AB",
              "#C4B32D",
              "#54B962"];
            break;
          case 7:
            return ["#50BC65",
              "#DA65B4",
              "#D37F29",
              "#818CD6",
              "#B4B62F",
              "#E45356",
              "#7AD940"];
            break;
          case 8:
            return ["#65DD5D",
              "#D769BB",
              "#D28129",
              "#5B97CF",
              "#E3535F",
              "#BEC932",
              "#9263DE",
              "#5C9F45"];
            break;
          case 9:
            return ["#888AD6",
              "#69DC47",
              "#D7802C",
              "#11B0A7",
              "#D964B5",
              "#E45556",
              "#ACA02B",
              "#60B65A",
              "#C7DE3F"];
            break;
          case 10:
            return ["#50A3CB",
              "#C8DA3C",
              "#E05F3D",
              "#D26EC9",
              "#44CB91",
              "#CA962B",
              "#DF5683",
              "#6ADC4F",
              "#8967DA",
              "#6BA13C"];
            break;
          default:
            var colors = [];
            for(var i=0; i<count; i++){
              colors.push(chroma.rgb(Math.random()*255,Math.random()*255,Math.random()*255).hex());
            }
            return colors;
            break;
        }

      }

      // Reset colors over the 5th one to #ccc:
      cat.values.forEach(function(v, i, a) {
        if (i >= colorsThreshold)
          v.color = app.settings.colors.weakCategory;
      });

      if (cat.values.length > graph.nodes.length / 2)
        cat.noDisplay = true;

      if (cat.values.length < 2)
        cat.noDisplay = true;
    });
  };
}).call(this);
