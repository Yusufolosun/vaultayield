import { BookOpen, Shield, Zap, Code, Info } from "lucide-react";

export default function DocsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <section className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600 mb-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Documentation</span>
                </div>
                <h1 className="text-4xl font-black text-neutral-900 dark:text-white">Technical Specification</h1>
                <p className="text-neutral-500 text-lg">Detailed overview of the VaultaYield protocol mechanics and architecture.</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold">Non-Custodial Security</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        VaultaYield operates under a strictly non-custodial model. Users retain full control of their funds. The `vault-core-v1` contract allows partial or full withdrawals during any unlock period, ensuring your capital is always accessible.
                    </p>
                </div>

                <div className="p-8 rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold">Automated Yield</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        By leveraging Stacks' Proof-of-Transfer (PoX) mechanism, VaultaYield automates the stacking process. STX tokens in the vault are stacked to earn Bitcoin (BTC) rewards, which are then converted back to STX and auto-compounded.
                    </p>
                </div>
            </div>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Code className="w-6 h-6 text-neutral-400" />
                    Smart Contracts
                </h2>
                <div className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-700">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Contract Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                            <tr>
                                <td className="px-6 py-4 font-bold text-sm">vault-core-v1</td>
                                <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">The main entry point for deposits, withdrawals, and share management.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-bold text-sm">vault-token</td>
                                <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">SIP-010 compatible token representing your share in the vault.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-bold text-sm">stacking-strategy</td>
                                <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">Handles the integration with PoX and manages stacking cycles.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="flex items-start gap-4 p-6 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <Info className="w-6 h-6 text-neutral-400 shrink-0 mt-1" />
                <div className="space-y-1">
                    <h4 className="font-bold text-neutral-900 dark:text-white">About vySTX</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        vySTX is an interest-bearing token. Its value relative to STX increases over time as the vault earns rewards. One vySTX will always represent a growing amount of STX.
                    </p>
                </div>
            </div>
        </div>
    );
}
