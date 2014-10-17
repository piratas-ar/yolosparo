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

  /** Displays a general error message in the form.
   * @param {String} errorMessage Error to display. Cannot be null or empty.
   * @private
   * @methodOf UserForm#
   */
  var displayError = function (errorMessage) {
    var errorContainer = jQuery("<div />", {
      "class": "alert alert-danger alert-dismissible"
    });
    var closeButton = jQuery("<button />", {
      "class": "close",
      "type": "button",
      "data-dismiss": "alert"
    }).html("&times;");
    container.prepend(errorContainer);
    errorContainer.text(errorMessage);
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
      var uid = container.find("input[name=uid]").val();

      if (!busy && nick !== currentNick) {
        busy = true;

        jQuery.post("/changeNick", {
          uid: uid,
          nick: nick
        }, function (response) {
          userSettingsAction.find(".js-user-name").text(nick);
          container.find("input[name=currentNick]").val(nick);
          busy = false;
        }).error(function (response) {
          // Displays the error.
          displayError(response.responseJSON.error);
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
