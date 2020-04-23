import NetInfo from "@react-native-community/netinfo";

/**
 * Stores network connectivity data and deals with synchronisations of off-line and on-line data.
 *
 * @class NetStore
 */
class NetStore
{

    /**
     * Connection status.
     *
     * @private
     * @type {boolean}
     * @memberof NetStore
     */
    private isOnline: boolean = false;

    /**
     * Connection change callbacks.
     *
     * @private
     * @type {Function[]}
     * @memberof NetStore
     */
    private callbacks: Function[] = [];

    /**
     * Sets on-line status.
     * This must be exposed because the NetInfo class does not share the same context.
     *
     * @param {boolean} status
     * @memberof NetStore
     */
    public setOnline(status: boolean) : void {
        if (status != this.isOnline) {
            this.connectionChanged();
        }
        this.isOnline = status;
    }

    /**
     * Get current connection status.
     *
     * @returns {boolean}
     * @memberof NetStore
     */
    public getOnline() : boolean {
        return this.isOnline;
    }

    /**
     * Adds connection status change callback.
     *
     * @param {Function} callback
     * @memberof NetStore
     */
    public addConnectionCallback(callback: Function) : void
    {
        this.callbacks.push(callback);
    }

    /**
     * Private connection change event.
     *
     * @private
     * @memberof NetStore
     */
    private connectionChanged() : void
    {
        this.callbacks.forEach(async (x) => await x(this.isOnline));
    }
}

const netStore = new NetStore();

const unsubscribe = NetInfo.addEventListener(state => {
    console.log("Connection event, connected:", state.isConnected);
    netStore.setOnline(state.isConnected);
});

export default netStore;