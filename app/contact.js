// Renders the home page.
app.get('/contact', function (req, res) {
  res.render("contact.html", {
    contactView: true
  });
});
