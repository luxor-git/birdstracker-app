export class BaseActionResult {
    public success: boolean = false;

    public messages: string[] = [];

    constructor(success: boolean) {
        this.success = success;
    }

};