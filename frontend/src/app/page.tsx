import VaultStats from "@/components/vault/VaultStats";
import UserBalance from "@/components/vault/UserBalance";
import { ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold mb-6 border border-blue-100 dark:border-blue-800">
          <Zap className="w-3 h-3" />
          MAINNET IS LIVE
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 dark:from-white dark:via-neutral-200 dark:to-white bg-clip-text text-transparent">
          Secure Yield for <br /> Your Bitcoin Capital
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 leading-relaxed">
          The premier non-custodial yield vault on Stacks. <br className="hidden md:block" />
          Deposit STX, earn automated rewards, and grow your Bitcoin-native assets.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/vault/deposit"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group"
          >
            Start Earning Now
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
          <Link
            href="/docs"
            className="w-full sm:w-auto bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-8 py-4 rounded-2xl font-bold transition-all hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center justify-center gap-2"
          >
            Read Technical Spec
          </Link>
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <VaultStats />
          <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Strategy Intelligence
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6">
              VaultaYield utilizes a multi-layered PoX stacking strategy to maximize returns while maintaining strict non-custodial security. Your funds are never at risk of liquidation.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50">
                <span className="text-xs font-bold text-neutral-400 uppercase block mb-1">Current Cycle</span>
                <span className="text-lg font-bold">Cycle #78</span>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50">
                <span className="text-xs font-bold text-neutral-400 uppercase block mb-1">Next Harvest</span>
                <span className="text-lg font-bold">~14 days</span>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <UserBalance />
        </div>
      </section>
    </div>
  );
}
