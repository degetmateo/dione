import { CollectionOptions, Db, MongoClient } from "mongodb";

class MongoDB {
    private connected: Boolean;
    private client: MongoClient;
    public db: Db;
    
    constructor () {
        this.connected = false;
        this.client = {} as MongoClient;
        this.db = {} as Db;
    };

    async init () {
        try {
            this.client = new MongoClient(process.env.MONGODB_DATABASE_KEY);
            await this.client.connect();
            this.db = this.client.db(process.env.MONGODB_DATABASE_NAME);
            this.connected = true;
            console.log('✅ | MongoDB connected.');
        } catch (error) {
            this.connected = false;
            console.error('🟥 | MongoDB error: ', error);
        };
    };

    collection (collection: string, options?: CollectionOptions) {
        if (!this.connected) throw new Error('MongoDB not connected.');
        return this.db.collection(collection, options);
    };
};

const mongo = new MongoDB();
export default mongo;