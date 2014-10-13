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
      dialog.modal("show");
    });
  };

  return {
    /** Renders the view and initializes event listeners.
     */
    render: function () {
      container.find(".js-send-message").each(function (index, element) {
        addEventListeners(jQuery(element));
      });
    }
  }
};
