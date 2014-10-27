module.exports = {
  /** Converts an object to the JSON string representation.
   * @param {Object} object Object to convert. Cannot be null.
   * @return {String} a valid JSON string, never null.
   */
  json: function (object) {
    return JSON.stringify(object);
  },

  /** Applies URI encode to a String
   * @param {Object} object String to encode. Cannot be null.
   * @return {String} the encoded string, never null.
   */
  encodeUri: function (object) {
    return encodeURIComponent(object);
  }
};
