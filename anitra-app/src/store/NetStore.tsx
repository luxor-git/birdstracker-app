//import NetInfo from "@react-native-community/netinfo";

class NetStore {
    
    private isOnline: boolean = false;

    public setOnline(status: boolean) : void {
        this.isOnline = status;
    }

    public getOnline() : boolean {
        return this.isOnline;
    }
    
}

const netStore = new NetStore();
/*
const unsubscribe = NetInfo.addEventListener(state => {
    console.log("Connection event, connected:", state.isConnected);
    netStore.setOnline(state.isConnected);
});
*/
export default netStore;