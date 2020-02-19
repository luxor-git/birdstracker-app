export interface IEntity {
    id?: number;

    synchronized: boolean;
    lastSynchronized?: Date;
};

export interface ISerializableEntity extends IEntity {
    toJson() : object;

    toJsonString() : string;

    fromJson(json: any): IEntity;
};