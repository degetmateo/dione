import { describe, it, expect } from 'vitest';
import { UserSchema } from '../../src/infrastructure/database/schemas/user.schema';
import { CharacterSchema } from '../../src/infrastructure/database/schemas/character.schema';
import { MongooseService } from '../../src/infrastructure/database/mongoose.service';

describe('Mongoose Schemas & Service', () => {
    it('should have correct default fields defined in UserSchema', () => {
        expect(UserSchema.path('_id')).toBeDefined();
        expect(UserSchema.path('renas')).toBeDefined();
        expect(UserSchema.path('gacha.pulls')).toBeDefined();
        expect(UserSchema.path('gacha.claims')).toBeDefined();
    });

    it('should have correct paths in CharacterSchema', () => {
        expect(CharacterSchema.path('_id')).toBeDefined();
        expect(CharacterSchema.path('name')).toBeDefined();
        expect(CharacterSchema.path('favourites')).toBeDefined();
    });

    it('should report disconnected status when not connected', () => {
        expect(MongooseService.status).toBe(false);
    });
});

