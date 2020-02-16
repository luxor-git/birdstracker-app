import { IEntity } from './IEntity';

export class Tracking implements IEntity
{
    id: number;
    name: string;
    code: string;

    synchronized: boolean = false;
    lastSynchronized?: Date;

    public getName():string {
        return this.name;
    }

};