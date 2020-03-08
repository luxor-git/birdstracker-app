
import * as FileSystem from 'expo-file-system';
import { ISerializableEntity } from '../entities/IEntity';
import EntityFactory from '../entities/EntityFactory';
import NetStore from '../store/NetStore';

class PersistentStorage
{

    public async init() : Promise<void> {
        console.log('Creating directories...');
        let exists = await this.fileExists(PATH_MAPPING.DATA);

        if (exists) {
            console.log('Directiores already exist');
        } else {
            // todo Object.keys...
            await FileSystem.makeDirectoryAsync(PATH_MAPPING.DATA);
            await FileSystem.makeDirectoryAsync(PATH_MAPPING.TRACKING);
            await FileSystem.makeDirectoryAsync(PATH_MAPPING.SPECIES);
            await FileSystem.makeDirectoryAsync(PATH_MAPPING.TILE);
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

    public async loadCollection(path: string, type: { new() : ISerializableEntity }) : Promise<ISerializableEntity[]>
    {
        console.log("Loading from", path);
        let res = await FileSystem.readAsStringAsync(path);
        let json = JSON.parse(res);

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

            let ent = EntityFactory.create(type);

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
}

const PATH_MAPPING = {
    DATA:     FileSystem.documentDirectory + "data",
    TRACKING: FileSystem.documentDirectory + 'data/tracking',
    SPECIES:  FileSystem.documentDirectory + 'data/species',
    COMMON:   FileSystem.documentDirectory + 'data/common',
    TILE:     FileSystem.documentDirectory + 'tile' // cache dir?
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