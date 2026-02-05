import React from 'react';
import { Button } from './Button';
import { Mail, ArrowRight } from 'lucide-react';

export const ButtonExamples = () => {
    return (
        <div className="p-8 space-y-4">
            <h2 className="text-xl font-bold">Button Variants</h2>
            <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
            </div>

            <h2 className="text-xl font-bold">Button Sizes</h2>
            <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
            </div>

            <h2 className="text-xl font-bold">Loading State</h2>
            <div className="flex flex-wrap gap-4">
                <Button isLoading>Loading</Button>
                <Button variant="outline" isLoading>Outline Loading</Button>
            </div>

            <h2 className="text-xl font-bold">With Icons</h2>
            <div className="flex flex-wrap gap-4">
                <Button leftIcon={<Mail className="w-4 h-4" />}>Email</Button>
                <Button rightIcon={<ArrowRight className="w-4 h-4" />}>Get Started</Button>
            </div>

            <h2 className="text-xl font-bold">Disabled State</h2>
            <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button variant="outline" disabled>Outline Disabled</Button>
            </div>
        </div>
    );
};
