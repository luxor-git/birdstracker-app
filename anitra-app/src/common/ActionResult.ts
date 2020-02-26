export class BaseActionResult {
    public success: boolean = false;

    public messages: string[] = [];

    public data: any = {};

    constructor(success: boolean) {
        this.success = success;
    }
};

export class ListActionResult<T> extends BaseActionResult
{
    public data: T[] = [];
};


export class EntityActionResult<T> extends BaseActionResult
{
    public data: T;
};