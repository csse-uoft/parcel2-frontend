export class FetcherError extends Error {
    status: number | undefined;
    data: any | undefined;
    constructor(message: string) {
        super(message);
        this.name = "FetcherError";
    }

}