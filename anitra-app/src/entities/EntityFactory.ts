import { ISerializableEntity } from "./IEntity";
import { Tracking } from "./Tracking";

class EntityFactory {
    public create<T extends ISerializableEntity>(type: { new() : T; }, data : any) : ISerializableEntity
    {
        let obj = new type();
        
        obj.fromJson(
            data
        );

        return obj;
    }
}

const EntityFactoryInstance = new EntityFactory();

export default EntityFactoryInstance;