
import * as FileSystem from 'expo-file-system';
import { ISerializableEntity } from '../entities/IEntity';
import EntityFactory from '../entities/EntityFactory';

class PersistentStorage
{

    public async init() : Promise<void> {
        console.log('Creating directories...');
        let exists = await this.fileExists(PATH_MAPPING.DATA);

        if (exists) {
            console.log('Directiores already exist');
        } else {
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

        await data.forEach((x) => {
            arr.push(x.toJson());
        });

        let wrapper = {
            data: arr,
            synchronized: new Date()
        };

        await FileSystem.writeAsStringAsync(path, JSON.stringify(wrapper));
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
    TILE:     FileSystem.documentDirectory + 'tile' // cache dir?
};


const FILE_MAPPING = {
    TRACKINGS: PATH_MAPPING.TRACKING + '/tracking.json'
};

const Storage = new PersistentStorage();

export default Storage;

export { PATH_MAPPING, FILE_MAPPING };