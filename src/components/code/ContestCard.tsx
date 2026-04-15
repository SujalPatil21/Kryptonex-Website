import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import GuestUserModal from "./GuestUserModal"

export interface ContestData {
  id: number
  title: string
  description?: string
  startTime: string
  endTime: string
  status?: string // Upcoming / Live / Ended
}

export default function ContestCard({ contest }: { contest: ContestData }) {
  const navigate = useNavigate();
  const [showGuestModal, setShowGuestModal] = useState(false);
  
  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);

  console.log("NOW:", now);
  console.log("START:", contest.startTime);
  console.log("END:", contest.endTime);

  let status;

  if (now < start) {
    status = "UPCOMING";
  } else if (now >= start && now <= end) {
    status = "LIVE";
  } else {
    status = "ENDED";
  }

  const statusColors: any = {
    UPCOMING: 'border-[#D4AF37]/50 text-[#D4AF37] bg-[#D4AF37]/5',
    LIVE: 'border-[#C1121F]/70 text-[#C1121F] bg-[#C1121F]/10',
    ENDED: 'border-white/15 text-white/40 bg-white/3',
  }

  const colorClass = statusColors[status] || statusColors.ENDED;

  const handleEnterContest = () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setShowGuestModal(true);
      return;
    }
    navigate(`/code/contest/${contest.id}`);
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/5 p-6 hover:border-[#D4AF37]/30 transition-all duration-300">
      <AnimatePresence>
        {showGuestModal && (
          <GuestUserModal 
            onSuccess={(id) => {
              localStorage.setItem("userId", id.toString());
              setShowGuestModal(false);
              navigate(`/code/contest/${contest.id}`);
            }}
            onClose={() => setShowGuestModal(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4">
        <span className={`font-mono text-[10px] tracking-widest px-2 py-1 border uppercase ${colorClass}`}>
          [ {status} ]
        </span>
      </div>
      <h4 className="font-orbitron font-bold text-lg text-white mb-2 uppercase tracking-wide">{contest.title}</h4>
      <p className="font-mono text-[#D4AF37]/60 text-[10px] tracking-widest mb-4 uppercase">
        {start.toLocaleString()} - {end.toLocaleString()}
      </p>
      {contest.description && (
        <p className="font-inter text-white/40 text-sm line-clamp-2 mb-6">{contest.description}</p>
      )}
      
      <button 
        onClick={handleEnterContest}
        className="inline-block mt-4 border border-[#D4AF37]/50 text-[#D4AF37] px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-colors"
      >
        Enter Contest
      </button>
    </div>
  )
}
