import NetInfo from "@react-native-community/netinfo";

class NetStore {
    
    private isOnline: boolean = false;

    private callbacks: Function[] = [];

    public setOnline(status: boolean) : void {
        this.isOnline = status;
    }

    public getOnline() : boolean {
        return this.isOnline;
    }

    public addConnectionCallback(callback: Function)
    {
        this.callbacks.push(callback);
    }

    public connectionChanged()
    {
        this.callbacks.forEach(async (x) => await x(this.isOnline));
    }
    
}

const netStore = new NetStore();

const unsubscribe = NetInfo.addEventListener(state => {
    console.log("Connection event, connected:", state.isConnected);
    netStore.setOnline(state.isConnected);
    netStore.connectionChanged();
});

export default netStore;