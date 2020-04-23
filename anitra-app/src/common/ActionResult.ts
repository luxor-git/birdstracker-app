/**
 * Result of an action with data.
 *
 * @export
 * @class BaseActionResult
 */
export class BaseActionResult {
    public success: boolean = false;

    public messages: string[] = [];

    public data: any = {};

    constructor(success: boolean) {
        this.success = success;
    }
};

/**
 * Result of an action with data array.
 *
 * @export
 * @class ListActionResult
 * @extends {BaseActionResult}
 * @template T
 */
export class ListActionResult<T> extends BaseActionResult
{
    public data: T[] = [];
};

/**
 * Result of an action with a single entity.
 *
 * @export
 * @class EntityActionResult
 * @extends {BaseActionResult}
 * @template T
 */
export class EntityActionResult<T> extends BaseActionResult
{
    public data: T;
};