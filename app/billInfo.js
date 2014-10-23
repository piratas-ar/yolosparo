// Renders the bill information.
app.get('/billInfo', function (req, res) {
  res.render("billInfo.html", {
    billInfoView: true
  });
});
