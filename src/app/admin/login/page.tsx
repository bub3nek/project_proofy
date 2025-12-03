'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const authError = searchParams.get('error');

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const response = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        setIsSubmitting(false);

        if (response?.error) {
            setError('Invalid credentials. Please try again.');
            return;
        }

        router.push('/admin');
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-dark)]">
            <div className="retro-container max-w-lg w-full">
                <div className="crt-frame p-8 space-y-8">
                    <Link href="/" className="inline-flex items-center text-[var(--neon-cyan)] hover:text-[var(--neon-magenta)] transition">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to site
                    </Link>

                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <Shield size={56} className="text-[var(--neon-cyan)]" />
                        </div>
                        <h1 className="glitch" data-text="ADMIN ACCESS">
                            ADMIN ACCESS
                        </h1>
                        <p className="text-[var(--text-secondary)] font-['VT323'] text-xl">
                            Authorized personnel only. All attempts are logged.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[var(--neon-cyan)] font-['VT323'] text-xl">
                                Email
                            </label>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="admin@proofy.local"
                                className="h-12 text-lg"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[var(--neon-cyan)] font-['VT323'] text-xl">
                                Password
                            </label>
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="••••••••"
                                className="h-12 text-lg"
                            />
                        </div>

                        {(error || authError) && (
                            <p className="text-[var(--neon-pink)] font-['VT323'] text-lg">
                                {error || 'Authentication failed. Please check your credentials.'}
                            </p>
                        )}

                        <Button
                            type="submit"
                            variant="cyan"
                            className="w-full h-12 text-lg font-['Press_Start_2P']"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'VERIFYING...' : 'LOGIN'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
