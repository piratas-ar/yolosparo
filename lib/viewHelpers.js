module.exports = {
  /** Converts an object to the JSON string representation.
   * @param {Object} object Object to convert. Cannot be null.
   * @return {String} a valid JSON string, never null.
   */
  json: function (object) {
    return JSON.stringify(object);
  }
};
