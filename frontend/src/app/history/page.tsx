import TransactionList from "@/components/transactions/TransactionList";
import { History, Download } from "lucide-react";

export default function HistoryPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <History className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Activity Log</span>
                    </div>
                    <h1 className="text-4xl font-black text-neutral-900 dark:text-white">Transaction History</h1>
                    <p className="text-neutral-500 mt-2">View and track all your interactions with the VaultaYield protocol.</p>
                </div>

                <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all shadow-sm">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            <div className="space-y-6">
                <TransactionList />
            </div>

            <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800">
                <p className="text-xs text-neutral-400 leading-relaxed text-center">
                    Transactions are fetched in real-time from the Stacks Hiro API.
                    If a transaction doesn't appear immediately, please wait for it to be indexed by the block-explorer.
                </p>
            </div>
        </div>
    );
}
