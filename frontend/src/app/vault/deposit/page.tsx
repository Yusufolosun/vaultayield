import DepositForm from "@/components/vault/DepositForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function DepositPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/"
                    className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Deposit STX</h1>
                    <p className="text-neutral-500 text-sm">Grow your Bitcoin-native assets passively</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <DepositForm />
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-700">
                        <h3 className="text-lg font-bold mb-4">How it works</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Deposit your STX into the VaultaYield core contract.
                                </p>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    The protocol mints vySTX shares representing your portion of the vault.
                                </p>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Your STX is deployed into PoX Stacking cycles to earn Bitcoin rewards.
                                </p>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">4</div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Rewards are auto-compounded, increasing the value of each vySTX share.
                                </p>
                            </li>
                        </ul>
                    </div>

                    <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
                        <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-2">Security Note</h4>
                        <p className="text-[13px] text-emerald-700 dark:text-emerald-300/80 leading-relaxed">
                            VaultaYield is a non-custodial protocol. You retain full ownership of your capital, and can withdraw during any unlock period.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
