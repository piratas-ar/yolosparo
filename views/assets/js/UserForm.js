/** Manages the user form.
 * @param {Element} container Form element. Cannot be null.
 * @param {Element} userSettingsAction Element to display user settings form.
 *    Cannot be null.
 * @constructor
 */
UserForm = function (container, userSettingsAction) {

  /** Indicates whether there're pending requests or not.
   * @type {Boolean}
   * @private
   * @fieldOf UserForm#
   */
  var busy = false;

  /** Displays a global message in the form.
   * @param {String} message Error to display. Cannot be null or empty.
   * @param {String} type Message type. Cannot be null or empty.
   * @private
   * @methodOf UserForm#
   */
  var displayMessage = function (message, type) {
    var errorContainer = jQuery("<div />", {
      "class": "alert alert-dismissible " + type
    });
    var closeButton = jQuery("<button />", {
      "class": "close",
      "type": "button",
      "data-dismiss": "alert"
    }).html("&times;");
    container.prepend(errorContainer);
    errorContainer.text(message);
    errorContainer.prepend(closeButton);
    errorContainer.alert();
    closeButton.click(function (event) {
      event.preventDefault();
    });
  };

  /** Initializes event listeners.
   * @private
   * @methodOf UserForm#
   */
  var initEventListeners = function () {
    container.find(".js-change-settings").click(function (event) {
      var currentNick = container.find("input[name=currentNick]").val();
      var nick = container.find("input[name=nick]").val();
      var email = container.find("input[name=email]").val();
      var uid = container.find("input[name=uid]").val();

      if (!busy) {
        busy = true;

        jQuery.post("/changeSettings", {
          uid: uid,
          nick: nick,
          email: email
        }, function (response) {
          userSettingsAction.find(".js-user-name").text(nick);
          container.find("input[name=currentNick]").val(nick);
          busy = false;
          displayMessage("Los cambios se guardaron correctamente.",
            "alert-success");
        }).error(function (response) {
          // Displays the error.
          displayMessage(response.responseJSON.error, "alert-danger");
          busy = false;
        });
      }

      event.preventDefault();
    });
  };

  return {
    /** Initializes the user form.
     */
    render: function () {
      container.find(".js-error").alert();
      initEventListeners();
    }
  };
};
