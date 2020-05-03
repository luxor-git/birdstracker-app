
import * as FileSystem from 'expo-file-system';
import { ISerializableEntity } from '../entities/IEntity';
import EntityFactory from '../entities/EntityFactory';
import NetStore from '../store/NetStore';
import Constants from '../constants/Constants';
import { SyncTask } from './BackgroundSync';

/**
 * Persistent storage class.
 * Saves all entities.
 *
 * @class PersistentStorage
 */
class PersistentStorage
{
 

    /**
     * Initializes folders.
     *
     * @returns {Promise<void>}
     * @memberof PersistentStorage
     */
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


    /**
     * Saves a serializable entity to a given path.
     *
     * @param {string} path
     * @param {ISerializableEntity} data
     * @returns {Promise<void>}
     * @memberof PersistentStorage
     */
    public async save(path: string, data: ISerializableEntity) : Promise<void> {
        await FileSystem.writeAsStringAsync(path, data.toJsonString());
    }

    /**
     * Saves a collection to a given path.
     *
     * @param {string} path
     * @param {ISerializableEntity[]} data
     * @returns {Promise<void>}
     * @memberof PersistentStorage
     */
    public async saveCollection(path: string, data: ISerializableEntity[]) : Promise<void> {
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

    /**
     * Loads a collection from disk.
     *
     * @param {string} path
     * @param {{ new() : ISerializableEntity }} type
     * @param {boolean} [expireCache=false]
     * @returns {Promise<ISerializableEntity[]>}
     * @memberof PersistentStorage
     */
    public async loadCollection(path: string, type: { new() : ISerializableEntity }, expireCache: boolean = false) : Promise<ISerializableEntity[]> {
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

    /**
     * Loads a single entity from disk.
     *
     * @param {{ new() : ISerializableEntity }} type
     * @param {string} path
     * @returns {Promise<ISerializableEntity>}
     * @memberof PersistentStorage
     */
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

    /**
     * Check if file exists.
     *
     * @param {string} path
     * @returns {Promise<boolean>}
     * @memberof PersistentStorage
     */
    public async fileExists(path: string) : Promise<boolean> {
        let info = await FileSystem.getInfoAsync(path);

        return info.exists;
    }

    /**
     * Return all files in a directory.
     *
     * @param {string} url
     * @param {{ new() : ISerializableEntity }} type
     * @returns {Promise<ISerializableEntity[]>}
     * @memberof PersistentStorage
     */
    public async getAllInDirectory(url: string, type: { new() : ISerializableEntity }) : Promise<ISerializableEntity[]>
    {
        let entries = await FileSystem.readDirectoryAsync(url);
        let arr : ISerializableEntity[] = [];

        for (let i = 0; i < entries.length; i++) {
            arr.push(await this.load(type, url + '/' + entries[i]));
        }

        return arr;
    }

    /**
     * Saves a map tile.
     * Map tiles are saved to disk in base64 format.
     *
     * @param {string} url
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {Promise<boolean>}
     * @memberof PersistentStorage
     */
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

    /**
     * Gets tile URL for map.
     *
     * @returns
     * @memberof PersistentStorage
     */
    public getMapTileTemplate()
    {
        return PATH_MAPPING.TILE + '/{z}/{x}/{y}.png';
    }

    /**
     * Deletes files that are safe to delete.
     *
     * @memberof PersistentStorage
     */
    public async deleteSafe()
    {
        for (let i of DELETE_AFTER_LOG_OFF) {
            await FileSystem.deleteAsync(i);
        }
    }

    /**
     * Returns next task name.
     *
     * @returns {string}
     * @memberof PersistentStorage
     */
    public async nextSyncTaskName() : Promise<string>
    {
        return (await FileSystem.readDirectoryAsync(PATH_MAPPING.SYNC_TASKS)).length + '_task.json';
    }

    /**
     *
     *
     * @param {SyncTask} task
     * @memberof PersistentStorage
     */
    public async saveSyncTask(task: SyncTask) : Promise<void>
    {
        await FileSystem.writeAsStringAsync(await this.nextSyncTaskName(), JSON.stringify(task));
    }
    
    /**
     * Returns a list of sync tasks.
     *
     * @returns {Promise<SyncTask[]>}
     * @memberof PersistentStorage
     */
    public async getSyncTasks() : Promise<SyncTask[]>
    {
        const fileNames = await FileSystem.readDirectoryAsync(PATH_MAPPING.SYNC_TASKS);
        let tasks : SyncTask[] = [];

        for (let i = 0; i < fileNames.length; i++) {
            let file = JSON.stringify(await FileSystem.readAsStringAsync(fileNames[i]));
            console.log(file);

            tasks.push({
                fileName: fileNames[i],
                body: file.body,
                method: file.method,
                bodyType: file.bodyType,
                url: file.url,
                savedAt: file.savedAt
            } as SyncTask);
        }

        return tasks;
    }

    /**
     * Deletes a sync task.
     *
     * @param {string} name
     * @returns {Promise<void>}
     * @memberof PersistentStorage
     */
    public async completeSyncTask(task: SyncTask) : Promise<void>
    {
        await FileSystem.deleteAsync(task.fileName);
    }

}

/** Filesystem path mappings */
const PATH_MAPPING = {
    DATA:            FileSystem.documentDirectory + "data",
    TRACKING:        FileSystem.documentDirectory + 'data/tracking',
    SPECIES:         FileSystem.documentDirectory + 'data/species',
    COMMON:          FileSystem.documentDirectory + 'data/common',
    TILE_DEFINITION: FileSystem.documentDirectory + 'data/tile',
    TILE:            FileSystem.documentDirectory + 'tile',
    TRACKS:          FileSystem.documentDirectory + "tracks",
    TRACKING_POINT:  FileSystem.documentDirectory + "data/point",
    SYNC_TASKS:      FileSystem.documentDirectory + "sync"
};

/** Mapping to individual files */
const FILE_MAPPING = {
    TRACKINGS: PATH_MAPPING.TRACKING + '/tracking.json',
    SPECIES: PATH_MAPPING.TRACKING + '/species.json',
    SYNC: PATH_MAPPING.COMMON + '/sync.json',
    PREFERENCES: PATH_MAPPING.COMMON + '/pref.json',
};

const DELETE_AFTER_LOG_OFF = [
    FILE_MAPPING.TRACKINGS
];

const Storage = new PersistentStorage();

export default Storage;

export { PATH_MAPPING, FILE_MAPPING };