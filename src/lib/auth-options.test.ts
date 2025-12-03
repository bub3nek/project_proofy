import { describe, expect, it } from 'vitest';

import { validateAdminCredentials } from './auth-options';

describe('validateAdminCredentials', () => {
    it('validates against defaults', () => {
        expect(validateAdminCredentials('admin@proofy.local', 'proofy123')).toBe(true);
        expect(validateAdminCredentials('wrong@example.com', 'proofy123')).toBe(false);
    });
});
