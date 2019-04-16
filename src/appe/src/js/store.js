/**
 * app.store
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
  return app.utils.storage(true, 'set', key, value);
}


/**
 * app.store.get
 *
 * Gets persistent storage entry by key
 *
 * @param <String> key
 * @return
 */
app.store.get = function(key) {
  return app.utils.storage(true, 'get', key);
}


/**
 * app.store.has
 *
 * Checks existence for persistent storage entry by key and match value
 *
 * @param <String> key
 * @param value
 * @return <Boolean>
 */
app.store.has = function(key, value) {
  return app.utils.storage(true, 'has', key, value);
}


/**
 * app.store.del
 *
 * Removes persistent storage entry by key
 *
 * @param <String> key
 * @return
 */
app.store.del = function(key) {
  return app.utils.storage(true, 'del', key);
}


/**
 * app.store.reset
 *
 * Reset persistent storage
 *
 * @return
 */
app.store.reset = function() {
  return app.utils.storage(true, 'reset');
}
