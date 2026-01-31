import WithdrawForm from "@/components/vault/WithdrawForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function WithdrawPage() {
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
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Withdraw STX</h1>
                    <p className="text-neutral-500 text-sm">Convert your vySTX shares back to STX capital</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <WithdrawForm />
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-700">
                        <h3 className="text-lg font-bold mb-4">Withdrawal Policy</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    Withdrawals are available during <strong>Unlock Periods</strong> (between stacking cycles).
                                </p>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    A small <strong>0.5% withdrawal fee</strong> applies to cover protocol upkeep.
                                </p>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    When you withdraw, your vySTX shares are burned and STX is returned to your wallet.
                                </p>
                            </li>
                        </ul>
                    </div>

                    <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-2">Wait, Don't Leave!</h4>
                        <p className="text-[13px] text-blue-700 dark:text-blue-300/80 leading-relaxed">
                            Rewards compound every cycle. By keeping your STX in the vault, you benefit from consistent, automated growth without any manual work.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
