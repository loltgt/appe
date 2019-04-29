/**
 * app.memory
 *
 * Handles storage entries
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
 * Sets storage entry
 *
 * @param <String> key
 * @param value
 * @return
 */
app.memory.set = function(key, value) {
  return app.utils.storage(false, 'set', key, value);
}


/**
 * app.memory.get
 *
 * Gets storage entry
 *
 * @param <String> key
 * @param value
 * @return
 */
app.memory.get = function(key) {
  return app.utils.storage(false, 'get', key);
}


/**
 * app.memory.has
 *
 * Checks existence for storage entry by key and match value
 *
 * @param <String> key
 * @param value
 * @return <Boolean>
 */
app.memory.has = function(key, value) {
  return app.utils.storage(false, 'has', key, value);
}


/**
 * app.memory.del
 *
 * Removes storage entry by key
 *
 * @param <String> key
 * @return
 */
app.memory.del = function(key) {
  return app.utils.storage(false, 'del', key);
}


/**
 * app.memory.reset
 *
 * Resets storage
 *
 * @return
 */
app.memory.reset = function() {
  return app.utils.storage(false, 'reset');
}
