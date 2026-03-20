import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { AuroraBackground } from '@/components/ui/aurora-background';
import BranchCard from '../components/BranchCard';

export default function Home() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBranches()
      .then(setBranches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <AuroraBackground className="!h-[90vh] !min-h-[640px] !bg-zinc-950" showRadialGradient>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center text-center px-6 gap-6 max-w-3xl"
        >
          <span className="inline-block font-mono text-[0.68rem] tracking-[0.14em] uppercase text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-5 py-2 rounded-full font-bold">
            4 Locations &middot; 61 Rooms &middot; Accra, Ghana
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-[-0.04em]">
            Your perfect stay,
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              effortlessly booked
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-md leading-relaxed">
            Premium rooms, seamless booking. Select a branch, pick your room, and reserve in seconds.
          </p>

          <div className="flex gap-3 mt-1">
            <a
              href="#branches"
              className="inline-flex items-center h-12 px-7 bg-white text-zinc-900 text-sm font-semibold rounded-full hover:bg-zinc-200 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)]"
            >
              Browse Rooms
            </a>
            <Link
              to="/admin"
              className="inline-flex items-center h-12 px-7 border border-zinc-700 text-zinc-400 text-sm font-semibold rounded-full hover:border-zinc-500 hover:text-white transition-all"
            >
              Admin Portal
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full border-2 border-zinc-600 flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-1 rounded-full bg-zinc-400"
            />
          </div>
        </motion.div>
      </AuroraBackground>

      {/* Features */}
      <div className="features-section">
        <div className="container">
          <div className="page-header">
            <span className="label">Why JCL</span>
            <h1>More than just a room</h1>
            <p>We go the extra mile to make every stay memorable.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3>24/7 Check-in</h3>
              <p>Arrive at any hour — our front desk is always ready to welcome you, day or night.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <h3>4 Prime Locations</h3>
              <p>Strategically located across Accra — Lapaz, Danfa, Spintex, and Teshie for your convenience.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </div>
              <h3>Flexible Payments</h3>
              <p>Pay in full, pay 50% upfront, or settle at check-in — we make it easy for you.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              </div>
              <h3>Comfort First</h3>
              <p>Clean rooms, reliable AC, fast WiFi, and attentive service — the essentials done right.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <h3>Group-Friendly</h3>
              <p>Traveling with family or a team? We have rooms for every group size and budget.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3>Instant Booking</h3>
              <p>No calls, no waiting. Browse, select, and confirm your room in under a minute online.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Branches */}
      <div className="page" id="branches">
        <div className="container">
          <div className="page-header">
            <span className="label">Our Branches</span>
            <h1>Choose your destination</h1>
            <p>Each branch offers a unique experience tailored to your needs.</p>
          </div>
          {loading ? (
            <div className="loading">Loading branches</div>
          ) : (
            <div className="grid grid-2">
              {branches.map((branch) => (
                <BranchCard key={branch.id} branch={branch} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
