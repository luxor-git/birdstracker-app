
import * as FileSystem from 'expo-file-system';
import { ISerializableEntity } from '../entities/IEntity';
import EntityFactory from '../entities/EntityFactory';
import NetStore from '../store/NetStore';
import Constants from '../constants/Constants';

class PersistentStorage
{

    public async init() : Promise<void> {
        console.log('Creating directories...');

        let keys = Object.keys(PATH_MAPPING);

        for (let i = 0; i < keys.length; i++) {
            if (!await this.fileExists(PATH_MAPPING[keys[i]])) {
                await FileSystem.makeDirectoryAsync(PATH_MAPPING[keys[i]], { intermediates: true });
            }
        }

        console.log('Directories created OK');
    }


    public async save(path: string, data: ISerializableEntity) : Promise<void>
    {
        await FileSystem.writeAsStringAsync(path, data.toJsonString());
    }

    public async saveCollection(path: string, data: ISerializableEntity[]) : Promise<void>
    {
        let arr = []; //wrapper?

        data.forEach((x) => {
            arr.push(x.toJson());
        });

        let wrapper = {
            data: arr,
            synchronized: new Date()
        };

        const saveData = JSON.stringify(wrapper);

        console.log("Writing collection to", path, "of length", saveData.length);
        console.log(saveData.substr(0, 100));
        console.log('Filesize:', encodeURI(saveData).split(/%..|./).length - 1);

        await FileSystem.writeAsStringAsync(path, saveData);
    }

    public async loadCollection(path: string, type: { new() : ISerializableEntity }, expireCache: boolean = false) : Promise<ISerializableEntity[]>
    {
        console.log("Loading from", path);
        let res = await FileSystem.readAsStringAsync(path);
        let json = JSON.parse(res);

        if (json.synchronized && NetStore.getOnline() && expireCache) {
            let lastSynchronized = new Date(json.synchronized);
            if ((+new Date() - +lastSynchronized) > Constants.CACHE_TIMEOUT) {
                throw new Error("Cache timeout exceeded.");
            }
        }

        let arr: ISerializableEntity[] = [];

        for (let i = 0; i < json.data.length; i++) {
            let ent : ISerializableEntity = EntityFactory.create(type, json.data[i]);
            arr.push(ent);
        }

        return arr;
    }

    public async load(type: { new() : ISerializableEntity }, path: string) : Promise<ISerializableEntity>
    {
        try {
            let string = await FileSystem.readAsStringAsync(path);
            
            let json = JSON.parse(string);

            let ent = EntityFactory.create(type, json);

            ent.fromJson(
                json
            );

            return ent;
        } catch {
            return null;
        }
    }

    public async fileExists(path: string) : Promise<boolean> {
        let info = await FileSystem.getInfoAsync(path);

        return info.exists;
    }

    public async getAllInDirectory(url: string, type: { new() : ISerializableEntity }) : Promise<ISerializableEntity[]>
    {
        let entries = await FileSystem.readDirectoryAsync(url);
        let arr : ISerializableEntity[] = [];

        for (let i = 0; i < entries.length; i++) {
            arr.push(await this.load(type, url + '/' + entries[i]));
        }

        return arr;
    }

    public async saveMapTile(url: string, x: number, y: number, z: number) : Promise<boolean>
    {
        try {
            await FileSystem.makeDirectoryAsync(PATH_MAPPING.TILE + '/' + z + '/' + x, {
                intermediates: true
            });

            console.log('Downloading ', url, ' to ', PATH_MAPPING.TILE + '/' + z + '/' + x + '/' + y + '.png');

            await FileSystem.downloadAsync(url, PATH_MAPPING.TILE + '/' + z + '/' + x + '/' + y + '.png');
            
            return true;
        } catch {
            return false;
        }
    }

    public getMapTileTemplate()
    {
        return PATH_MAPPING.TILE + '/{z}/{x}/{y}.png';
    }

}

const PATH_MAPPING = {
    DATA:            FileSystem.documentDirectory + "data",
    TRACKING:        FileSystem.documentDirectory + 'data/tracking',
    SPECIES:         FileSystem.documentDirectory + 'data/species',
    COMMON:          FileSystem.documentDirectory + 'data/common',
    TILE_DEFINITION: FileSystem.documentDirectory + 'data/tile',
    TILE:            FileSystem.documentDirectory + 'tile',
    TRACKS:          FileSystem.documentDirectory + "tracks",
};


const FILE_MAPPING = {
    TRACKINGS: PATH_MAPPING.TRACKING + '/tracking.json',
    SPECIES: PATH_MAPPING.TRACKING + '/species.json',
    SYNC: PATH_MAPPING.COMMON + '/sync.json',
    PREFERENCES: PATH_MAPPING.COMMON + '/pref.json',
};

const Storage = new PersistentStorage();

export default Storage;

export { PATH_MAPPING, FILE_MAPPING };