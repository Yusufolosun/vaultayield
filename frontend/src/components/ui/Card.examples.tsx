import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './Card';

export const CardExamples = () => {
    return (
        <div className="p-8 space-y-8 bg-neutral-50 dark:bg-neutral-900 min-h-screen">
            <section className="space-y-4">
                <h2 className="text-xl font-bold">Base Card</h2>
                <Card>
                    <CardContent>
                        This is a base card with default shadow and border.
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Card with Header & Footer</h2>
                <Card>
                    <CardHeader>
                        <h3 className="font-bold">Card Title</h3>
                    </CardHeader>
                    <CardContent>
                        Main content area with default padding.
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-neutral-500">Cancel</button>
                        <button className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg">Action</button>
                    </CardFooter>
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Shadow Variants</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Card shadow="none"><CardContent>No Shadow</CardContent></Card>
                    <Card shadow="sm"><CardContent>Small Shadow</CardContent></Card>
                    <Card shadow="md"><CardContent>Medium Shadow</CardContent></Card>
                    <Card shadow="lg"><CardContent>Large Shadow</CardContent></Card>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Border Variants</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Card border="none"><CardContent>No Border</CardContent></Card>
                    <Card border="subtle"><CardContent>Subtle Border</CardContent></Card>
                    <Card border="vibrant"><CardContent>Vibrant Border</CardContent></Card>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Hover Effect</h2>
                <Card hover>
                    <CardContent>
                        Hover over me to see the scale effect!
                    </CardContent>
                </Card>
            </section>
        </div>
    );
};
