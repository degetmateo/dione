export class DatabaseMigrationService {
    public static async execute(): Promise<void> {
        // Schema migrations hooks if needed
    }
}

export default {
    execute: DatabaseMigrationService.execute
};
