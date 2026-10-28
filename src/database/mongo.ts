import { CollectionOptions, Db, MongoClient, Collection, Document } from "mongodb";
import migration from "./migration";
import { DatabaseError } from "../core/errors";

class MongoDB {
    private connected: boolean;
    private client: MongoClient;
    public db: Db;
    
    public guilds: Collection<Document>;
    public users: Collection<Document>;
    public characters: Collection<Document>;
    public claims: Collection<Document>;
    public favourites: Collection<Document>;
    public memberships: Collection<Document>;

    constructor () {
        this.connected = false;
        this.client = {} as MongoClient;
        this.db = {} as Db;
        this.guilds = {} as Collection;
        this.users = {} as Collection;
        this.characters = {} as Collection;
        this.claims = {} as Collection;
        this.favourites = {} as Collection;
        this.memberships = {} as Collection;
    }

    async init () {
        try {
            this.client = new MongoClient(process.env.MONGODB_DATABASE_KEY);
            await this.client.connect();
            
            this.db = this.client.db(process.env.MONGODB_DATABASE_NAME);
            this.connected = true;

            this.guilds = this.collection('guilds');
            this.users = this.collection('users');
            this.characters = this.collection('characters');
            this.claims = this.collection('claims');
            this.favourites = this.collection('favourites');
            this.memberships = this.collection('memberships');

            await migration.execute();
            console.log('✅ | MongoDB connected.');
        } catch (error) {
            this.connected = false;
            console.error('🟥 | MongoDB error: ', error);
        }
    }

    collection (collection: string, options?: CollectionOptions) {
        if (!this.connected) {
            throw new DatabaseError('MongoDB no está conectado o se encuentra inaccesible.');
        }
        return this.db.collection(collection, options);
    }
}

const mongo = new MongoDB();
export default mongo;
