import { BaseActionResult } from "./ActionResult";

/**
 * List of actions for the context menu.
 *
 * @export
 * @interface ContextActions
 */
export default interface ContextActions {

    /**
     * Sign user out.
     *
     * @returns {Promise<void>}
     * @memberof ContextActions
     */
    signOut() : Promise<void>;

    /**
     * Close the context menu.
     *
     * @returns {Promise<void>}
     * @memberof ContextActions
     */
    closeMenu() : Promise<void>;

    /**
     * Refreshes trackings.
     *
     * @returns {Promise<void>}
     * @memberof ContextActions
     */
    refreshTrackings() : Promise<void>;
  
    /**
     * Shows off-line area edit.
     *
     * @returns {Promise<void>}
     * @memberof ContextActions
     */
    showOfflineAreaEdit() : Promise<void>;

    /**
     * Unload tracks.
     *
     * @returns {Promise<void>}
     * @memberof ContextActions
     */
    unloadTracks() : Promise<void>;

    /**
     * Shows tracking list.
     *
     * @returns {Promise<void>}
     * @memberof ContextActions
     */
    showTrackingList() : Promise<void>;

    /**
     * Starts location updates.
     *
     * @returns {Promise<void>}
     * @memberof ContextActions
     */
    startLocationUpdates() : Promise<void>;

    /**
     * Stops location updates.
     *
     * @returns {Promise<void>}
     * @memberof ContextActions
     */
    stopLocationUpdates() : Promise<void>;

    /**
     * Zooms to user's location.
     *
     * @returns {Promise<void>}
     * @memberof ContextActions
     */
    zoomToMyLocation() : Promise<void>;

    /**
     * Starts recording track.
     * GPS location must be running first.
     *
     * @returns {Promise<void>}
     * @memberof ContextActions
     */
    startTrackRecord() : Promise<void>;

    /**
     * Stops recording the track.
     *
     * @returns {Promise<void>}
     * @memberof ContextActions
     */
    stopTrackRecord() : Promise<void>;

}
  