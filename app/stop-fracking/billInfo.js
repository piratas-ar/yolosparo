module.exports = function (domain, app) {
  // Renders the bill information.
  app.get("/billInfo", function (req, res) {
    res.render("billInfo.html", {
      billInfoView: true
    });
  });
};
