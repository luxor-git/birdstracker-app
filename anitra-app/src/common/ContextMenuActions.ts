export default interface ContextActions {
    signOut() : Promise<void>;

    closeMenu() : Promise<void>;

    refreshTrackings() : Promise<void>;
  
    showOfflineAreaEdit() : Promise<void>;

    unloadTracks() : Promise<void>;

    showTrackingList() : Promise<void>;
}
  