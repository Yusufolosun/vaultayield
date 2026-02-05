import React from 'react';
import { Input } from './Input';

export const InputExamples = () => {
    return (
        <div className="p-8 space-y-8 bg-neutral-50 dark:bg-neutral-900 min-h-screen">
            <section className="space-y-4">
                <h2 className="text-xl font-bold">Input Variants</h2>
                <div className="space-y-4 max-w-md">
                    <Input placeholder="Default Variant" />
                    <Input variant="underline" placeholder="Underline Variant" />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Input Sizes</h2>
                <div className="space-y-4 max-w-md">
                    <Input sizeVariant="sm" placeholder="Small Input" />
                    <Input sizeVariant="md" placeholder="Medium Input" />
                    <Input sizeVariant="lg" placeholder="Large Input" />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">With Labels & Helper Text</h2>
                <div className="space-y-4 max-w-md">
                    <Input
                        label="Email Address"
                        placeholder="you@example.com"
                        helperText="We'll never share your email."
                    />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Validation States</h2>
                <div className="space-y-4 max-w-md">
                    <Input
                        label="Password"
                        error
                        placeholder="••••••••"
                        helperText="Password must be at least 8 characters."
                    />
                    <Input
                        label="Username"
                        success
                        placeholder="yusufolosun"
                        helperText="Username is available!"
                    />
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Disabled State</h2>
                <div className="space-y-4 max-w-md">
                    <Input disabled placeholder="Disabled Input" label="Locked Field" />
                </div>
            </section>
        </div>
    );
};
