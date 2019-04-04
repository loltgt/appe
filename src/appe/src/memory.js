/**
 * app.memory
 *
 * Handles persistent storage entries
 *
 * available methods:
 *  - set (key <String>, value)
 *  - get (key <String>)
 *  - has (has <String>, value)
 *  - del (key <String>)
 *  - reset ()
 */
app.memory = {};


/**
 * app.memory.set
 *
 * Sets persistent storage entry
 *
 * @param <String> key
 * @param value
 * @return
 */
app.memory.set = function(key, value) {
  return app.utils.storage(true, 'set', key, value);
}


/**
 * app.memory.get
 *
 * Gets persistent storage entry
 *
 * @param <String> key
 * @param value
 * @return
 */
app.memory.get = function(key) {
  return app.utils.storage(true, 'get', key);
}


/**
 * app.memory.has
 *
 * Checks existence for persistent storage entry by key, could match value
 *
 * @param <String> key
 * @param value
 * @return <Boolean>
 */
app.memory.has = function(key, value) {
  return app.utils.storage(true, 'has', key, value);
}


/**
 * app.memory.del
 *
 * Remove persistent storage entry by key
 *
 * @param <String> key
 * @return
 */
app.memory.del = function(key) {
  return app.utils.storage(true, 'del', key);
}


/**
 * app.memory.reset
 *
 * Reset persistent storage
 *
 * @return
 */
app.memory.reset = function() {
  return app.utils.storage(true, 'reset');
}
