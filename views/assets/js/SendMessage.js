/** Sends an email message to legislatives.
 * @param {Element} container Legislatives list container. Cannot be null.
 * @param {Object[]} legislatives List of legislatives. Cannot be null.
 */
SendMessage = function (container, legislatives) {

  /** Dialog to send messages.
   * @type {Element}
   * @private
   * @fieldOf SendMessage#
   */
  var dialog = container.find(".js-send-message-dialog").modal({
    show: false
  });

  /** Id of the legislative to send message.
   * @type {Number}
   * @private
   * @fieldOf SendMessage#
   */
  var currentLegislativeId;

  /** Searches for a legislative by its id.
   * @param {Number} id Legislative id. Cannot be null.
   * @return {Object} Returns the required legislative or null if it doesn't
   *    exist.
   * @private
   * @methodOf SendMessage#
   */
  var findLegislative = function (id) {
    var i;
    for (i = 0; i < legislatives.length; i++) {
      if (legislatives[i].id === id) {
        return legislatives[i];
      }
    }
    return null;
  };

  /** Adds event listeners to the specified action.
   * @param {Element} action Action link. Cannot be null.
   * @private
   * @methodOf SendMessage#
   */
  var addEventListeners = function (action) {
    action.click(function (event) {
      var id = jQuery(event.target).data("id");
      var legislative = findLegislative(id);

      dialog.find(".js-message-to").text(legislative.fullName +
        " <" + legislative.email + ">");
      currentLegislativeId = legislative.id;
      dialog.modal("show");
    });
  };

  /** Initializes dialog event listeners.
   * @private
   * @methodOf SendMessage#
   */
  var initEventListeners = function () {
    dialog.find(".js-cancel").click(function () {
      dialog.modal("hide");
    });
    dialog.find(".js-send").click(function () {
      var message = dialog.find("textarea[name=message]").text();
      var from = dialog.find("input[name=message-from]").val();

      jQuery.post("/sendMessage", {
        id: currentLegislativeId,
        message: message,
        from: from
      }, function (response) {
        // TODO(seykron): manage errors.
        dialog.modal("hide");
      });
    });

    twttr.events.bind(
      'tweet',
      function (event) {
        console.log(event);
      }
    );

    container.find(".js-fb-feed").click(function (event) {
      var link = jQuery(event.target);

      FB.ui({
        method: 'send',
        link: 'http://yolosparo.org',
        to: link.data("to")
      }, function(response) {
        if (response && response.success) {

        }
      });
    });
  };

  return {
    /** Renders the view and initializes event listeners.
     */
    render: function () {
      initEventListeners();
      container.find(".js-send-message").each(function (index, element) {
        addEventListeners(jQuery(element));
      });
    }
  }
};
