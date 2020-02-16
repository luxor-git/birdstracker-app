import { IEntity } from './IEntity';

export default class AppNotification implements IEntity
{
    id?: number;

    title: string;
    linkedEntity?: IEntity;
    
    synchronized: boolean;
    lastSynchronized?: Date;
}
