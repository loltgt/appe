/**
 * app.store
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
app.store = {};


/**
 * app.store.set
 *
 * Sets storage entry
 *
 * @param <String> key
 * @param value
 * @return
 */
app.store.set = function(key, value) {
  return app.utils.storage(false, 'set', key, value);
}


/**
 * app.store.set
 *
 * Gets storage entry by key
 *
 * @param <String> key
 * @return
 */
app.store.get = function(key) {
  return app.utils.storage(false, 'get', key);
}


/**
 * app.store.has
 *
 * Checks existence for storage entry by key, could match value
 *
 * @param <String> key
 * @param value
 * @return <Boolean>
 */
app.store.has = function(key, value) {
  return app.utils.storage(false, 'has', key, value);
}


/**
 * app.memory.del
 *
 * Remove storage entry by key
 *
 * @param <String> key
 * @return
 */
app.store.del = function(key) {
  return app.utils.storage(false, 'del', key);
}


/**
 * app.store.reset
 *
 * Reset storage
 *
 * @return
 */
app.store.reset = function() {
  return app.utils.storage(false, 'reset');
}
