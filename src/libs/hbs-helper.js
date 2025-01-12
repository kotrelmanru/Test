const hbs = require("hbs");

hbs.registerHelper("increment", function (index) {
  return index + 1;
});
